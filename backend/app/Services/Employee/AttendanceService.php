<?php

namespace App\Services\Employee;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;

class AttendanceService
{
    //  check in
    public function checkIn($employee)
    {
        $today = Carbon::today();

        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if ($attendance && $attendance->check_in) {
            abort(400, 'Already checked in');
        }

        //  schedule
        $schedule = $employee->workSchedule;

        if (!$schedule) {
            abort(400, 'No work schedule assigned');
        }

        $now = Carbon::now();

        $startTime = Carbon::parse($schedule->start_time);
        $graceEnd = $startTime->copy()->addMinutes($schedule->late_grace_minutes);

        
        if ($now->lessThanOrEqualTo($graceEnd)) {
            $status = 'present';
        } else {
            $status = 'late';
        }

        if (!$attendance) {
            $attendance = Attendance::create([
                'employee_id' => $employee->id,
                'date' => $today,
                'check_in' => $now,
                'status' => $status
            ]);
        } else {
            $attendance->update([
                'check_in' => $now,
                'status' => $status
            ]);
        }

        return $attendance;
    }

    
    public function checkOut($employee)
    {
        $today = Carbon::today();

        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance || !$attendance->check_in) {
            abort(400, 'You must check in first');
        }

        if ($attendance->check_out) {
            abort(400, 'Already checked out');
        }

        $attendance->update([
            'check_out' => now()
        ]);

        return $attendance;
    }

    
    public function getTodayAttendance($employee)
    {
        $today = Carbon::today();
        
        return Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $today)
            ->first();
    }
    
    public function getAttendanceHistory($employee, $request)
    {
        $query = Attendance::where('employee_id', $employee->id)
            ->orderBy('date', 'desc');
            
        // Filter by month if provided
        if ($request->month) {
            $query->whereMonth('date', $request->month);
        }
        
        // Filter by year if provided
        if ($request->year) {
            $query->whereYear('date', $request->year);
        }
        
        return $query->paginate($request->get('per_page', 10));
    }
    
    public function getDepartmentAttendance($manager, $request)
    {
        $query = Attendance::with('employee.user')
            ->whereHas('employee', function ($q) use ($manager) {
                $q->where('department_id', $manager->employee->department_id)
                  ->where('id', '!=', $manager->employee->id);  // Exclude manager's own attendance
            });

        return $query->when($request->date, function ($q) use ($request) {
                $q->whereDate('date', $request->date);
            })
            ->when($request->status, function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->orderBy('date', 'desc')
            ->paginate($request->get('per_page', 10));
    }
}