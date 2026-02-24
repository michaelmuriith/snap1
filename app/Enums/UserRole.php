<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Customer = 'customer';
    case Business = 'business';
    case Carrier = 'carrier';
}
