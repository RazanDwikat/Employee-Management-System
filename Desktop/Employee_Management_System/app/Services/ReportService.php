<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Department;
use App\Models\Attendance;
use App\Models\Salary;
use App\Models\Leave;
use Carbon\Carbon;

class ReportService
{
    
    public function employeeReport()
    {
        return Employee::with(['department', 'workSchedule'])
            ->get()
            ->map(function ($emp) {
                return [
                    'id' => $emp->id,
                    'name' => $emp->user->name ?? null,
                    'department' => $emp->department->name ?? null,
                    'role' => $emp->user->role ?? null,
                    'status' => $emp->employment_status,
                    'hire_date' => $emp->hire_date,
                    'schedule' => $emp->workSchedule->name ?? null,
                ];
            });
    }

   
    public function departmentDistribution()
    {
        return Department::withCount('employees')
            ->get()
            ->map(fn($dept) => [
                'department' => $dept->name,
                'employees_count' => $dept->employees_count
            ]);
    }

    
        public function attendanceReport($filters)
    {
        $month = $filters['month'];
        $year = $filters['year'];

        $query = Attendance::with(['employee.user']);

       
        $query->whereMonth('date', $month)
              ->whereYear('date', $year);

       
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

       
        if (!empty($filters['department_id'])) {
            $query->whereHas('employee', function ($q) use ($filters) {
                $q->where('department_id', $filters['department_id']);
            });
        }

        $attendances = $query->get();

       
        $grouped = $attendances->groupBy(function ($item) {
            return Carbon::parse($item->date)->format('Y-m-d');
        });

        $daysInMonth = Carbon::create($year, $month)->daysInMonth;

        $daily = [];

        for ($i = 1; $i <= $daysInMonth; $i++) {

            $date = Carbon::create($year, $month, $i)->format('Y-m-d');

            $records = $grouped[$date] ?? collect();

            $daily[] = [
                'date' => $date,

                'summary' => [
                    'present' => $records->where('status', 'present')->count(),
                    'late' => $records->where('status', 'late')->count(),
                    'absent' => $records->where('status', 'absent')->count(),
                ],

                'employees' => $records->map(function ($att) {
                    return [
                        'employee_id' => $att->employee_id,
                        'name' => $att->employee->user->name ?? null,
                        'status' => $att->status,
                        'check_in' => $att->check_in,
                        'check_out' => $att->check_out,
                    ];
                })->values()
            ];
        }

      
        $lateTrend = $attendances
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

        
        $employeeStats = $attendances->groupBy('employee_id');

        $scores = $employeeStats->map(function ($records) {

            $employee = $records->first()->employee;

            $total = $records->count();
            $present = $records->where('status', 'present')->count();
            $late = $records->where('status', 'late')->count();
            $absent = $records->where('status', 'absent')->count();

          
            $score = ($present * 1) + ($late * 0.5) - ($absent * 1);

            return [
                'employee_id' => $employee->id,
                'name' => $employee->user->name ?? null,

                'stats' => [
                    'total_days' => $total,
                    'present' => $present,
                    'late' => $late,
                    'absent' => $absent,
                ],

                'score' => round($score, 2)
            ];
        })->sortByDesc('score')->values();

        
        return [
            'daily_report' => $daily,
            'late_trend' => $lateTrend,
            'attendance_scores' => $scores,
        ];
    }

   
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
}