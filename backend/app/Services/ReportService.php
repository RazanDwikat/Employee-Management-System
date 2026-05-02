<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Department;
use App\Models\Attendance;
use App\Models\Salary;
use App\Models\Leave;
use App\Http\Resources\Admin\EmployeeResource;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ReportService
{
    const SCORE_PRESENT = 1;
    const SCORE_LATE = 0.5;
    const SCORE_ABSENT = -1;

    // Employee Report 
    public function employeeReport()
    {
        return EmployeeResource::collection(
            Employee::with(['department', 'workSchedule', 'user'])
                ->paginate(3)
        );
    }

    // Department Distribution
    public function departmentDistribution()
    {
        return Department::withCount('employees')
            ->get()
            ->map(fn($dept) => [
                'department' => $dept->name,
                'employees_count' => $dept->employees_count
            ]);
    }

    // Attendance Report
    public function attendanceReport($filters)
    {
        $attendances = $this->getFilteredAttendances($filters);

        return [
            'daily_report' => $this->buildDailyReport($attendances, $filters),
            'late_trend' => $this->buildLateTrend($attendances),
            'attendance_scores' => $this->buildAttendanceScores($attendances),
        ];
    }

    private function getFilteredAttendances($filters)
    {
        $query = Attendance::with(['employee.user'])
            ->whereMonth('date', $filters['month'])
            ->whereYear('date', $filters['year']);

        $query->when($filters['employee_id'] ?? null, function ($q, $id) {
            $q->where('employee_id', $id);
        });

        $query->when($filters['department_id'] ?? null, function ($q, $deptId) {
            $q->whereHas('employee', function ($q2) use ($deptId) {
                $q2->where('department_id', $deptId);
            });
        });

        return $query->get();
    }

    private function buildDailyReport($attendances, $filters)
    {
        $grouped = $attendances->groupBy(fn($item) =>
            Carbon::parse($item->date)->format('Y-m-d')
        );

        $daily = [];

        foreach ($grouped as $date => $records) {
            $daily[] = [
                'date' => $date,
                'summary' => $this->buildSummary($records),
                'employees' => $this->mapEmployees($records),
            ];
        }

        // Sort by date
        usort($daily, function ($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });

        return $daily;
    }

    private function buildSummary($records)
    {
        return [
            'present' => $records->where('status', 'present')->count(),
            'late' => $records->where('status', 'late')->count(),
            'absent' => $records->where('status', 'absent')->count(),
        ];
    }

    private function mapEmployees($records)
    {
        return $records->map(function ($att) {
            return [
                'employee_id' => $att->employee_id,
                'name' => $att->employee->user->name ?? null,
                'status' => $att->status,
                'check_in' => $att->check_in,
                'check_out' => $att->check_out,
            ];
        })->values();
    }

    private function buildLateTrend($attendances)
    {
        return $attendances
            ->where('status', 'late')
            ->groupBy('employee_id')
            ->map(function ($records) {

                $employee = $records->first()->employee;

                return [
                    'employee_id' => $employee->id,
                    'name' => $employee->user->name ?? null,
                    'late_count' => $records->count(),
                ];
            })
            ->sortByDesc('late_count')
            ->values();
    }

    private function buildAttendanceScores($attendances)
    {
        return $attendances->groupBy('employee_id')
            ->map(function ($records) {

                $employee = $records->first()->employee;

                $present = $records->where('status', 'present')->count();
                $late = $records->where('status', 'late')->count();
                $absent = $records->where('status', 'absent')->count();

                $score =
                    ($present * self::SCORE_PRESENT) +
                    ($late * self::SCORE_LATE) +
                    ($absent * self::SCORE_ABSENT);

                return [
                    'employee_id' => $employee->id,
                    'name' => $employee->user->name ?? null,
                    'stats' => [
                        'total_days' => $records->count(),
                        'present' => $present,
                        'late' => $late,
                        'absent' => $absent,
                    ],
                    'score' => round($score, 2),
                ];
            })
            ->sortByDesc('score')
            ->values();
    }

    // Salary Insights
    public function salaryInsights($month, $year)
    {
        $salaries = Salary::where('month', $month)
            ->where('year', $year)
            ->get();

        return [
            'total_salaries' => $salaries->sum('net_salary'),
            'average_salary' => $salaries->avg('net_salary'),
            'highest_salary' => $salaries->max('net_salary'),
            'lowest_salary' => $salaries->min('net_salary'),
        ];
    }

    // Leave Insights
    public function leaveInsights($month, $year)
    {
        $leaves = Leave::whereMonth('start_date', $month)
            ->whereYear('start_date', $year)
            ->get();

        return [
            'total_leaves' => $leaves->count(),
            'approved' => $leaves->where('status', 'approved')->count(),
            'rejected' => $leaves->where('status', 'rejected')->count(),
            'pending' => $leaves->where('status', 'pending')->count(),
        ];
    }

        public function attendanceReportPdf($filters)
    {
        try {
            $data = $this->attendanceReport($filters);

            $pdf = Pdf::loadView('attendance', [
                'data'  => $data,
                'month' => $filters['month'],
                'year'  => $filters['year'],
            ]);

            $pdf->setPaper('A4', 'landscape');

            $filename = "attendance-{$filters['month']}-{$filters['year']}.pdf";
            
            return $pdf->download($filename);
        } catch (\Exception $e) {
            \Log::error('PDF generation error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            throw $e;
        }
    }

    
}