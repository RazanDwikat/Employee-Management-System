<?php

namespace App\Services;

use App\Models\PayrollRule;

class PayrollRuleService
{
    public function create(array $data)
    {
        return PayrollRule::create($data);
    }

    public function update(PayrollRule $rule, array $data)
    {
        $rule->update($data);
        return $rule;
    }

    public function delete(PayrollRule $rule)
    {
        $rule->delete();
    }
}