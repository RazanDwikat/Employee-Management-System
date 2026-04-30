<?php

namespace App\Http\Controllers;

use App\Models\LeaveType;
use App\Services\LeaveTypeService;
use App\Http\Requests\Admin\StoreLeaveTypeRequest;
use App\Http\Requests\Admin\UpdateLeaveTypeRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\LeaveTypeResource;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    protected $service;

    public function __construct(LeaveTypeService $service)
    {
        $this->service = $service;
    }

    
    public function index(Request $request)
    {
        // For employee leave types dropdown, return all without pagination
        $leaveTypes = LeaveType::all();
        return LeaveTypeResource::collection($leaveTypes);
    }

    
    public function show($id)
    {
        $leaveType = LeaveType::findOrFail($id);
        return new LeaveTypeResource($leaveType);
    }

    
    public function store(StoreLeaveTypeRequest $request)
    {
        $leaveType = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Leave type created successfully',
            'data' => new LeaveTypeResource($leaveType)
        ], 201);
    }

    
    public function update(UpdateLeaveTypeRequest $request, $id)
    {
        $leaveType = LeaveType::findOrFail($id);

        $leaveType = $this->service->update($leaveType, $request->validated());

        return response()->json([
            'message' => 'Leave type updated successfully',
            'data' => new LeaveTypeResource($leaveType)
        ]);
    }

    
    public function destroy($id)
    {
        $leaveType = LeaveType::findOrFail($id);
        $this->service->delete($leaveType);

        return response()->json([
            'message' => 'Leave type deleted successfully'
        ]);
    }
}