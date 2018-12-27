<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Service\UserService;
use Symfony\Component\HttpFoundation\RequestStack;

class UsermanagerController extends AbstractController
{
    /**
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
     * @Route("/usermanager/get", methods={"GET"}, name="getusers")
     */
    public function getUsers(UserService $userService){
      $response = new JsonResponse();
      $response->setData($userService->getUsers());
      return $response;
    }

    /**
     * @Route("/usermanager/set", methods={"POST"}, name="setuser")
     */
    public function setUser(UserService $userService, RequestStack $requestStack){
      $response = new JsonResponse();
      $request = $requestStack->getCurrentRequest()->request;
      $response->setData($userService->setUser($request->all()));
      return $response;
    }
}
