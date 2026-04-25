<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;


class AuthController extends Controller
{
    public function login(Request $request)
    {
      
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        
        $credentials = $request->only('email', 'password');
        $credentials['status'] = 'active';

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'error' => 'Invalid credentials or inactive user'
            ], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => auth()->user()
        ]);
    }


   
}
