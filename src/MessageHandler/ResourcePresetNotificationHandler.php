<?php
namespace App\MessageHandler;

use Symfony\Component\Messenger\Handler\MessageHandlerInterface;
use Symfony\Component\Messenger\Handler\MessageSubscriberInterface;

use App\Message\ResourcePresetNotification;

class ResourcePresetNotificationHandler implements MessageSubscriberInterface
{
    public static function getHandledMessages(): iterable
    {
        return array(
            ResourcePresetNotification::class => 'process',
        );
    }

    public function process(ResourcePresetNotification $message)
    {
        echo 'p1';
        var_dump($message);
        sleep(10);
        echo 'end 1-----';
    }
}
