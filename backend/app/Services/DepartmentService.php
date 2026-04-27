<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;

class DepartmentService
{
    public function getAllDepartments()
    {
       
        
        try {
            $departments = Department::with(['manager.user', 'employees'])
                ->withCount('employees')
                ->get();
            
            $result = $departments->map(function ($department) {
                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'description' => $department->description,
                    'manager' => $department->manager && $department->manager->user ? [
                        'id' => $department->manager->id,
                        'name' => $department->manager->user->name,
                        'email' => $department->manager->user->email
                    ] : null,
                    'employees_count' => $department->employees_count,
                    'created_at' => $department->created_at,
                    'updated_at' => $department->updated_at
                ];
            });
            
            
            
            return $result;
            
        } catch (\Exception $e) {
            \Log::error('Error in DepartmentService::getAllDepartments():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    public function getManagers()
    {
        try {
          
            $managers = Employee::whereHas('user', function ($query) {
                $query->where('role', 'manager');
            })
            ->with('user')
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id, // This is employee_id
                    'name' => $employee->user ? $employee->user->name : null,
                    'email' => $employee->user ? $employee->user->email : null,
                    'employee_number' => $employee->employee_number
                ];
            });

           
            return $managers;

        } catch (\Exception $e) {
            \Log::error('Error in DepartmentService::getManagers():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }
   
    public function createDepartment(array $data)
    {
        try {
          
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

            $result = $department->load('manager');
           
            
            return $result;
            
        } catch (\Exception $e) {
           

            throw $e;
        }
    }

   
    public function assignManager(Department $department, int $managerId)
{
    try {
      

        // Step 1: Remove old manager from current department
        if ($department->manager_id) {
            
            $oldManager = Employee::find($department->manager_id);
            if ($oldManager) {
                $oldManager->update(['department_id' => null]);
              
            }
        }

        // Step 2: Check if new manager is already assigned to another department
        $newManager = Employee::findOrFail($managerId);
        $oldDepartment = Department::where('manager_id', $managerId)->first();
        
        if ($oldDepartment && $oldDepartment->id !== $department->id) {
            
            // Remove manager from old department
            $oldDepartment->update(['manager_id' => null]);
            
            // Set manager's department_id to null (he's now unassigned)
            $newManager->update(['department_id' => null]);
            
           
        }

        // Step 3: Assign new manager to current department
        
        $newManager->update([
            'department_id' => $department->id
        ]);

        // Step 4: Update department with new manager
        $department->update([
            'manager_id' => $managerId
        ]);

        return $department->load('manager');
        
    } catch (\Exception $e) {
        \Log::error('Error in DepartmentService::assignManager():', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        throw $e;
    }
}


   public function updateDepartment(Department $department, array $data)
    {
        $department->update([
            'name' => $data['name'] ?? $department->name,
            'description' => $data['description'] ?? $department->description,
        ]);

        return $department->fresh();
    }

    public function getDepartmentEmployees($departmentId)
    {
        try {
           
            $employees = Employee::where('department_id', $departmentId)
                ->with('user')
                ->get()
                ->map(function ($employee) {
                    return [
                        'id' => $employee->id,
                        'employee_number' => $employee->employee_number,
                        'name' => $employee->user ? $employee->user->name : null,
                        'email' => $employee->user ? $employee->user->email : null,
                        'phone' => $employee->phone,
                        'employment_status' => $employee->employment_status,
                        'hire_date' => $employee->hire_date
                    ];
                });

           

            return $employees;

        } catch (\Exception $e) {
            \Log::error('Error in DepartmentService::getDepartmentEmployees():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    public function deleteDepartment(Department $department)
    {
        // Update manager's department_id to null
        if ($department->manager_id) {
            $manager = Employee::find($department->manager_id);
            if ($manager) {
                $manager->update(['department_id' => null]);
            }
        }

        // Update all employees in this department to have null department_id
        $employees = Employee::where('department_id', $department->id)->get();
        foreach ($employees as $employee) {
            $employee->update(['department_id' => null]);
        }

       

        $department->delete();
    }

    /**
     * Get all employees with user and department relationships
     * @param array $filters - Filters to apply (employment_status, department_id)
     * @param int $perPage - Items per page for pagination
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function getAllEmployees(array $filters = [], int $perPage = 100)
    {
        try {
            $query = Employee::with(['user', 'department']);

            // Apply filters
            if (isset($filters['employment_status'])) {
                $query->where('employment_status', $filters['employment_status']);
            }

            if (isset($filters['department_id'])) {
                $query->where('department_id', $filters['department_id']);
            }

            // Order by employee number
            $query->orderBy('employee_number', 'asc');

            return $query->paginate($perPage);

        } catch (\Exception $e) {
            \Log::error('Error in DepartmentService::getAllEmployees():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

    /**
     * Get specific employee by ID with user and department relationships
     * @param int $id - Employee ID
     * @return Employee
     */
    public function getEmployee(int $id)
    {
        try {
            return Employee::with(['user', 'department'])
                           ->findOrFail($id);

        } catch (\Exception $e) {
            \Log::error('Error in DepartmentService::getEmployee():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }
}