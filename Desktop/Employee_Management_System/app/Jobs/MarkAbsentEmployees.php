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

    $attended = Attendance::whereDate('date', $today)
        ->pluck('employee_id')
        ->toArray();

    $absentEmployees = $employees->whereNotIn('id', $attended);

    foreach ($absentEmployees as $employee) {
        Attendance::create([
            'employee_id' => $employee->id,
            'date' => $today,
            'status' => 'absent'
        ]);
    }
}
}