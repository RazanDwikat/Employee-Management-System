<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AddPayrollAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'type' => 'required|in:bonus,deduction',
            'amount' => 'required|numeric|min:0',
            'reason' => 'nullable|string',
            'adjustment_date' => 'required|date'
        ];
    }
}