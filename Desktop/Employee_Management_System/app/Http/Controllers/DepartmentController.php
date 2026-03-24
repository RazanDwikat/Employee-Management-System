<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Services\DepartmentService;
use App\Http\Requests\Admin\StoreDepartmentRequest;
use App\Http\Requests\Admin\AssignManagerRequest;
use App\Http\Requests\Admin\UpdateDepartmentRequest;
use App\Http\Controllers\Controller;
class DepartmentController extends Controller
{
    protected $service;

    public function __construct(DepartmentService $service)
    {
        $this->service = $service;
    }

    
    public function store(StoreDepartmentRequest $request)
    {
        $department = $this->service->createDepartment($request->validated());

        return response()->json([
            'message' => 'Department created successfully',
            'department' => $department
        ], 201);
    }

    // Assign Manager
    public function assignManager(AssignManagerRequest $request, $id)
    {
        $department = Department::findOrFail($id);

        $department = $this->service->assignManager(
            $department,
            $request->manager_id
        );

        return response()->json([
            'message' => 'Manager assigned successfully',
            'department' => $department
        ]);
    }

     public function update(UpdateDepartmentRequest $request, $id)
    {
        $department = Department::findOrFail($id);
        $updated = $this->service->updateDepartment($department, $request->validated());
        return response()->json(['message' => 'Department updated', 'department' => $updated]);
    }

    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        $this->service->deleteDepartment($department);
        return response()->json(['message' => 'Department deleted']);
    }
}