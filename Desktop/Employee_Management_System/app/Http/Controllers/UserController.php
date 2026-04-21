<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\UpdateProfileRequest;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\DeleteUserRequest;
use Illuminate\Database\QueryException;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $service)
    {
        $this->userService = $service;
    }


    public function index(Request $request)
    {
        $filters = $request->only([
            'name',
            'email',
            'role',
            'department_id',
            'employment_status',
            'hire_date'
        ]);

        $perPage = $request->get('per_page', 5);

        $users = $this->userService->getUsers($filters, $perPage);

        return UserResource::collection($users);
    }


    public function show(User $user) 
    {
        return UserResource::make($user->load('employee'));
    }


    public function store(StoreUserRequest $request)
{
        $adminId = auth()->id();

        $user = $this->userService->createUser(
            $request->validated(),
            $adminId
        );

        return response()->json([
            'message' => 'User created successfully',
            'data' => UserResource::make($user)
        ], 201);

}


    public function update(UpdateUserRequest $request, User $user)
    {
        $updatedUser = $this->userService->updateUser(
            $user,
            $request->validated()
        );

        return response()->json([
            'message' => 'User updated successfully',
            'data' => UserResource::make($updatedUser)
        ]);
    }


    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = auth()->user();
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => UserResource::make($user)
        ]);
    }


   public function destroy(DeleteUserRequest $request, $id)
{
    $user = User::findOrFail($id);

    $this->userService->deleteUser(
        $user,
        $request->employment_status
    );

    return response()->json([
        'message' => 'User soft deleted and status updated successfully'
    ]);
}
}