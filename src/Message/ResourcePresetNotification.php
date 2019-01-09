<?php
/**
 * Сообщение о необходимости создать пресет для ресурса
 */
namespace App\Message;
/**
 * Сообщение о необходимости создать пресет для ресурса
 */
class ResourcePresetNotification
{
  /**
   * Входные данные для создания пресета
   */
    public $data = '';
    /**
     * Id ресурса, для которого необходимо создать пресет
     */
    public $resourceId = NULL;
    /**
     * Id пресета
     */
    public $presetId = NULL;
    /**
     * Дата создания для нового ресурса пресета
     */
    public $createdOn = NULL;

    /**
     * Конструктор класса
     * @param mixed[] $data Входные данные для создания пресета, обязательны поля resourceId и presetId
     */
    public function __construct($data)
    {
        $this->data = $data;
        $this->resourceId = $data['resourceId']??null;
        $this->presetId = $data['presetId']??null;
        $this->createdOn = $data['createdOn']??null;
    }
}
