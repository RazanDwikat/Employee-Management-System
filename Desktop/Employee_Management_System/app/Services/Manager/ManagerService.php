<?php

namespace App\Services\Manager;

use App\Models\Employee;
use App\Models\Department;

class ManagerService
{
    // check if employee in manager department
    private function checkSameDepartment($manager, $employee)
    {
        if ($manager->employee->department_id !== $employee->department_id) {
            abort(403, 'This employee is not in your department');
        }
    }

    //  get department employees
    public function getEmployees($manager)
    {
        return Employee::with('user')
            ->where('department_id', $manager->employee->department_id)
            ->get();
    }

    //  assign employee to department
    public function assignEmployee($manager, $employeeId)
    {
   
        $employee = Employee::findOrFail($employeeId);

        $employee->update([
            'department_id' => $manager->employee->department_id
        ]);

        return $employee->load('user');
    }

    // update work schedule
    public function updateWorkSchedule($manager, $employeeId, $scheduleId)
    {
        $employee = Employee::findOrFail($employeeId);

        $this->checkSameDepartment($manager, $employee);

        $employee->update([
            'work_schedule_id' => $scheduleId
        ]);

        return $employee->load('user');
    }

    // get attendance
    public function getAttendance($manager)
    {
        return Employee::where('department_id', $manager->employee->department_id)
            ->with(['user', 'attendances'])
            ->get();
    }

  
   
}