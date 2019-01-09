<?php
/**
 * Сообщение об успешно созданной ссылке
 */

namespace App\Message;
/**
 * Сообщение об успешно созданной ссылке
 */
class LinkCreatedMessage
{
  /**
   * Идентификатор созданной ссылки
   */
  public $linkId;
  /**
   * Уникальная сгенерированная строка-идентификатор для ссылки
   */
  public $linkHash;
  /**
   * Ресурс, для которого создается ссылка
   */
  public $resource;
  /**
   * Размер конечного изображения
   */
  public $custom_size;
  /**
   * Имя пользователя, к которому будет привязана ссылка
   */
  public $username;

  /**
   * Конструктор сообщения
   * @param int $linkId      Идентификатор созданной ссылки
   * @param string $linkHash    Уникальная сгенерированная строка-идентификатор для ссылки
   * @param string $username  Имя пользователя, к которому будет привязана ссылка
   * @param Resource $resource      Ресурс, для которого создается ссылка
   * @param int[] $custom_size Размер конечного изображения
   */
  public function __construct($linkId, $linkHash, $username, $resource, $custom_size)
  {
      $this->resource = $resource;
      $this->custom_size = $custom_size;
      $this->linkId = $linkId;
      $this->linkHash = $linkHash;
      $this->username = $username;
  }
}
