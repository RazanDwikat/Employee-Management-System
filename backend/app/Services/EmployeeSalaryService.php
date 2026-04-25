<?php

namespace App\Services;

use App\Models\EmployeeSalarySetting;



class EmployeeSalaryService
{
    public function setSalary(array $data)
    {
       
        $exists = EmployeeSalarySetting::where('employee_id', $data['employee_id'])
            ->where('effective_from', $data['effective_from'])
            ->exists();

        if ($exists) {
            throw new \Exception('Salary already exists for this date');
        }

        return EmployeeSalarySetting::create($data);
    }

}
