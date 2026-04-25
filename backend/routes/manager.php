<?php

use App\Http\Controllers\Manager\ManagerController;
use App\Http\Controllers\Employee\LeaveController;
use App\Http\Controllers\Employee\AttendanceController;

Route::middleware(['auth:api', 'role:manager'])->group(function () {

    Route::get('/manager/employees', [ManagerController::class, 'employees']);

    Route::put('manager/employees/{id}/assign', [ManagerController::class, 'assignEmployee']);

    Route::put('/manager/employees/{id}/schedule', [ManagerController::class, 'updateSchedule']);

    Route::get('/manager/attendance', [ManagerController::class, 'attendance']);

     // Admin or manager routes for leave approval/rejection
    Route::put('/leaves/{id}/status', [LeaveController::class, 'updateStatus']);
    Route::get('/manager/attendance', [AttendanceController::class, 'departmentAttendance']);
       

});