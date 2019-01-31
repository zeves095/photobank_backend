<?php
/**
  * Контроллер для работы с записями о пользователях и рендера страници управления пользователями
  *
  */
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Service\UserService;
use Symfony\Component\HttpFoundation\Request;
use App\Exception\InvalidUserDataException;
use Symfony\Component\HttpKernel\Exception\HttpException;
/**
  * Контроллер для работы с записями о пользователях и рендера страници управления пользователями
  *
  */
class UsermanagerController extends AbstractController
{
    /**
      * Рендерит страницу панели управления пользователями
      *
      * @param ContainerInterface $container Для получения конфигурации
      *
     * @Route("/usermanager", name="usermanager")
     */
    public function index(ContainerInterface $container)
    {
      $config = array(
        'user_get_url' => $container->getParameter('user_get_url'),
        'user_set_url' => $container->getParameter('user_set_url')
      );

      $config_json = json_encode($config);

      return $this->render('usermanager/index.html.twig', [
          'controller_name' => 'UploadController',
          'config' => $config_json
      ]);

    }

    /**
      * Отдает объекты пользователей
      *
      * @param UserService Сервис для работы с записями пользователей
      *
     * @Route("/usermanager/get", methods={"GET"}, name="getusers")
     */
    public function getUsers(UserService $userService){
      $response = new JsonResponse();
      $response->setData($userService->getUsers());
      return $response;
    }

    /**
      * Обновляет запись о пользователе
      *
      * @param UserService Сервис для работы с записями пользователей
      * @param Request Объект текущего запроса
      *
     * @Route("/usermanager/set", methods={"POST"}, name="setuser")
     */
    public function setUser(UserService $userService, Request $request){
      $response = new JsonResponse();
      try{
        $response->setData($userService->setUser($request->request->all()));
      }catch(InvalidUserDataException $e){
        throw new HttpException(400, $e->getMessage());
      }
      return $response;
    }
}
