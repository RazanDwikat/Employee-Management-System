<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // التحقق الحقيقي بالسيرفس
    }

    public function rules(): array
    {
        return [
            'action' => 'required|in:approve,reject'
        ];
    }
}