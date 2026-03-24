<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'user_id',
        'employee_number',
        'department_id',
        'phone',
        'address',
        'hire_date',
        'employment_status',
        'work_schedule_id',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    

   
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }


    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    // Employee has many Salary records
    public function salaries()
    {
        return $this->hasMany(Salary::class);
    }

    //  Employee belongs to WorkSchedule
    public function workSchedule()
    {
        return $this->belongsTo(WorkSchedule::class);
    }
}