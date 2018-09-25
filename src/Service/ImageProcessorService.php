<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Resource;
use App\Service\ResourceService;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ContainerInterface;
use \Imagine\Imagick\Imagine;
use \Imagine\Image\Box;
use \Imagine\Image\ImageInterface;

class ImageProcessorService{

  private $entityManager;
  private $container;
  private $resourceService;

  public function __construct(EntityManagerInterface $entityManager, ContainerInterface $container, ResourceService $resourceService){
    $this->entityManager = $entityManager;
    $this->container = $container;
    $this->resourceService = $resourceService;
  }

  public function queue($resourceId, $preset){
    return true;
  }

  public function process($resourceId, $presetName){

    $repository = $this->entityManager->getRepository(Resource::class);
    $resource = $repository->findOneBy(['id'=>$resourceId]);
    $extension = $resource->getExtension();
    $preset = $this->container->getParameter('presets')[$presetName];
    $imageProcessor = new Imagine();
    $size = new Box($preset['width'],$preset['height']);
    $mode = ImageInterface::THUMBNAIL_INSET;
    $targetPath = $this->container->getParameter('upload_directory').'/imgproc/'.$resourceId.'_'.$preset['name'].'.'.$extension;
    $imageProcessor->open($resource->getPath())
    ->thumbnail($size, $mode)
    ->save($targetPath);

    $filename = $this->resourceService->getUniqueIdentifier(file_get_contents($targetPath), $resource->getItem()->getId(),filesize($targetPath)).'.'.$extension;

    $resourceParameters = [
      'item_id' => $resource->getItem(),
      'extension' => $extension,
      'path' => $targetPath,
      'username' => $resource->getUsername(),
      'filesize' => filesize($targetPath),
      'preset' => $preset['id'],
      'chunkPath' => $resource->getChunkPath(),
      'filename' => $filename,
      'src_filename' => $resource->getSrcFilename(),
      'gid' => $resource->getId(),
      'autogenerated'=>true,
      'type'=>4,
    ];

    $this->resourceService->processCompletedUpload($resourceParameters);

    return $targetPath;
  }

}