<?php
/**
  * Класс ошибки для заблокированного пользователя
  *
  */

namespace App\Exception;

use Symfony\Component\Security\Core\Exception\AccountStatusException;
use Symfony\Component\Translation\TranslatorInterface;

/**
  * Класс ошибки для заблокированного пользователя
  *
  */
class AccountBlockedException extends AccountStatusException //\RuntimeException
{
    /**
      * Сообщение ошибки
      */
    public function getMessageKey()
    {
        return  $this->translator->trans("Account has been blocked.",[],'app');
    }
}
