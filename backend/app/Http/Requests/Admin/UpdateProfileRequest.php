<?php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize()
    {
        return true; 
    }

    public function rules()
    {
        $userId = auth()->id();

        return [
            'name' => 'sometimes|string|max:50',
            'password' => 'sometimes|string|min:8|confirmed',
           
        ];
    }
}