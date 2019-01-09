<?php
/**
  * Класс ошибки для пользователя с устаревшим аккаунтом
  *
  */

namespace App\Exception;

use Symfony\Component\Security\Core\Exception\AccountStatusException;
/**
  * Класс ошибки для пользователя с устаревшим аккаунтом
  *
  */
class AccountExpiredException extends AccountStatusException //\RuntimeException
{
  /**
    * Сообщение ошибки
    */
    public function getMessageKey()
    {
        return 'Account has expired.';
    }
}
