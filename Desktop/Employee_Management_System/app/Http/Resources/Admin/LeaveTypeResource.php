<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'max_days' => $this->max_days,
            'is_paid' => $this->is_paid,
            'description' => $this->description,
            'created_at' => $this->created_at
        ];
    }
}