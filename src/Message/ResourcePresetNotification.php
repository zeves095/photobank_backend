<?php
namespace App\Message;

class ResourcePresetNotification
{
    public $data = '';

    public function __construct($data)
    {
        $this->data = $data;
    }
}
