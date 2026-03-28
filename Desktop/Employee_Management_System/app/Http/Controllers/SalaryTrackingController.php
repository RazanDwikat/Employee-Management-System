<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SalaryService;
use App\Models\Salary;
use App\Models\PayrollAdjustment;
use App\Models\PayrollRule;
use App\Http\Requests\Admin\GenerateSalaryRequest;
use App\Http\Requests\Admin\UpdateSalaryStatusRequest;
use App\Http\Requests\Admin\MySalariesRequest;
use App\Http\Requests\Admin\AddPayrollAdjustmentRequest;
use App\Http\Resources\Admin\SalaryGenerationResource;
use App\Http\Resources\Admin\SalaryResource;
use App\Models\WorkSchedule;
use App\Http\Controllers\Controller;    

class SalaryTrackingController extends Controller
{
    protected $service;

    public function __construct(SalaryService $service)
    {
        $this->service = $service;
    }

   
    public function generate(GenerateSalaryRequest $request)
    {
        $result = $this->service->generateMonthlySalaries(
            $request->month,
            $request->year
        );

        return new SalaryGenerationResource($result);
    }

   
    public function updateStatus(UpdateSalaryStatusRequest $request, $id = null)
    {
        if ($id) {
            $salary = $this->service->updateSalaryStatus($id, $request->status);

            return response()->json([
                'message' => 'Salary status updated',
                'salary' => new SalaryResource($salary),
            ]);
        }

        if (!$request->has('month') || !$request->has('year')) {
            return response()->json([
                'message' => 'month and year are required when updating bulk salary status'
            ], 400);
        }

        $updatedCount = $this->service->bulkUpdateSalaryStatus(
            $request->month,
            $request->year,
            $request->status,
            $request->employee_id ?? null
        );

        return response()->json([
            'message' => 'Bulk salary status updated',
            'updated_count' => $updatedCount,
            'month' => $request->month,
            'year' => $request->year,
            'status' => $request->status,
        ]);
    }

   

    //  Add manual bonus / deduction
    public function addAdjustment(AddPayrollAdjustmentRequest $request)
    {
        $data = $request->validated();

        $adjustment = $this->service->addPayrollAdjustment($data);

        return response()->json([
            'message' => 'Adjustment added successfully',
            'adjustment' => $adjustment
        ], 201);
    }

  

    //  My salaries 
    public function mySalaries(MySalariesRequest $request)
    {
        $employee = auth()->user()->employee;

        $salaries = $this->service->getMySalaries(
            $employee->id,
            $request->month,
            $request->year
        )
        ->paginate(10);

        return SalaryResource::collection($salaries);
    }

    
}