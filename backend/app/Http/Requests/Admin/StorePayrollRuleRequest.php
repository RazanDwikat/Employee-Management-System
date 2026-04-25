<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StorePayrollRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }

    public function rules(): array
    {
        return [
            'rule_name' => 'required|string|unique:payroll_rules,rule_name',
            'rule_type' => 'required|in:late,overtime,absence,leave',
            'calculation_type' => 'required|in:per_minute,per_hour,fixed,per_day',
            'amount' => 'required|numeric|min:0'
        ];
    }
}