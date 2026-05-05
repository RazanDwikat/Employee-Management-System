<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'action' => 'required|in:approved,rejected',
            'reason' => 'nullable|string|max:255'
        ];
    }
}