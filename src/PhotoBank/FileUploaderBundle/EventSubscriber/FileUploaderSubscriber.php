<?php

namespace App\PhotoBank\FileUploaderBundle\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use App\PhotoBank\FileUploaderBundle\Event\FileUploadedEvent;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Resource;
use App\PhotoBank\FileUploaderBundle\Service\UploadRecordManager;

class FileUploaderSubscriber implements EventSubscriberInterface
{

  private $entityManager;
  private $recordManager;

  public function __construct(EntityManagerInterface $entityManager, UploadRecordManager $recordManager){
    $this->entityManager = $entityManager;
    $this->recordManager = $recordManager;
  }
  public static function getSubscribedEvents()
  {
    return array(
     'fileuploader.uploaded' => array('processUpload',0),
     'fileuploader.chunkwritten' => array('processChunkWrite',0),
    );
  }
  public function processUpload(FileUploadedEvent $event)
  {
    $resource = new Resource();
    $resource->setPath($event->getParams()['path']);
    $resource->setUsername($event->getParams()['username']);
    $resource->setItemId($event->getParams()['item_id']);
    $resource->setPreset($event->getParams()['preset']);
    $resource->setType($event->getParams()['type']);
    $resource->setChunkPath($event->getParams()['chunkPath']);
    $resource->setFilename($event->getParams()['filename']);
    $resource->setSrcFilename($event->getParams()['src_filename']);
    $resource->setCreatedOn(date('d-m-Y H:i:s'));

    $this->entityManager->persist($resource);
    $this->entityManager->flush($resource);
  }

  public function processChunkWrite($event){
    $this->recordManager->update($event);
  }
}