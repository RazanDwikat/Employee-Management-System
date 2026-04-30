
<?php

use App\Http\Controllers\Employee\ProfileController;
use App\Http\Controllers\Employee\LeaveController;
use App\Http\Controllers\Employee\AttendanceController;
use App\Http\Controllers\SalaryTrackingController;
use App\Http\Controllers\LeaveTypeController;

Route::middleware(['auth:api'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/leaves', [LeaveController::class, 'store']);     
    Route::get('/leaves', [LeaveController::class, 'index']);       
    Route::delete('/leaves/{id}', [LeaveController::class, 'cancel']); 
    Route::get('/attendance/today', [AttendanceController::class, 'today']);
    Route::get('/attendance/history', [AttendanceController::class, 'history']);
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/my-salaries', [SalaryTrackingController::class, 'mySalaries']);
    Route::get('/dashboard/stats', [ProfileController::class, 'dashboardStats']);
    Route::get('/leave-types', [LeaveTypeController::class, 'index']);


    
});