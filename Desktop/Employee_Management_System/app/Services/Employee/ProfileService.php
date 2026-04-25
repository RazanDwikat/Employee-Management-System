<?php

namespace App\Services\Employee;

use Illuminate\Support\Facades\Hash;

class ProfileService
{
    public function updateProfile($user, array $data)
    {
       
        $userData = collect($data)->only(['email', 'password'])->toArray();

        if (isset($userData['password'])) {
            $userData['password'] = Hash::make($userData['password']);
        }

        $user->update($userData);

        if ($user->employee) {
            $employeeData = collect($data)->only(['phone', 'address'])->toArray();
            $user->employee->update($employeeData);
        }

        return $user->load('employee');
    }
}