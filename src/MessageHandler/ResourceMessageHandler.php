<?php
namespace App\MessageHandler;

use Symfony\Component\Messenger\Handler\MessageSubscriberInterface;

use App\Message\ResourcePresetNotification;
use App\Message\LinkCreatedMessage;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ORM\EntityManagerInterface;
use App\Service\ImageProcessorService;
use App\Service\ResourceService;
use App\Service\LinkService;

class ResourceMessageHandler implements MessageSubscriberInterface
{
    private $imageProcessor;
    private $linkService;
    private $container;
    private $resourceService;
    private $entityManager;

    public function __construct(ImageProcessorService $imageProcessor, LinkService $linkService, ContainerInterface $container, ResourceService $resourceService, EntityManagerInterface $entityManager){
      $this->imageProcessor = $imageProcessor;
      $this->linkService = $linkService;
      $this->container = $container;
      $this->resourceService = $resourceService;
      $this->entityManager = $entityManager;
    }

    public static function getHandledMessages(): iterable
    {
        return array(
            ResourcePresetNotification::class => 'processPreset',
            LinkCreatedMessage::class => 'processLink',
        );
    }

    public function processPreset(ResourcePresetNotification $message)
    {
      if($message->resourceId){
        $this->imageProcessor->processPreset($message->resourceId, $message->presetId, $message->createdOn);
      }
    }

    public function processLink(LinkCreatedMessage $message)
    {
      $resource = $message->post['resource'];
      if($resource != ''){
        // $returnParams = [
        //   'path'=>'',
        //   'size_px'=>'',
        //   'size_bytes'=>'',
        // ];
        $filenameSafeUsername = preg_replace('/[^A-Za-z0-9 _ .-]/', '', $message->username);
        if($message->post['custom_size'] != ''){
          //TODO not jpg
          $targetDir = '/'.$this->container->getParameter('link_fs_path').'/'.$filenameSafeUsername.'/'.$message->linkHash.'.jpg';
          $targetPath = $this->container->getParameter('local_file_dir').$targetDir;
          $this->imageProcessor->processCustom($resource, $message->post['custom_size'], $targetPath);
          $returnParams = [
            'path'=>$targetDir,
            'size_px'=>$message->post['custom_size'],
            'size_bytes'=>filesize($targetPath),
          ];
        }else{
          $returnParams = $this->resourceService->getResourceInfo($resource);
        }
        $returnParams['id'] = $message->linkId;
        $this->linkService->updateLink($returnParams);
      }
    }
}
