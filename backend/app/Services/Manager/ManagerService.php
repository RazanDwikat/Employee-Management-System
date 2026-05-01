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
        return Employee::with(['user', 'department', 'workSchedule'])
            ->where('department_id', $manager->employee->department_id)
            ->where('employment_status', 'active')
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
    
    //  get employees not in manager's department (for assignment)
    public function getEmployeesForAssignment($manager)
    {
        // Start from users table with role = 'employee'
        $users = \App\Models\User::with(['employee', 'employee.department'])
            ->where('role', 'employee') // Get only users with employee role
            ->whereHas('employee', function ($q) use ($manager) {
                $q->where('employment_status', 'active'); // Only active employees
            })
            ->get();

        // Filter employees not in manager's department
        $filteredUsers = $users->filter(function ($user) use ($manager) {
            if (!$user->employee) return false;
            
            $employeeDeptId = $user->employee->department_id;
            $managerDeptId = $manager->employee->department_id;
            
            // Include employees without department OR employees in different departments
            return $employeeDeptId != $managerDeptId;
        });

        $result = $filteredUsers->map(function ($user) {
            // Create clean employee object with user data
            $employee = $user->employee;
            if ($employee) {
                // Create a new object to avoid recursion
                return (object) [
                    'id' => $employee->id,
                    'employee_number' => $employee->employee_number,
                    'phone' => $employee->phone,
                    'address' => $employee->address,
                    'hire_date' => $employee->hire_date,
                    'employment_status' => $employee->employment_status,
                    'work_schedule_id' => $employee->work_schedule_id,
                    'department_id' => $employee->department_id,
                    'created_at' => $employee->created_at,
                    'updated_at' => $employee->updated_at,
                    'user' => (object) [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role
                    ],
                    'department' => $employee->department
                ];
            }
            return null;
        })->filter(); // Remove any null results

        return $result->values(); // Return as array instead of object
    }
    
    // remove employee from department (set department_id to null)
    public function removeEmployee($manager, $employeeId)
    {
        $employee = Employee::findOrFail($employeeId);

        // Check if employee is in manager's department
        if ($employee->department_id != $manager->employee->department_id) {
            abort(403, 'Employee is not in your department');
        }

        // Set department_id to null
        $employee->update([
            'department_id' => null
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

        return $employee->load(['user', 'workSchedule']);
    }

    // get attendance
    public function getAttendance($manager)
    {
        return Employee::where('department_id', $manager->employee->department_id)
            ->where('employment_status', 'active')
            ->with(['user', 'attendances', 'department'])
            ->get();
    }

  
   
}