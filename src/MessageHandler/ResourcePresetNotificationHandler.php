<?php
namespace App\MessageHandler;

use Symfony\Component\Messenger\Handler\MessageHandlerInterface;
use Symfony\Component\Messenger\Handler\MessageSubscriberInterface;

use App\Service\ImageProcessorService;

use App\Message\ResourcePresetNotification;

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
        $this->imageProcessor->process($message->data[0], $message->data[1]);
    }
}
