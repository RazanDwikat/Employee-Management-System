<?php
namespace App\Http\Controllers\Employee;

use App\Services\Employee\ProfileService;
use App\Http\Requests\Employee\UpdateProfileRequest;
use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    protected $service;

    public function __construct(ProfileService $service)
    {
        $this->service = $service;
    }

    public function update(UpdateProfileRequest $request)
    {
        $user = auth()->user();

        $user = $this->service->updateProfile(
            $user,
            $request->validated()
        );

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}