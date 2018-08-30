<?php
/**
  * Класс ошибки для заблокированного пользователя
  *
  */

namespace App\Exception;

use Symfony\Component\Security\Core\Exception\AccountStatusException;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Security\Core\Exception\ExceptionInterface;

/**
  * Класс ошибки для заблокированного пользователя
  *
  */
class InvalidFormatException extends \RuntimeException implements ExceptionInterface
{

}
