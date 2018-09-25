<?php
namespace App\Exception;

use Symfony\Component\Security\Core\Exception\AccountStatusException;

class AccountExpiredException extends AccountStatusException //\RuntimeException
{
    public function getMessageKey()
    {
        return 'Account has expired.';
    }
}
