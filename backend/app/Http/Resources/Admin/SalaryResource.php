<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee' => $this->when($this->employee, function () {
                return [
                    'id' => $this->employee->id,
                    'user' => $this->when($this->employee->user, function () {
                        return [
                            'id' => $this->employee->user->id,
                            'name' => $this->employee->user->name,
                            'email' => $this->employee->user->email,
                        ];
                    }),
                    'department' => $this->when($this->employee->department, function () {
                        return [
                            'id' => $this->employee->department->id,
                            'name' => $this->employee->department->name,
                        ];
                    }),
                    'employee_number' => $this->employee->employee_number,
                ];
            }),
            'month' => $this->month,
            'year' => $this->year,
            'base_salary' => $this->base_salary,
            'total_bonus' => $this->total_bonus,
            'total_deductions' => $this->total_deductions,
            'net_salary' => $this->net_salary,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'salary_details' => json_decode($this->salary_details, true),
            'adjustments' => $this->whenLoaded('adjustments'),
        ];
    }
}