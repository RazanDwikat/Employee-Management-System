<?php

namespace App\Services;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use App\Events\UserCreated;

class UserService
{
   
    private const EMPLOYEE_FILTERS = [
        'department_id',
        'employment_status',
        'hire_date'
    ];


    public function getUsers(array $filters = [], $perPage)
    {
        $query = User::with(['employee.department']);

        $this->applyFilters($query, $filters);

        return $query->paginate($perPage);
    }

    
    private function applyFilters($query, array $filters)
    {
        foreach ($filters as $field => $value) {
            if (empty($value)) continue;

            if (in_array($field, self::EMPLOYEE_FILTERS)) {
                $query->whereHas('employee', function ($q) use ($field, $value) {
                    if ($field === 'hire_date') {
                        $q->whereDate($field, $value);
                    } else {
                        $q->where($field, $value);
                    }
                });
            } else {
                $query->where($field, 'like', '%' . $value . '%');
            }
        }
    }

    public function createUser(array $data, $adminId)
    {
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        if (in_array($user->role, ['employee', 'manager'])) {
            Employee::create([
                'user_id' => $user->id,
                'employee_number' => $this->generateEmployeeNumber(),
            ]);
        }

        event(new UserCreated($adminId, $user));

        return $user;
    }

   
    private function generateEmployeeNumber()
    {
        return 'EMP-' . uniqid();
    }

   
    public function updateUser(User $user, array $data)
    {
        $userData = collect($data)->only(['name', 'role', 'status'])->toArray();
        $user->update($userData);

        if ($user->employee) {
            $employeeData = collect($data)->only([
                'employee_number',
                'hire_date',
                'employment_status'
            ])->toArray();

            $user->employee->update($employeeData);
        }

        return $user->load('employee');
    }

   
    public function deleteUser(User $user, string $employmentStatus)
{
   
    $user->update([
        'status' => 'inactive'
    ]);

   
    if ($user->employee) {
        $user->employee->update([
            'employment_status' => $employmentStatus
        ]);
    }

    // Soft delete
    $user->delete();
}

}