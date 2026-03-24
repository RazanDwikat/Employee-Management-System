<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeSalarySetting extends Model
{
    protected $fillable = [
        'employee_id',
        'base_salary',
        'effective_from'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
