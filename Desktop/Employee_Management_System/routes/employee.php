
<?php

use App\Http\Controllers\Employee\ProfileController;
use App\Http\Controllers\Employee\LeaveController;
use App\Http\Controllers\Employee\AttendanceController;
use App\Http\Controllers\SalaryTrackingController;

Route::middleware(['auth:api'])->group(function () {
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/leaves', [LeaveController::class, 'store']);     
    Route::get('/leaves', [LeaveController::class, 'index']);       
    Route::delete('/leaves/{id}', [LeaveController::class, 'cancel']); 
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/my-salaries', [SalaryTrackingController::class, 'mySalaries']);

    
});