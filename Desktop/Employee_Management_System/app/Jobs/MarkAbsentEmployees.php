<?php

namespace App\Jobs;

use App\Models\Employee;
use App\Models\Attendance;
use Carbon\Carbon;

class MarkAbsentEmployees
{
    public function handle(): void
    {
        $today = Carbon::today();

        $employees = Employee::all();

        foreach ($employees as $employee) {

            $exists = Attendance::where('employee_id', $employee->id)
                ->whereDate('date', $today)
                ->exists();

            if (!$exists) {
                Attendance::create([
                    'employee_id' => $employee->id,
                    'date' => $today,
                    'status' => 'absent'
                ]);
            }
        }
    }
}