<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\MorphTo;

class PayrollAdjustment extends Model
{
    protected $fillable = [
        'employee_id',
        'type',
        'amount',
        'reason',
        'reference_type',
        'reference_id',
        'adjustment_date'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    
    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
