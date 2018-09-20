<?php

namespace App\Service;
use Symfony\Component\Translation\TranslatorInterface;
use Doctrine\ORM\EntityManagerInterface;
use App\PhotoBank\FileUploaderBundle\Event\FileUploadedEvent;
use App\Entity\Resource;
use App\Entity\CatalogueNodeItem;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Service\ResourceService;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ResourceService{

  private $entityManager;
  private $recordManager;
  private $container;

  public function __construct(
      EntityManagerInterface $entityManager,
      TranslatorInterface $translator,
      Filesystem $fileSystem,
      ContainerInterface $container)
  {
    $this->entityManager = $entityManager;
    $this->translator = $translator;
    $this->fileSystem = $fileSystem;
    $this->container = $container;
  }

  public function generatePath($item_code){
    $splitId = array();
    for($i=0; $i<=strlen($item_code)/2; $i++){
      $splitId[] = substr($item_code, $i*2, 2);
    }
    $splitIdPath = implode('/',$splitId)."/";

    return $splitIdPath;
  }

  public function processCompletedUpload(FileUploadedEvent $event){

    $filepath = $event->getParams()['path'];
    $destinationDir = $this->container->getParameter('fileuploader.desinationdir').$this->generatePath($event->getParams()['item_code']).$event->getParams()['filename'];
    $this->fileSystem->copy($filepath, $destinationDir);
    $this->persistResource($event);
  }

  public function persistResource($event){
    $resource = new Resource();

    $repository = $this->entityManager->getRepository(CatalogueNodeItem::class);
    $item_id = $event->getParams()['item_id'];
    $item_code = $event->getParams()['item_code'];
    $item = $repository->findOneBy( ['itemCode' => $item_code] );
    if (!$item) {
        $error_string = $this->translator->trans("Product not founded",[],'file_uploader') . '. '. $this->translator->trans("The code is:",[],'file_uploader') . ' ' . $item_code ;
        throw new NotFoundHttpException($error_string);
    }

    if(in_array($event->getParams()['extension'],array('jpg','jpeg','png'))){
      $filesizepx = getimagesize($event->getParams()['path']);
      $resource->setSizePx($filesizepx[0].'/'.$filesizepx[1]);
    }

    $resource->setPath($event->getParams()['path']);
    $resource->setUsername($event->getParams()['username']);
    $resource->setItem($item);
    $resource->setSizeBytes($event->getParams()['filesize']);
    $resource->setPreset($event->getParams()['preset']);
    $resource->setChunkPath($event->getParams()['chunkPath']);
    $resource->setFilename($event->getParams()['filename']);
    $resource->setSrcFilename($event->getParams()['src_filename']);
    $resource->setCreatedOn(date('d-m-Y H:i:s'));

    $this->entityManager->persist($resource);
    $this->entityManager->flush($resource);
  }


}
