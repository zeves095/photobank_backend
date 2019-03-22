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
     * @Route("/{placeholder}/", name="app", requirements={"placeholder"="(upload|account|usermanager)?"})
     */
    public function index()
    {
        return $this->render('app/index.html.twig',[]);
    }

}
