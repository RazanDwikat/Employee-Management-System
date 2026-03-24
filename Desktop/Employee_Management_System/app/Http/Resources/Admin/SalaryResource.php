<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
    //     dd(
    //     $this->employee,
    //     $this->employee?->user
    // );

        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            
            'employee_name' => $this->employee?->user?->name,
            'base_salary' => $this->base_salary,
            'effective_from' => $this->effective_from,
            'created_at' => $this->created_at,
        ];
        dd($this->employee);
    }
}