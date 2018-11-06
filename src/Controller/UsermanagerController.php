<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class UsermanagerController extends AbstractController
{
    /**
     * @Route("/usermanager", name="usermanager")
     */
    public function index()
    {
        return $this->render('usermanager/index.html.twig', [
            'controller_name' => 'UsermanagerController',
        ]);
    }

    public function setUser(){

    }

    public function getUsers(){
      
    }
}
