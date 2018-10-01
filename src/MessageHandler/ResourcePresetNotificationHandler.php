<?php
namespace App\MessageHandler;

use Symfony\Component\Messenger\Handler\MessageSubscriberInterface;

use App\Message\ResourcePresetNotification;

use App\Service\ImageProcessorService;

class ResourcePresetNotificationHandler implements MessageSubscriberInterface
{
    private $imageProcessor;

    public function __construct(ImageProcessorService $imageProcessor){
      $this->imageProcessor = $imageProcessor;
    }

    public static function getHandledMessages(): iterable
    {
        return array(
            ResourcePresetNotification::class => 'process',
        );
    }

    public function process(ResourcePresetNotification $message)
    {
      if($message->resourceId){
        $this->imageProcessor->process($message->resourceId, $message->presetId, $message->createdOn);
      }
    }
}
