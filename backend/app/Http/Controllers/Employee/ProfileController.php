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

    public function show()
    {
        $user = auth()->user();
        
        return response()->json([
            'user' => $user->load('employee')
        ]);
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

    public function dashboardStats()
    {
        $user = auth()->user();
        $employee = $user->employee;

        // Get current month attendance
        $currentMonthAttendance = $employee->attendances()
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->get();

        // Calculate stats
        $presentDays = $currentMonthAttendance->where('status', 'present')->count();
        $lateDays = $currentMonthAttendance->where('status', 'late')->count();
        $absentDays = $currentMonthAttendance->where('status', 'absent')->count();

        // Get current month leaves
        $currentMonthLeaves = $employee->leaves()
            ->whereMonth('start_date', now()->month)
            ->whereYear('start_date', now()->year)
            ->count();

        // Get today's attendance
        $todayAttendance = $employee->attendances()
            ->whereDate('date', now()->toDateString())
            ->first();

        return response()->json([
            'stats' => [
                'present_days' => $presentDays,
                'late_days' => $lateDays,
                'absent_days' => $absentDays,
                'leaves_this_month' => $currentMonthLeaves,
                'today_status' => $todayAttendance ? $todayAttendance->status : 'not_checked_in',
                'total_work_days' => $currentMonthAttendance->count()
            ]
        ]);
    }
}