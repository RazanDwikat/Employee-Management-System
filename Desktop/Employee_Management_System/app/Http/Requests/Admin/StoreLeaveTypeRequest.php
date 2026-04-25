<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreLeaveTypeRequest extends FormRequest
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
            'name' => 'required|string|unique:leave_types,name',
            'max_days' => 'required|integer|min:0',
            'is_paid' => 'required|boolean',
            'description' => 'nullable|string'
        ];
    }
}