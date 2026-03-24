<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SalaryService;
use App\Models\Salary;
use App\Models\PayrollAdjustment;
use App\Http\Requests\Admin\AddPayrollAdjustmentRequest;
use App\Models\WorkSchedule;
use App\Http\Controllers\Controller;    

class SalaryTrackingController extends Controller
{
    protected $service;

    public function __construct(SalaryService $service)
    {
        $this->service = $service;
    }

   
    public function generate(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020'
        ]);

        $salaries = $this->service->generateMonthlySalaries(
            $request->month,
            $request->year
        );

        return response()->json([
            'message' => 'Salaries generated successfully',
            'count' => count($salaries),
            'data' => $salaries
        ]);
    }

   
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:draft,finalized,paid'
        ]);

        $salary = Salary::findOrFail($id);

        $salary->update([
            'status' => $request->status
        ]);

        return response()->json([
            'message' => 'Salary status updated',
            'salary' => $salary
        ]);
    }

   

    //  Add manual bonus / deduction
    public function addAdjustment(AddPayrollAdjustmentRequest $request)
    {
        $data = $request->validated();

        $adjustment = PayrollAdjustment::create([
            'employee_id' => $data['employee_id'],
            'type' => $data['type'],
            'amount' => $data['amount'],
            'reason' => $data['reason'] ?? null,
            'adjustment_date' => $data['adjustment_date']
        ]);

        return response()->json([
            'message' => 'Adjustment added successfully',
            'adjustment' => $adjustment
        ], 201);
    }

  

    //  My salaries 
  public function mySalaries(Request $request)
{
    $employee = auth()->user()->employee;

    $query = Salary::where('employee_id', $employee->id);

    if ($request->month) {
        $query->where('month', $request->month);
    }

    if ($request->year) {
        $query->where('year', $request->year);
    }

    $salaries = $query
        ->orderByDesc('year')
        ->orderByDesc('month')
        ->paginate(10);

    $salaries->getCollection()->transform(function ($salary) {

        return [
            'id' => $salary->id,
            'month' => $salary->month,
            'year' => $salary->year,

            'summary' => [
                'base_salary' => $salary->base_salary,
                'bonus' => $salary->total_bonus,
                'deductions' => $salary->total_deductions,
                'net_salary' => $salary->net_salary,
                'status' => $salary->status,
            ],

            'details' => json_decode($salary->salary_details, true)
        ];
    });

    return response()->json($salaries);
}

    
}