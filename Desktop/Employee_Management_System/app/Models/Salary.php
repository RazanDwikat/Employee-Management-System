<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    protected $fillable = [
        'employee_id',
        'month',
        'year',
        'base_salary',
        'total_bonus',
        'total_deductions',
        'net_salary',
        'status',
        'salary_details'
    ];

    protected $appends = [
        'formatted',
        'adjustments',
        'rules',
        'full_details'
    ];

    
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    //  Accessors 
    public function getFormattedAttribute()
    {
        return [
            'base_salary' => $this->base_salary,
            'total_bonus' => $this->total_bonus,
            'total_deductions' => $this->total_deductions,
            'net_salary' => $this->net_salary,
            'status' => $this->status,
            'month' => $this->month,
            'year' => $this->year,
        ];
    }

    // adjustments
    public function getAdjustmentsAttribute()
    {
        return PayrollAdjustment::where('employee_id', $this->employee_id)
            ->whereMonth('adjustment_date', $this->month)
            ->whereYear('adjustment_date', $this->year)
            ->get()
            ->map(fn($adj) => [
                'type' => $adj->type,
                'amount' => $adj->amount,
                'reason' => $adj->reason
            ]);
    }

    // rules
    public function getRulesAttribute()
    {
        return PayrollRule::all()->map(fn($rule) => [
            'name' => $rule->rule_name,
            'type' => $rule->rule_type,
            'amount' => $rule->amount,
            'calculation_type' => $rule->calculation_type
        ]);
    }

  
    public function getFullDetailsAttribute()
    {
        return [
            'salary' => $this->formatted,
            'adjustments' => $this->adjustments,
            'rules' => $this->rules
        ];
    }
}