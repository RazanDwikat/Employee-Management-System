<?php

namespace App\Services\Employee;

use App\Models\Leave;

class LeaveService
{
    public function createLeave($employee, array $data)
    {
        $data['employee_id'] = $employee->id;
        $data['status'] = 'pending';
        
        // Calculate duration
        if (isset($data['start_date']) && isset($data['end_date'])) {
            $start = new \Carbon\Carbon($data['start_date']);
            $end = new \Carbon\Carbon($data['end_date']);
            $data['duration'] = $start->diffInDays($end) + 1;
        }

        return Leave::create($data)->load('leaveType');
    }

   
    public function listLeaves($user, $request)
    {
        $query = Leave::with(['leaveType', 'employee.user', 'employee.department']);

       
        if ($user->role === 'employee') {
            $query->where('employee_id', $user->employee->id);
        }

       
        if ($user->role === 'manager') {
            $query->where('employee_id', $user->employee->id);
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
    public function updateStatus(Leave $leave, $user, string $action, string $reason = null)
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

        $updateData = [
            'status' => $action === 'approve' ? 'approved' : 'rejected',
            'approved_by' => $user->id,
            'approved_at' => now()
        ];

        // Add rejection reason if rejecting
        if ($action === 'reject' && $reason) {
            $updateData['rejection_reason'] = $reason;
        }

        $leave->update($updateData);

        return $leave->load('employee.user', 'leaveType');
    }

    // List department leaves only (exclude manager's own requests)
    public function listDepartmentLeaves($user, $request)
    {
        $query = Leave::with(['leaveType', 'employee.user', 'employee.department']);

        // Only department employees (exclude manager's own requests)
        $query->whereHas('employee', function ($q) use ($user) {
            $q->where('department_id', $user->employee->department_id)
              ->where('id', '!=', $user->employee->id);  // Exclude manager's own requests
        });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $leaves = $query->orderBy('created_at', 'desc')
                     ->paginate($request->get('per_page', 10));
        
                
        return $leaves;
    }
}