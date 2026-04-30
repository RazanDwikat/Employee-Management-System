<?php

namespace App\Http\Controllers\Employee;

use Illuminate\Http\Request;
use App\Services\Employee\AttendanceService;
use App\Http\Controllers\Controller;

class AttendanceController extends Controller
{
    protected $service;

    public function __construct(AttendanceService $service)
    {
        $this->service = $service;
    }

    // Get today's attendance
    public function today()
    {
        $employee = auth()->user()->employee;

        $attendance = $this->service->getTodayAttendance($employee);

        return response()->json($attendance);
    }

    // Get attendance history
    public function history(Request $request)
    {
        $employee = auth()->user()->employee;

        $attendances = $this->service->getAttendanceHistory($employee, $request);

        return response()->json($attendances);
    }

    //  check in
    public function checkIn()
    {
        $employee = auth()->user()->employee;

        $attendance = $this->service->checkIn($employee);

        return response()->json([
            'message' => 'Checked in successfully',
            'attendance' => $attendance
        ]);
    }

    // check out
    public function checkOut()
    {
        $employee = auth()->user()->employee;

        $attendance = $this->service->checkOut($employee);

        return response()->json([
            'message' => 'Checked out successfully',
            'attendance' => $attendance
        ]);
    }

    // manager view
    public function departmentAttendance(Request $request)
    {
        $manager = auth()->user();

        $data = $this->service->getDepartmentAttendance($manager, $request);

        return response()->json($data);
    }
}