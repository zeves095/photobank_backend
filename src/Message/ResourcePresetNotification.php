<?php
namespace App\Message;

class ResourcePresetNotification
{
    public $data = '';
    public $resourceId = NULL;
    public $presetId = NULL;
    public $createdOn = NULL;

    public function __construct($data)
    {
        $this->data = $data;
        $this->resourceId = $data['resourceId']??null;
        $this->presetId = $data['presetId']??null;
        $this->createdOn = $data['createdOn']??null;
    }
}
