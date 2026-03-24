<?php

namespace App\Services;

use App\Models\LeaveType;

class LeaveTypeService
{
    public function create(array $data)
    {
        return LeaveType::create($data);
    }

    public function update(LeaveType $leaveType, array $data)
    {
        $leaveType->update($data);
        return $leaveType;
    }

    public function delete(LeaveType $leaveType)
    {
        $leaveType->delete();
    }
}