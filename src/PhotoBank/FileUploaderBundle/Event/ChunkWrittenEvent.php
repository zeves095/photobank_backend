<?php

namespace App\PhotoBank\FileUploaderBundle\Event;

use Symfony\Component\EventDispatcher\Event;

class ChunkWrittenEvent extends Event
{
    const NAME = 'fileuploader.chunkwritten';

    protected $params;

    public function __construct($username, $filename, $itemId)
    {
        $this->params = array(
          'username'=> $username,
          'filename'=> $filename,
          'itemId'=> $itemId
        );
    }

    public function getParams()
    {
        return $this->params;
    }
}
