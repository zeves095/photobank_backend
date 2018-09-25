<?php
namespace App\Exception;

use Symfony\Component\Security\Core\Exception\AccountStatusException;
use Symfony\Component\Translation\TranslatorInterface;

class AccountBlockedException extends AccountStatusException //\RuntimeException
{
    public function getMessageKey()
    {
        return  $this->translator->trans("Account has blocked.",[],'app');
    }
}
