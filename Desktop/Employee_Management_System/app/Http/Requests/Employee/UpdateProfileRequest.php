<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // محمي بالـ auth middleware
    }

    public function rules(): array
    {
        return [
            'email' => 'sometimes|email|unique:users,email,' . auth()->id(),
            'password' => 'sometimes|string|min:8',

            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:255',
        ];
    }
}