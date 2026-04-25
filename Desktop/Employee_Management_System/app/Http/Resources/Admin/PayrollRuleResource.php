<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'rule_name' => $this->rule_name,
            'rule_type' => $this->rule_type,
            'calculation_type' => $this->calculation_type,
            'amount' => $this->amount,
            'created_at' => $this->created_at
        ];
    }
}