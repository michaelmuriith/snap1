<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['required', 'string', 'in:customer,business,carrier'],
            'vehicle_type' => ['nullable', 'string', 'in:backpack,bike', 'required_if:role,carrier'],
            'bike_reg_number' => ['nullable', 'string', 'required_if:vehicle_type,bike'],
            'id_number' => ['nullable', 'string', 'required_if:vehicle_type,bike'],
            'photo' => ['nullable', 'image', 'max:2048', 'required_if:vehicle_type,bike'],
        ])->validate();

        $photoPath = null;
        if (isset($input['photo']) && $input['photo'] instanceof \Illuminate\Http\UploadedFile) {
            $photoPath = $input['photo']->store('carrier_photos', 'public');
        }

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => $input['role'],
            'vehicle_type' => $input['vehicle_type'] ?? null,
            'bike_reg_number' => $input['bike_reg_number'] ?? null,
            'id_number' => $input['id_number'] ?? null,
            'photo_path' => $photoPath,
        ]);
    }
}
