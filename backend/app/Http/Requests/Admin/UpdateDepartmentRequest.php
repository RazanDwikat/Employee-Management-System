<?php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $departmentId = $this->route('id');
        return [
            'name' => 'sometimes|string|unique:departments,name,' . $departmentId,
            'description' => 'sometimes|string|nullable',
        ];
    }
}