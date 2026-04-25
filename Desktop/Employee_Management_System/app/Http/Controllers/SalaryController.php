<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\StoreSalaryRequest;
use App\Http\Resources\Admin\SalaryResource;
use App\Services\EmployeeSalaryService;
use App\Http\Requests\Admin\UpdateSalaryRequest;
use App\Http\Controllers\Controller;

class SalaryController extends Controller
{
    protected $service;

    public function __construct(EmployeeSalaryService $service)
    {
        $this->service = $service;
    }

    public function store(StoreSalaryRequest $request)
    {
        try {
            $salary = $this->service->setSalary($request->validated());

            return response()->json([
                'message' => 'Salary created successfully',
                'data' => new SalaryResource($salary)
            ], 201);

        } catch (\Exception $e) {

            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }


    public function update(UpdateSalaryRequest $request, $employeeId){
    try {
        $data = $request->validated();
        $data['employee_id'] = $employeeId;

        $salary = $this->service->setSalary($data);

        return response()->json([
            'message' => 'Salary updated successfully (new record created)',
            'data' => new SalaryResource($salary)
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'message' => $e->getMessage()
        ], 400);
    }
  }
}