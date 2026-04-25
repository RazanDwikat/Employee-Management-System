<?php

use App\Http\Controllers\AuthController;

use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
require __DIR__.'/admin.php';
require __DIR__.'/employee.php';
require __DIR__.'/manager.php';
