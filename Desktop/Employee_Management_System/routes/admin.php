<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\SalaryController;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\PayrollRuleController;
use App\Http\Controllers\WorkScheduleController;
use App\Http\Controllers\Employee\LeaveController;
use App\Http\Controllers\Employee\AttendanceController;
use App\Http\Controllers\SalaryTrackingController;
use App\Http\Controllers\ReportController;

Route::middleware(['auth:api', 'role:admin'])->group(function () {
    //User Management
    Route::get('/users', [UserController::class, 'index']); 
    Route::get('/users/{user}', [UserController::class, 'show']); 
    Route::post('/users', [UserController::class, 'store']); 
    Route::put('/users/{user}', [UserController::class, 'update']); 
    Route::delete('/users/{id}', [UserController::class, 'destroy']); 
    Route::put('/profile', [UserController::class, 'updateProfile']); 
    Route::post('/departments', [DepartmentController::class, 'store']);
    //Department Management
    Route::put('/departments/{id}/assign-manager', [DepartmentController::class, 'assignManager']);
    Route::put('/departments/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);
    //Salary Management
    Route::post('/salaries', [SalaryController::class, 'store']);
    Route::post('/employees/{id}/salary', [SalaryController::class, 'update']);
    // Leave Type Management
    Route::get('/leave-types', [LeaveTypeController::class, 'index']);
    Route::get('/leave-types/{id}', [LeaveTypeController::class, 'show']);
    Route::post('/leave-types', [LeaveTypeController::class, 'store']);
    Route::put('/leave-types/{id}', [LeaveTypeController::class, 'update']);
    Route::delete('/leave-types/{id}', [LeaveTypeController::class, 'destroy']);
    Route::put('/leaves/{id}/status', [LeaveController::class, 'updateStatus']);
    // Payroll Rule Management
    Route::get('/payroll-rules', [PayrollRuleController::class, 'index']);
    Route::get('/payroll-rules/{id}', [PayrollRuleController::class, 'show']);
    Route::post('/payroll-rules', [PayrollRuleController::class, 'store']);
    Route::put('/payroll-rules/{id}', [PayrollRuleController::class, 'update']);
    Route::delete('/payroll-rules/{id}', [PayrollRuleController::class, 'destroy']);
    
    // Work Schedule Management
    Route::get('/work-schedules', [WorkScheduleController::class, 'index']);
    Route::get('/work-schedules/{id}', [WorkScheduleController::class, 'show']);
    Route::post('/work-schedules', [WorkScheduleController::class, 'store']);
    Route::put('/work-schedules/{id}', [WorkScheduleController::class, 'update']);
    Route::delete('/work-schedules/{id}', [WorkScheduleController::class, 'destroy']);
    
    // Salary Tracking
    Route::post('/salaries/generate', [SalaryTrackingController::class, 'generate']);

    Route::put('/salaries/{id}/status', [SalaryTrackingController::class, 'updateStatus']);

    Route::post('/payroll-adjustments', [SalaryTrackingController::class, 'addAdjustment']);
    
   Route::prefix('reports')->group(function () {

    Route::get('/employees', [ReportController::class, 'employees']);
    Route::get('/departments', [ReportController::class, 'departments']);
    Route::get('/attendance', [ReportController::class, 'attendance']);
    Route::get('/salaries', [ReportController::class, 'salaries']);
    Route::get('/leaves', [ReportController::class, 'leaves']);
   });
    

   
});