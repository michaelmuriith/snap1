<?php

namespace App\Enums;

enum TransactionType: string
{
    case Earning = 'earning';
    case Withdrawal = 'withdrawal';
}
