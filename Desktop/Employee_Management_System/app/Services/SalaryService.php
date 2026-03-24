<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\PayrollRule;
use App\Models\EmployeeSalarySetting;
use App\Models\PayrollAdjustment;
use App\Models\Salary;
use Carbon\Carbon;

class SalaryService
{
    public function calculateSalaryForEmployee(Employee $employee, $month, $year)
    {
        $start = Carbon::create($year, $month, 1);
        $end = $start->copy()->endOfMonth();

        // base salary
        $salarySetting = EmployeeSalarySetting::where('employee_id', $employee->id)
            ->where('effective_from', '<=', $start)
            ->orderByDesc('effective_from')
            ->first();

        if (!$salarySetting) {
            abort(400, 'No salary setting found');
        }

        $baseSalary = $salarySetting->base_salary;

        $rules = PayrollRule::all()->keyBy('rule_type');

        $totalBonus = 0;
        $totalDeductions = 0;

        $details = [];

        // ATTENDANCE 
        $attendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('date', [$start, $end])
            ->get();

        foreach ($attendances as $attendance) {

            // ABSENCE
            if ($attendance->status === 'absent') {
                $rule = $rules['absence'] ?? null;

                if ($rule) {
                    $amount = $this->calculateAmount($rule, 1);

                    $totalDeductions += $amount;

                    $details[] = [
                        'type' => 'absence',
                        'date' => $attendance->date,
                        'amount' => $amount,
                        'reason' => 'Absent day'
                    ];
                }
            }

            // LATE
            if ($attendance->check_in) {
                $lateMinutes = $this->calculateLateMinutes($employee, $attendance);

                if ($lateMinutes > 0) {
                    $rule = $rules['late'] ?? null;

                    if ($rule) {
                        $amount = $this->calculateAmount($rule, $lateMinutes);

                        $totalDeductions += $amount;

                        $details[] = [
                            'type' => 'late',
                            'date' => $attendance->date,
                            'minutes' => $lateMinutes,
                            'amount' => $amount,
                            'reason' => "Late by {$lateMinutes} minutes"
                        ];
                    }
                }
            }

            // OVERTIME
            if ($attendance->check_out) {
                $overtimeMinutes = $this->calculateOvertimeMinutes($employee, $attendance);

                if ($overtimeMinutes > 0) {
                    $rule = $rules['overtime'] ?? null;

                    if ($rule) {
                        $amount = $this->calculateAmount($rule, $overtimeMinutes);

                        $totalBonus += $amount;

                        $details[] = [
                            'type' => 'overtime',
                            'date' => $attendance->date,
                            'minutes' => $overtimeMinutes,
                            'amount' => $amount,
                            'reason' => "Overtime {$overtimeMinutes} minutes"
                        ];
                    }
                }
            }
        }

        //  LEAVES 
        $leaves = Leave::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereBetween('start_date', [$start, $end])
            ->with('leaveType')
            ->get();

        foreach ($leaves as $leave) {
            if (!$leave->leaveType->is_paid) {
                $rule = $rules['leave'] ?? null;

                if ($rule) {
                    $days = Carbon::parse($leave->start_date)
                        ->diffInDays(Carbon::parse($leave->end_date)) + 1;

                    $amount = $this->calculateAmount($rule, $days);

                    $totalDeductions += $amount;

                    $details[] = [
                        'type' => 'leave',
                        'from' => $leave->start_date,
                        'to' => $leave->end_date,
                        'days' => $days,
                        'amount' => $amount,
                        'reason' => 'Unpaid leave'
                    ];
                }
            }
        }

        //  MANUAL 
        $adjustments = PayrollAdjustment::where('employee_id', $employee->id)
            ->whereMonth('adjustment_date', $month)
            ->whereYear('adjustment_date', $year)
            ->get();

        foreach ($adjustments as $adj) {

            if ($adj->type === 'bonus') {
                $totalBonus += $adj->amount;
            } else {
                $totalDeductions += $adj->amount;
            }

            $details[] = [
                'type' => $adj->type,
                'date' => $adj->adjustment_date,
                'amount' => $adj->amount,
                'reason' => $adj->reason ?? 'Manual adjustment'
            ];
        }

        $netSalary = $baseSalary + $totalBonus - $totalDeductions;

        return [
            'base_salary' => $baseSalary,
            'total_bonus' => $totalBonus,
            'total_deductions' => $totalDeductions,
            'net_salary' => $netSalary,
            'details' => $details
        ];
    }

    //GENERATE 
    public function generateMonthlySalaries($month, $year)
    {
        $employees = Employee::with('workSchedule')->get();

        $results = [];

        foreach ($employees as $employee) {

            $exists = Salary::where('employee_id', $employee->id)
                ->where('month', $month)
                ->where('year', $year)
                ->exists();

            if ($exists) continue;

            $data = $this->calculateSalaryForEmployee($employee, $month, $year);

            $salary = Salary::create([
                'employee_id' => $employee->id,
                'month' => $month,
                'year' => $year,
                'base_salary' => $data['base_salary'],
                'total_bonus' => $data['total_bonus'],
                'total_deductions' => $data['total_deductions'],
                'net_salary' => $data['net_salary'],
                'salary_details' => json_encode($data['details']),
                'status' => 'draft'
            ]);

            $results[] = $salary;
        }

        return $results;
    }

   
    private function calculateAmount($rule, $value)
    {
        return match ($rule->calculation_type) {
            'per_minute' => $value * $rule->amount,
            'per_hour' => ($value / 60) * $rule->amount,
            'per_day' => $value * $rule->amount,
            'fixed' => $rule->amount,
            default => 0,
        };
    }

    private function calculateLateMinutes($employee, $attendance)
    {
        if (!$employee->workSchedule) return 0;

        $schedule = $employee->workSchedule;

        $start = Carbon::parse($schedule->start_time);
        $graceEnd = $start->copy()->addMinutes($schedule->late_grace_minutes);

        $checkIn = Carbon::parse($attendance->check_in);

        return $checkIn->lessThanOrEqualTo($graceEnd)
            ? 0
            : $checkIn->diffInMinutes($graceEnd);
    }

    private function calculateOvertimeMinutes($employee, $attendance)
    {
        if (!$employee->workSchedule) return 0;

        $schedule = $employee->workSchedule;

        $end = Carbon::parse($schedule->end_time);
        $checkOut = Carbon::parse($attendance->check_out);

        return $checkOut->lessThanOrEqualTo($end)
            ? 0
            : $checkOut->diffInMinutes($end);
    }
}