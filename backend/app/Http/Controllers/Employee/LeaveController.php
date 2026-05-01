<?php

namespace App\Http\Controllers\Employee;

use App\Services\Employee\LeaveService;
use App\Models\Leave;
use App\Http\Requests\Employee\StoreLeaveRequest;
use App\Http\Requests\Employee\UpdateLeaveStatusRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    protected $service;

    public function __construct(LeaveService $service)
    {
        $this->service = $service;
    }

    //  Submit leave
    public function store(StoreLeaveRequest $request)
    {
        $employee = auth()->user()->employee;

        $leave = $this->service->createLeave($employee, $request->validated());

        return response()->json([
            'message' => 'Leave request submitted successfully',
            'leave' => $leave
        ], 201);
    }

    //  List all leaves for employee
    public function index(Request $request)
{
    $user = auth()->user();

    $leaves = $this->service->listLeaves($user, $request);

    return response()->json($leaves);
}

    //  Cancel leave (only if pending)
    public function cancel($id)
    {
        $employee = auth()->user()->employee;

        $leave = Leave::where('employee_id', $employee->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($leave->status !== 'pending') {
            return response()->json([
                'message' => 'Cannot cancel leave that is already approved or rejected.'
            ], 403);
        }

        $leave->delete();

        return response()->json([
            'message' => 'Leave request canceled successfully.'
        ]);
    }

     public function updateStatus(UpdateLeaveStatusRequest $request, $id)
    {
        $user = auth()->user();

        $leave = Leave::with('employee.user')->findOrFail($id);

        $leave = $this->service->updateStatus(
            $leave,
            $user,
            $request->action,
            $request->reason
        );

        return response()->json([
            'message' => 'Leave updated successfully',
            'leave' => $leave
        ]);
    }

    // Get department leaves for manager (exclude manager's own requests)
    public function departmentLeaves(Request $request)
    {
        $user = auth()->user();

        $leaves = $this->service->listDepartmentLeaves($user, $request);

        return response()->json($leaves);
    }
}