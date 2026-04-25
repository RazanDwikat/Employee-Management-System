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
            'email' => 'sometimes|email|unique:users,email,' . $userId,
            'current_password' => 'required_with:password|string',
            'password' => 'sometimes|required_with:current_password|string|min:8|confirmed',
        ];
    }

    public function messages()
    {
        return [
            'current_password.required_with' => 'Current password is required when changing password',
            'password.required_with' => 'New password is required when providing current password',
            'password.confirmed' => 'Password confirmation does not match',
            'email.unique' => 'Email is already taken',
        ];
    }
}