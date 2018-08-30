<?php
/**
 * Сообщение об удаленной ссылке
 */
namespace App\Message;
/**
 * Сообщение об удаленной ссылке
 */
class LinkDeletedMessage
{
  /**
   * Id удаленной ссылки
   */
  public $linkId;
  /**
   * Пользоваатель, начавший удаление ссылки
   */
  public $user;

  /**
   * Конструктор сообщения
   * @param int $linkId Id удаленной ссылки
   * @param User $user  Пользоваатель, начавший удаление ссылки
   */
  public function __construct($linkId, $user)
  {
      $this->linkId = $linkId;
      $this->user = $user;
  }
}
