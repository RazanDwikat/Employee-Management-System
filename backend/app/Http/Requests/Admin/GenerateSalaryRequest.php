<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class GenerateSalaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // يتحقق الدور في middleware
    }

    public function rules(): array
    {
        return [
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
        ];
    }
}
