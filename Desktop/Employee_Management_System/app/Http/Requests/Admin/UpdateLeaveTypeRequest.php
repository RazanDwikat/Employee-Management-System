<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeaveTypeRequest extends FormRequest
{
    public function rules(): array
    {
        $id = $this->route('id');

        return [
            'name' => ['sometimes','string', Rule::unique('leave_types')->ignore($id)],
            'max_days' => 'sometimes|integer|min:0',
            'is_paid' => 'sometimes|boolean',
            'description' => 'nullable|string'
        ];
    }
}