<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use App\PhotoBank\FileUploaderBundle\Event\FileUploadedEvent;
use App\PhotoBank\FileUploaderBundle\Service\UploadRecordManager;
use App\Service\ResourceService;
use Symfony\Component\Translation\TranslatorInterface;

class FileUploaderSubscriber implements EventSubscriberInterface
{
  private $resourceService;

  public function __construct(ResourceService $resourceService){
    $this->resourceService = $resourceService;
  }

  public static function getSubscribedEvents()
  {
    return array(
     'fileuploader.uploaded' => array('processUpload',0),
    );
  }
  public function processUpload(FileUploadedEvent $event)
  {
    $this->resourceService->processCompletedUpload($event);
  }
}
