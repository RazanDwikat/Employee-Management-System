<?php

namespace App\Services;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;
use App\Events\UserCreated;
use Illuminate\Database\QueryException;

class UserService
{
   
    private const EMPLOYEE_FILTERS = [
        'department_id',
        'employment_status',
        'hire_date'
    ];


    public function getUsers(array $filters = [], $perPage)
    {
        $query = User::with(['employee.department'])->withTrashed();

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
        try {
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

        } catch (QueryException $e) {

    
        if ($e->errorInfo[1] == 1062) {
           throw new \Exception('Email already exists');
        }

       
        throw new \Exception('Something went wrong');
    }
}

   
    private function generateEmployeeNumber()
    {
        return 'EMP-' . uniqid();
    }

   
    public function updateUser(User $user, array $data)
    {
        \Log::info('Updating user', ['user_id' => $user->id, 'data' => $data]);
        
        $userData = collect($data)->only(['name', 'role', 'status'])->toArray();
        
        // Check if status is being changed to inactive, then apply soft delete
        if (isset($data['status']) && $data['status'] === 'inactive') {
            \Log::info('Status changed to inactive, applying soft delete');
            $this->softDeleteUser($user);
            return $user->fresh()->load('employee');
        }
        
        \Log::info('Normal update, updating user data', ['userData' => $userData]);
        $user->update($userData);

        if ($user->employee) {
            $employeeData = collect($data)->only([
                'employee_number',
                'hire_date',
                'employment_status'
            ])->toArray();

            \Log::info('Updating employee data', ['employeeData' => $employeeData]);
            $user->employee->update($employeeData);
        }

        return $user->load('employee');
    }

    public function updateProfile(User $user, array $data)
    {
        try {
            \Log::info('UserService - Update Profile:', [
                'user_id' => $user->id,
                'current_name' => $user->name,
                'request_data' => $data
            ]);

            // Verify current password if user wants to change password
            if (isset($data['current_password'])) {
                if (!Hash::check($data['current_password'], $user->password)) {
                    throw new \Exception('Current password is incorrect');
                }
                // Remove current_password from data array (don't store it)
                unset($data['current_password']);
            }

            // Hash new password if provided
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            // Update user directly
            $user->name = $data['name'] ?? $user->name;
            $user->email = $data['email'] ?? $user->email;
            if (isset($data['password'])) {
                $user->password = $data['password'];
            }

            $saved = $user->save();

            \Log::info('UserService - Update Profile Result:', [
                'saved' => $saved,
                'new_name' => $user->name,
                'new_email' => $user->email,
                'user_from_db' => User::find($user->id)->toArray()
            ]);

            return $user->fresh();

        } catch (\Exception $e) {
            \Log::error('UserService - Update Profile Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e;
        }
    }

   
    public function deleteUser(User $user, string $employmentStatus)
{
    $this->softDeleteUser($user, $employmentStatus);
}

private function softDeleteUser(User $user, string $employmentStatus = 'resigned')
{
    \Log::info('Soft deleting user', ['user_id' => $user->id, 'employment_status' => $employmentStatus]);
    
    $user->update([
        'status' => 'inactive'
    ]);

    if ($user->employee) {
        \Log::info('Updating employee employment status');
        $user->employee->update([
            'employment_status' => $employmentStatus
        ]);
    }

    \Log::info('Calling soft delete');
    $user->delete();
    
    \Log::info('User soft deleted successfully');
}

public function reactivateUser(User $user)
{
    \Log::info('Reactivating user', ['user_id' => $user->id]);
    
    $user->update([
        'status' => 'active'
    ]);

    if ($user->employee) {
        $user->employee->update([
            'employment_status' => 'active'
        ]);
    }

    $user->restore();
    
    \Log::info('User reactivated successfully');
    return $user->load('employee');
}

}