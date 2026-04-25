<?php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    public function authorize()
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

    public function rules()
{
    return [
        'name' => 'sometimes|string|max:50',
        'role' => 'sometimes|in:admin,manager,employee',
        'status' => 'sometimes|in:active,inactive',

       
        'employee_number' => 'sometimes|string',
        'hire_date' => 'sometimes|date',
        'employment_status' => 'sometimes|in:active,resigned,terminated',
    ];
}
}