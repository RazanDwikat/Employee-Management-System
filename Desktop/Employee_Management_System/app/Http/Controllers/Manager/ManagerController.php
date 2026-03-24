<?php

namespace App\Http\Controllers\Manager;

use Illuminate\Http\Request;
use App\Services\Manager\ManagerService;
use App\Http\Controllers\Controller;

class ManagerController extends Controller
{
    protected $service;

    public function __construct(ManagerService $service)
    {
        $this->service = $service;
    }

    //  employees in my department
    public function employees()
    {
        $manager = auth()->user();

        $employees = $this->service->getEmployees($manager)->except($manager->employee->id);

        return response()->json([
            'employees' => $employees
        ]);

        
    }

    // assign employee to my department
    public function assignEmployee(Request $request , $id)
    {
       

        $manager = auth()->user();

        $employee = $this->service->assignEmployee(
            $manager,
            $request->id
        );

        return response()->json([
            'message' => 'Employee assigned to your department',
            'employee' => $employee
        ]);
    }

    // update work schedule
    public function updateSchedule(Request $request, $id)
    {
        $request->validate([
            'work_schedule_id' => 'required|exists:work_schedules,id'
        ]);

        $manager = auth()->user();

        $employee = $this->service->updateWorkSchedule(
            $manager,
            $id,
            $request->work_schedule_id
        );

        return response()->json([
            'message' => 'Work schedule updated',
            'employee' => $employee
        ]);
    }

    // attendance
    public function attendance()
    {
        $manager = auth()->user();

        $data = $this->service->getAttendance($manager)->except($manager->employee->id);

        return response()->json([
            'attendance' => $data
        ]);
    }

   
}