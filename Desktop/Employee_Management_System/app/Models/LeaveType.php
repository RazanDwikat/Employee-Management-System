<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveType extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'max_days',
        'is_paid',
        'description'
    ];

    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }
}
