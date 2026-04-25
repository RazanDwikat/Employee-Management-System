<?php

namespace App\Services\Employee;

use App\Models\Leave;

class LeaveService
{
    public function createLeave($employee, array $data)
    {
        $data['employee_id'] = $employee->id;
        $data['status'] = 'pending';

        return Leave::create($data)->load('leaveType');
    }

   
    public function listLeaves($user, $request)
    {
        $query = Leave::with(['leaveType', 'employee.user']);

       
        if ($user->role === 'employee') {
            $query->where('employee_id', $user->employee->id);
        }

       
        if ($user->role === 'manager') {
            $query->where(function ($q) use ($user) {
                $q->where('employee_id', $user->employee->id)
                  ->orWhereHas('employee', function ($q2) use ($user) {
                      $q2->where('department_id', $user->employee->department_id);
                  });
            });
        }

        
        if ($user->role === 'admin') {
            $query->whereHas('employee.user', function ($q) {
                $q->where('role', 'manager');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query->orderBy('created_at', 'desc')
                     ->paginate($request->get('per_page', 10));
    }

    //  approve / reject
    public function updateStatus(Leave $leave, $user, string $action)
    {
        $employeeRole = $leave->employee->user->role;

        if (
            ($employeeRole === 'employee' && $user->role !== 'manager') ||
            ($employeeRole === 'manager' && $user->role !== 'admin')
        ) {
            abort(403, 'You are not authorized to perform this action');
        }

        if ($leave->status !== 'pending') {
            abort(400, 'Leave already processed');
        }

        $leave->update([
            'status' => $action === 'approve' ? 'approved' : 'rejected',
            'approved_by' => $user->id,
            'approved_at' => now()
        ]);

        return $leave->load('employee.user', 'leaveType');
    }
}