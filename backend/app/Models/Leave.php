<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Leave extends Model
{
    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'description',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Calculate duration dynamically
    public function getDurationAttribute($value)
    {
        if ($value) {
            return $value;
        }
        
        if ($this->start_date && $this->end_date) {
            $start = \Carbon\Carbon::parse($this->start_date);
            $end = \Carbon\Carbon::parse($this->end_date);
            return $start->diffInDays($end) + 1;
        }
        
        return null;
    }

    
}
