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
            'adjustments' => $this->adjustments,
        ];
    }
}