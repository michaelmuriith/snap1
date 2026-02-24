<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('order'));
    }

    public function rules(): array
    {
        return [
            'status' => 'required|string|in:pending,accepted,picked_up,in_transit,delivered,conflict',
            'confirmation_code' => 'sometimes|string|nullable',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'A status is required to update the order.',
            'status.in' => 'The provided status is invalid.',
        ];
    }
}
