<?php

namespace App\PhotoBank\FileUploaderBundle\Event;

use Symfony\Component\EventDispatcher\Event;

class FileUploadedEvent extends Event
{
    const NAME = 'file.uploaded';

    protected $params;

    public function __construct($params)
    {
        $this->params = $params;
    }

    public function getOrder()
    {
        return $this->params;
    }
}
