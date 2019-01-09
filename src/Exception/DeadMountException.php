<?php
/**
  * Класс ошибки в случае, когда отваливается маунт директории с загрузками
  *
  */

namespace App\Exception;

use Symfony\Component\Security\Core\Exception\AccountStatusException;
/**
  * Класс ошибки в случае, когда отваливается маунт директории с загрузками
  *
  */
class DeadMountException extends RuntimeException
{
  /**
    * Сообщение ошибки
    */
    public function getMessageKey()
    {
        return  "Target filesystem unresponsive";
    }
}
