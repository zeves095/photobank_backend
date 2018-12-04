<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class AccountController extends AbstractController
{
    /**
     * @Route("/account", name="account")
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
}
