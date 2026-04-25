<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;

class DepartmentService
{
   
       
    public function createDepartment(array $data)
    {
        
        $department = Department::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'manager_id' => $data['manager_id'] ?? null, 
        ]);

       
        if (isset($data['manager_id'])) {
            $employee = Employee::findOrFail($data['manager_id']); // employees.id
            $employee->update([
                'department_id' => $department->id
            ]);
        }

        return $department->load('manager'); 
    }

   
    public function assignManager(Department $department, int $managerId){
   
    if ($department->manager_id) {
        $oldManager = Employee::find($department->manager_id);
        if ($oldManager) {
            $oldManager->update(['department_id' => null]);
        }
    }

    
    $employee = Employee::findOrFail($managerId);
    $employee->update([
        'department_id' => $department->id
    ]);

    
    $department->update([
        'manager_id' => $managerId
    ]);

    return $department->load('manager');
   }


   public function updateDepartment(Department $department, array $data)
    {
        $department->update([
            'name' => $data['name'] ?? $department->name,
            'description' => $data['description'] ?? $department->description,
        ]);

        return $department->fresh();
    }

    public function deleteDepartment(Department $department)
    {
    
        if ($department->manager_id) {
            $manager = Employee::find($department->manager_id);
            if ($manager) {
                $manager->update(['department_id' => null]);
            }
        }

        
        $department->delete();
    }
}