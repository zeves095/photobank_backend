<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @Route("/account")
 */

class AccountController extends AbstractController
{
    /**
     * @Route("/", name="account")
     */
    public function index()
    {
        $user = $this->getUser();
        return $this->render('account/index.html.twig', [
            'controller_name' => 'AccountController',
            'user_id' => $user->getId(),
            'user_name' => $user->getUsername(),
            'user_email' => $user->getEmail(),
            'user_active' => $user->getIsActive(),
            'user_password' => $user->getPassword(),
            'user_role' => $user->getRoles()[0],
        ]);
    }

    /**
     * @Route("/getinfo/", name="account_getinfo")
     */
    public function getUserInfo()
    {
        $user = $this->getUser();
        $response = new JsonResponse();
        $payload = [
            'user_id' => $user->getId(),
            'user_name' => $user->getUsername(),
            'user_email' => $user->getEmail(),
            'user_active' => $user->getIsActive(),
            'user_password' => $user->getPassword(),
            'user_roles' => $user->getRoles(),
          ];
      $response->setData($payload);
      return $response;
    }
}
