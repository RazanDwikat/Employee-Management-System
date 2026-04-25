<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePayrollRuleRequest extends FormRequest
{
    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'rule_name' => ['sometimes','string', Rule::unique('payroll_rules')->ignore($id)],
            'rule_type' => 'sometimes|in:late,overtime,absence,leave',
            'calculation_type' => 'sometimes|in:per_minute,per_hour,fixed',
            'amount' => 'sometimes|numeric|min:0'
        ];
    }
}