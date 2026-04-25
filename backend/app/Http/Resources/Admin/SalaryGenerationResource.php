<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Admin\SalaryResource;
use App\Http\Resources\Admin\PayrollRuleResource;

class SalaryGenerationResource extends JsonResource
{
    public function toArray($request): array
    {
        $generated = $this->resource['generated'] ?? [];
        $rules = $this->resource['rules'] ?? [];
        $errors = $this->resource['errors'] ?? [];

        return [
            'message' => 'Salaries generation completed',
            'generated_count' => count($generated),
            'errors_count' => count($errors),
            'generated' => SalaryResource::collection($generated),
            'rules' => PayrollRuleResource::collection($rules),
            'errors' => $errors,
        ];
    }
}
