<?php
/**
 * Обработчик сообщений, связанных с сущностями типа Resource
 */
namespace App\MessageHandler;

use Symfony\Component\Messenger\Handler\MessageSubscriberInterface;

use App\Message\ResourcePresetNotification;
use App\Message\LinkCreatedMessage;
use App\Message\LinkDeletedMessage;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\ImageProcessorService;
use App\Service\ResourceService;
use App\Service\LinkService;
/**
* Обработчик сообщений, связанных с сущностями типа Resource
*/
class ResourceMessageHandler implements MessageSubscriberInterface
{
    /**
    * Сервис для работы с изображениями
    */
      private $imageProcessor;
      /**
      * Сервис для работы с сущностями типа Link
      */
      private $linkService;
      /**
      * Сервис-контейнер Symfony
      */
      private $container;
      /**
      * Сервис для работы с сущностями типа Resource
      */
      private $resourceService;
      /**
      * Инструмент работы с сущностями Doctrine ORM
      */
      private $entityManager;

      /**
      * Конструктор класса
      * @param ImageProcessorService  $imageProcessor  Сервис для работы с изображениями
      * @param LinkService            $linkService     Сервис для работы с сущностями типа Link
      * @param ContainerInterface     $container       Сервис-контейнер Symfony
      * @param ResourceService        $resourceService Сервис для работы с сущностями типа Resource
      * @param EntityManagerInterface $entityManager   Инструмент работы с сущностями Doctrine ORM
      */
    public function __construct(ImageProcessorService $imageProcessor, LinkService $linkService, ContainerInterface $container, ResourceService $resourceService, EntityManagerInterface $entityManager){
      $this->imageProcessor = $imageProcessor;
      $this->linkService = $linkService;
      $this->container = $container;
      $this->resourceService = $resourceService;
      $this->entityManager = $entityManager;
    }

    /**
     * Присваивает сообщениям соответвующие метода
     */
    public static function getHandledMessages(): iterable
    {
        return array(
            ResourcePresetNotification::class => 'processPreset',
            LinkCreatedMessage::class => 'processLink',
            LinkDeletedMessage::class => 'processLinkDelete',
        );
    }

    /**
     * Создает пресет для конкретного ресурса
     * @param ResourcePresetNotification $message Сообщение с информацией, необходимой для создания ресурса. Если createdOn в сообщении не будет выставлено, далее будет поставлено текущее время.
     */
    public function processPreset(ResourcePresetNotification $message)
    {
      if($message->resourceId && $message->presetId){
        $this->imageProcessor->processPreset($message->resourceId, $message->presetId, $message->createdOn);
      }
    }

    /**
     * Создает ссылку для конкретного ресурса
     * @param  LinkCreatedMessage $message Сообщение с инфомацией для создания ссылки
     */
    public function processLink(LinkCreatedMessage $message)
    {
      $resource = $message->resource;
      if($resource != ''){
        $filenameSafeUsername = preg_replace('/[^A-Za-z0-9 _ .-]/', '', $message->username);
        if($message->custom_size != ''){
          //TODO not jpg
          $targetDir = '/'.$this->container->getParameter('link_fs_path').'/'.$filenameSafeUsername.'/'.$message->linkHash.'.jpg';
          $targetPath = $this->container->getParameter('local_file_dir').$targetDir;
          $this->imageProcessor->processCustom($resource, $message->custom_size, $targetPath);
          $returnParams = [
            'path'=>$targetDir,
            'size_px'=>$message->custom_size,
            'size_bytes'=>filesize($targetPath),
            'symlink'=>false
          ];
        }else{
          $returnParams = $this->resourceService->getResourceInfo($resource);
        }
        $returnParams['id'] = $message->linkId;
        $this->linkService->updateLink($returnParams);
      }
    }

    /**
     * Удаляет ссылку
     * @param  LinkDeletedMessage $message Сообщение с информацией для удаления ссылки
     */
    public function processLinkDelete(LinkDeletedMessage $message)
    {
      $id = $message->linkId;
      $user = $message->user;
      $this->linkService->deleteLink($id, $user);
    }
}
