<?php
/**
  * Контроллер для аутентификации пользователей
  */
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
/**
  * Контроллер для аутентификации пользователей
  */
class SecurityController extends AbstractController
{
    /**
      * Рендерит страницу авторизации
      *
      * @param AuthenticationUtils $authenticationUtils Для работы с авторизацией в системе
      *
     * @Route("/login", name="login")
     */
    public function login(AuthenticationUtils $authenticationUtils)
    {
        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', array(
            'last_username' => $lastUsername,
            'error'         => $error,
        ));
    }
}
