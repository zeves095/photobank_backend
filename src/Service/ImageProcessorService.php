<?php
/**
  * Сервис для работы с генерацией изображений
  */
namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Resource;
use App\Service\ResourceService;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ContainerInterface;
use \Imagine\Imagick\Imagine;
use \Imagine\Image\Box;
use \Imagine\Image\ImageInterface;
use \Imagine\Filter\Advanced\Border;
use \Imagine\Image\Palette\Color\ColorInterface;
use \Imagine\Filter\Basic\Crop;
use \Imagine\Image\Point;
use \Imagine\Filter\Advanced\OnPixelBased;
use \Imagine\Filter\Advanced\Canvas;
use \Imagine\Filter\Basic\Thumbnail;


/**
  * Сервис для работы с генерацией изображений
  */
class ImageProcessorService{

  /**
  * Инструмент работы с сущностями Doctrine ORM
  */
private $entityManager;
  /**
  * Сервис-контейнер Symfony
  */
private $container;
/**
 * Сервис для работы с сущностями типа Resource
 */
  private $resourceService;
  /**
  * Сервис работы с файловой системой Symfony
  */
private $fileSystem;

  /**
   * Конструктор класса
   * @param EntityManagerInterface $entityManager   Инструмент для работы с сущностями Doctrine ORM
   * @param ContainerInterface     $container       Сервис-контейнер Symfony
   * @param ResourceService        $resourceService Сервис для работы с сущностями типа Resource
   * @param Filesystem             $fileSystem      Сервис работы с файловой системой Symfony
   */
  public function __construct(EntityManagerInterface $entityManager, ContainerInterface $container, ResourceService $resourceService, Filesystem $fileSystem)
  {
    $this->entityManager = $entityManager;
    $this->container = $container;
    $this->resourceService = $resourceService;
    $this->fileSystem = $fileSystem;
  }

  /**
    * Запускает процесс генерации пресета для конкретного ресурса
    *
    * @param int $resourceId Идентификатор ресурса для обработки
    * @param int $presetId Идентификатор пресета
    *
    */
  public function processPreset($resourceId, $presetId)
  {

    $repository = $this->entityManager->getRepository(Resource::class);
    $processed = $repository->findBy(['gid'=>$resourceId]);
    $resource = $repository->findOneBy(['id'=>$resourceId]);

    $processedPresets = array();
    foreach($processed as $p){
      array_push($processedPresets, $p->getPreset());
    }
    if(!in_array($presetId, $processedPresets)){
      $this->_savePreset($resource,$presetId);
    }

    return true;
  }

  /**
    * Определяет параметры генерации изображения не по пресету, а с отдельно заданными шириной и высотой. В результате не создается новый ресурс.
    *
    * @param int $id Идентификатор ресурса для обработки
    * @param mixed[] $size_px Размер сгенерированного изображения в формате [ширина, высота]
    * @param string $targetPath Путь к конечному файлу
    *
    */
  public function processCustom($id, $size_px, $targetPath)
  {
      $resource = $this->entityManager->getRepository(Resource::class)->findOneBy([
        'id'=>$id
      ]);
      $size_px = explode('/', $size_px);
      $params = [
        'width'=>$size_px[0],
        'height'=>$size_px[1],
        'source'=>$this->container->getParameter('upload_directory').$resource->getPath(),
        'target'=>$targetPath,
        'mode'=>1
      ];
      $this->_generateImage($params);
  }

  /**
    * Определяет параметры генерации изображения по пресету и создания нового ресурса.
    *
    * @param Resource $resource Идентификатор ресурса для обработки
    * @param int $presetId Размер сгенерированного изображения в формате [ширина, высота]
    * @param mixed $createdOn Дата создания ресурса
    *
    */
  private function _savePreset($resource, $presetId, $createdOn = NULL)
  {
    $extension = $resource->getExtension();
    foreach($this->container->getParameter('presets') as $p){
      if($p['id'] == $presetId){
        $preset = $p;
      }
    }
    $processorDirectory = $this->container->getParameter('upload_directory').'/imgproc/';
    $targetPath = $processorDirectory.$resource->getId().'_'.$preset['name'].'.'.'jpeg';
    $this->_generateImage([
      'width'=>$preset['width'],
      'height'=>$preset['height'],
      'source'=>$this->container->getParameter('upload_directory').$resource->getPath(),
      'target'=>$targetPath,
      'mode'=>1
    ]);

    $parentEntityId = $resource->getItem()?$resource->getItem()->getId():$resource->getGarbageNode()->getId();
    $filename = $this->resourceService->getUniqueIdentifier(file_get_contents($targetPath), $parentEntityId,filesize($targetPath)).'.'.$extension;

    $resourceParameters = [
      'item_id' => $parentEntityId,
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
      'created_on'=>$createdOn
    ];

    $this->resourceService->processCompletedUpload($resourceParameters);
    $this->fileSystem->remove($targetPath);
  }


  /**
    * Создает изображение на основе существующего файла и входных параметров с помощью ImageMagick
    *
    * @param mixed[] $params Параметры генерации. Включают в себя путь к источнику, конечному файлу, размеру и режиму генерации
    *
    */
  private function _generateImage($params)
  {
    $imageProcessor = new Imagine();

    $processorDirectory = $this->container->getParameter('upload_directory').'/imgproc/';
    if(!$this->fileSystem->exists($processorDirectory)){$this->fileSystem->mkDir($processorDirectory);}
    if(!$this->fileSystem->exists(dirname($params['target']))){$this->fileSystem->mkDir(dirname($params['target']));}

    $image = $imageProcessor->open($params['source']);

    $targetSize = [$params['width'],$params['height']];

    $imgSize = $this->_getImageDimentions($image);

    $imgRatio = $imgSize[0]/$imgSize[1];
    $targetRatio = $targetSize[0]/$targetSize[1];

    if($imgRatio !== $targetRatio){
      $image = $this->_fixRatio($image, $targetRatio, $imageProcessor);
    }

    $retImg = $this->_getThumbnail($image, $targetSize, $params['mode']);

    $retImg->save($params['target']);
  }

private function _getThumbnail($image, $targetSize)
  {
    $size = new Box($targetSize[0], $targetSize[1]);
    $thumb = new Thumbnail($size);
    $image = $thumb->apply($image);
    return $image;
  }

function _growMargins($image, $interface, $size, $placement)
{
  $palette = new \Imagine\Image\Palette\RGB();
  $color = new \Imagine\Image\Palette\Color\RGB($palette, [255,255,255], 100);

  $tempImg = $image->copy();

  $box = new Box($size[0], $size[1]);

  $imgSize = $this->_getImageDimentions($tempImg);

  if($imgSize[0]<$size[0]){
    $growAxis = 0;
  }elseif($imgSize[1]<$size[1]){
    $growAxis = 1;
  }

  $start = new Point($placement[0], $placement[1]);

  $b = new Canvas($interface, $box, $start, $color);
  return $b->apply($tempImg);
}

private function _isImageWhite($image)
{
  $avg = 255;
  $counter = 0;
  $step = 15;
  $onpixel = new OnPixelBased(function($i, $p) use (&$avg, &$counter, $step) {
    if($counter%$step!=0){return;}
    $color = $i->getColorAt($p);
    $localAvg = ($color->getValue(ColorInterface::COLOR_RED) + $color->getValue(ColorInterface::COLOR_GREEN) + $color->getValue(ColorInterface::COLOR_BLUE))/3;
    $avg = (int)(($avg+$localAvg)/2);
  });
  $onpixel->apply($image);
  return $avg === 255;
}

private function _cropMargin($image, $size, $returnMargin=false, $index=0)
{

  $tempImg = $image->copy();
  $imgSize = $this->_getImageDimentions($tempImg);
  $cropSize = $imgSize;

  if($imgSize[0]>$size[0]){
    $cropAxis = 0;
  }elseif($imgSize[1]>$size[1]){
    $cropAxis = 1;
  }

  $startCoords = [[0,0],[0,0]];
  $cropSize[$cropAxis] = ($imgSize[$cropAxis]-$size[$cropAxis])/2;
  $startCoords[1][$cropAxis] = $imgSize[$cropAxis]-$cropSize[$cropAxis];
  if(!$returnMargin){
    $startCoords[0][$cropAxis] = $cropSize[$cropAxis];
    $cropSize[$cropAxis] = $size[$cropAxis];
  }

  $cropBox = new Box($cropSize[0], $cropSize[1]);
  $start = new Point($startCoords[$index][0],$startCoords[$index][1]);
  $cropf = new Crop($start, $cropBox);

  return $cropf->apply($tempImg);
}

private function _areMarginsWhite($image, $targetSize)
{
  $margins = [$this->_cropMargin($image, $targetSize,true, 0), $this->_cropMargin($image, $targetSize,true, 1)];
  return $this->_isImageWhite($margins[0])&&$this->_isImageWhite($margins[1]);
}

private function _getImageDimentions($image)
{
  $imagePath = $this->_getImagePath($image);
  $imgSize = getimagesize($imagePath);
  return [$imgSize[0],$imgSize[1]];
}

private function _getImagePath($image)
{
  $meta = $image->metadata()->toArray();
  $path = $meta['filepath'];
  return $path;
}

private function _fixRatio($image, $ratio, $interface)
{
  $imgSize = $this->_getImageDimentions($image);
  $targetSize = $imgSize;
  $currentRatio = $imgSize[0]/$imgSize[1];
  $fixAxis = (int)($ratio>$currentRatio);
  if($fixAxis===0){
    $targetSize[0] = $imgSize[1]*$ratio;
  }elseif($fixAxis===1){
    $targetSize[1] = $imgSize[0]/$ratio;
  }
  $marginsWhite = $this->_areMarginsWhite($image, $targetSize);
  if($marginsWhite){
    return $this->_cropMargin($image, $targetSize);
  }else{
    $targetSize = $imgSize;
    $fixAxis = $fixAxis===1?0:1;
    if($fixAxis===0){
      $targetSize[0] = $imgSize[0]*($ratio/$currentRatio);
    }elseif($fixAxis===1){
      $targetSize[1] = $imgSize[1]/($ratio/$currentRatio);
    }
    $placement = [0,0];
    $placement[$fixAxis] = ($targetSize[$fixAxis] - $imgSize[$fixAxis])/2;
    return $this->_growMargins($image, $interface, $targetSize, $placement);
  }
}

}
