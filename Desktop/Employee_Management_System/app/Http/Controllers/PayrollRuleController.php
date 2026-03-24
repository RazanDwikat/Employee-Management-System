<?php

namespace App\Http\Controllers;

use App\Models\PayrollRule;
use App\Services\PayrollRuleService;
use App\Http\Requests\Admin\StorePayrollRuleRequest;
use App\Http\Requests\Admin\UpdatePayrollRuleRequest;
use App\Http\Resources\Admin\PayrollRuleResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PayrollRuleController extends Controller
{
    protected $service;

    public function __construct(PayrollRuleService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $rules = PayrollRule::paginate(5);
        return PayrollRuleResource::collection($rules);
    }

    
    public function show($id)
    {
        $rule = PayrollRule::findOrFail($id);
        return new PayrollRuleResource($rule);
    }

    
    public function store(StorePayrollRuleRequest $request)
    {
        $rule = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Payroll rule created successfully',
            'data' => new PayrollRuleResource($rule)
        ], 201);
    }

    
    public function update(UpdatePayrollRuleRequest $request, $id)
    {
        $rule = PayrollRule::findOrFail($id);

        $rule = $this->service->update($rule, $request->validated());

        return response()->json([
            'message' => 'Payroll rule updated successfully',
            'data' => new PayrollRuleResource($rule)
        ]);
    }

    
    public function destroy($id)
    {
        $rule = PayrollRule::findOrFail($id);
        $this->service->delete($rule);

        return response()->json([
            'message' => 'Payroll rule deleted successfully'
        ]);
    }
}