<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollRule extends Model
{
    protected $fillable = [
        'rule_name',
        'rule_type',
        'calculation_type',
        'amount'
    ];
}
