<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkSchedule extends Model
{
    protected $fillable = [
        'name',
        'start_time',
        'end_time',
        'late_grace_minutes'
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
