<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Order::class);
    }

    public function rules(): array
    {
        return [
            'description' => 'required|string|max:255',
            'pickup_address' => 'required|string|max:255',
            'delivery_address' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'distance' => 'required|numeric|min:0.1',
            'carrier_type' => 'required|in:backpack,bike',
        ];
    }

    public function messages(): array
    {
        return [
            'description.required' => 'Please provide a description of the item(s) being delivered.',
            'pickup_address.required' => 'A pickup address is required.',
            'delivery_address.required' => 'A delivery address is required.',
        ];
    }
}
