<?php
/**
 * This file is only for debug purpose only (in production shoukd to deactivate it)
 *
 * @todo: config/prod - set autoconfigure to Off.
 */
namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;
/**
 * This file is only for debug purpose only (in production shoukd to deactivate it)
 */
class AjaxProfilerSubscriber implements EventSubscriberInterface
{
  /**
   * Присваивает ключам сообщений соответсвующие методы
   */
  public static function getSubscribedEvents()
  {
    return array(
        KernelEvents::RESPONSE . '_' => array(
            array('onKernelResponse')
        )
    );
  }

  /**
   * Обновляет меню разработчика после AJAX-запросов
   * @param  FilterResponseEvent $event Событие, по которому должен сработать обработчик
   */
  public function onKernelResponse(FilterResponseEvent $event)
  {
    $response = $event->getResponse();
    $response->headers->set('Symfony-Debug-Toolbar-Replace', 1);
  }

}
