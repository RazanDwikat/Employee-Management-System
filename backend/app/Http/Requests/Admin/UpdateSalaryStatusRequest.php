<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSalaryStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:draft,finalized,paid',
            'month' => 'sometimes|integer|min:1|max:12',
            'year' => 'sometimes|integer|min:2020',
            'employee_id' => 'sometimes|integer|exists:employees,id',
        ];
    }
}
