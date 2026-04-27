<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Services\DepartmentService;
use App\Http\Requests\Admin\StoreDepartmentRequest;
use App\Http\Requests\Admin\AssignManagerRequest;
use App\Http\Requests\Admin\UpdateDepartmentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
class DepartmentController extends Controller
{
    protected $service;

    public function __construct(DepartmentService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        
        try {
            $departments = $this->service->getAllDepartments();
            
            return response()->json([
                'message' => 'Departments retrieved successfully',
                'departments' => $departments
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in DepartmentController::index():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve departments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getDepartmentEmployees($id)
    {
        try {
            $employees = $this->service->getDepartmentEmployees($id);
            
            return response()->json([
                'message' => 'Department employees retrieved successfully',
                'employees' => $employees
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in DepartmentController::getDepartmentEmployees():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve department employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getManagers()
    {
        try {
          
            $managers = $this->service->getManagers();

            return response()->json([
                'message' => 'Managers retrieved successfully',
                'managers' => $managers
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in DepartmentController::getManagers():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to retrieve managers',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function store(StoreDepartmentRequest $request)
    {
       
        try {
            $department = $this->service->createDepartment($request->validated());
            
            return response()->json([
                'message' => 'Department created successfully',
                'department' => $department
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Error in DepartmentController::store():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to create department',
                'error' => $e->getMessage()
            ], 500);
        }
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

    // Get all employees with user and department relationships
    public function getAllEmployees(Request $request)
    {
        try {
            $filters = $request->only(['employment_status', 'department_id']);
            $perPage = $request->get('per_page', 100);
            
            $employees = $this->service->getAllEmployees($filters, $perPage);
            
            return response()->json($employees);
            
        } catch (\Exception $e) {
            \Log::error('Error in DepartmentController::getAllEmployees():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve employees',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get specific employee by ID
    public function getEmployee($id)
    {
        try {
            $employee = $this->service->getEmployee($id);
            
            return response()->json($employee);
            
        } catch (\Exception $e) {
            \Log::error('Error in DepartmentController::getEmployee():', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve employee',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}