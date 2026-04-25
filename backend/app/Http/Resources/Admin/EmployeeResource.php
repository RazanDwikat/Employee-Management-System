<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->user->name ?? null,
            'department' => $this->department->name ?? null,
            'role' => $this->user->role ?? null,
            'status' => $this->employment_status,
            'hire_date' => $this->hire_date,
            'schedule' => $this->workSchedule->name ?? null,
        ];
    }
}