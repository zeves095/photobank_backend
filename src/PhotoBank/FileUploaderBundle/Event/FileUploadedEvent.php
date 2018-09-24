<?php

namespace App\PhotoBank\FileUploaderBundle\Event;

use Symfony\Component\EventDispatcher\Event;

class FileUploadedEvent extends Event
{
    const NAME = 'fileuploader.uploaded';

    protected $params;

    public function __construct($params)
    {

        $this->params = $params;
    }

    public function getParams()
    {
        return $this->params;
    }

    public function setParam($param, $value)
    {
      $this->params[$param] = $value;
    }
}
