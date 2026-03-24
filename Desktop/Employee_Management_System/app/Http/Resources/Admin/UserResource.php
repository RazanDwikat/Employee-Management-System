<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $employee = $this->employee;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'employee' => $employee ? [
                'employee_number' => $employee->employee_number,
                'department_id' => $employee->department_id,
                'phone' => $employee->phone,
                'address' => $employee->address,
                'hire_date' => $employee->hire_date,
                'employment_status' => $employee->employment_status,
                'work_schedule_id' => $employee->work_schedule_id,
            ] : null,
        ];
    }
}
