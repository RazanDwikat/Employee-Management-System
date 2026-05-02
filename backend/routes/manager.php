<?php

use App\Http\Controllers\Manager\ManagerController;
use App\Http\Controllers\Employee\LeaveController;
use App\Http\Controllers\Employee\AttendanceController;
use App\Http\Controllers\WorkScheduleController;

Route::middleware(['auth:api', 'role:manager'])->group(function () {

    Route::get('/manager/employees', [ManagerController::class, 'employees']);

    Route::get('/manager/employees/available-for-assignment', [ManagerController::class, 'getEmployeesForAssignment']);

    Route::put('manager/employees/{id}/assign', [ManagerController::class, 'assignEmployee']);

    Route::delete('manager/employees/{id}/assign', [ManagerController::class, 'removeEmployee']);

    Route::put('/manager/employees/{id}/schedule', [ManagerController::class, 'updateSchedule']);

    Route::get('/manager/attendance', [ManagerController::class, 'attendance']);

    // Work schedules for manager
    Route::get('/manager/work-schedules', [WorkScheduleController::class, 'index']);
    Route::get('/department-leaves', [LeaveController::class, 'departmentLeaves']);

     // Admin or manager routes for leave approval/rejection
    Route::put('/leaves/{id}/status', [LeaveController::class, 'updateStatus']);
    Route::get('/manager/attendance', [AttendanceController::class, 'departmentAttendance']);
       

});