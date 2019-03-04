<?php
/**
  * Базовый контроллер приложения. Тут редиректы и тесты
  *
  */
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

use Symfony\Component\HttpFoundation\Response;
use App\Message\ResourcePresetNotification;
use Symfony\Component\Messenger\MessageBusInterface;
/**
  * Базовый контроллер приложения. Тут редиректы и тесты
  *
  */
class BaseController extends AbstractController
{
    /**
      * Перекидывает на интерфейс загрузки
      *
     * @Route("/{placeholder}/", name="index", requirements={"placeholder"="(upload|account|usermanager)?"})
     */
    public function index()
    {
        return $this->render('app/index.html.twig',[]);
    }

    /**
      * Тестовый эндпойнт.
      *
      * @param MessageBusInterface $bus Сервис работы с компонентом messenger
      *
     * @Route("/test", name="test")
     */
    public function test(MessageBusInterface $bus)
    {
        $bus->dispatch(new ResourcePresetNotification('need new resource preset 200x300'));
        return new Response('<html><body>done</body></html>');
        // return $this->render('test_page/test.html.twig');
    }
}
