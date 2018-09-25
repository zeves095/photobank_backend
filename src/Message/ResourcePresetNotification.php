<?php
namespace App\Message;

class ResourcePresetNotification
{
    public $data = '';

    public function __cunstruct($data)
    {
        $this->data = $data;
    }
}
