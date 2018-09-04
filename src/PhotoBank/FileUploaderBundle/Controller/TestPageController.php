<?php

namespace App\PhotoBank\FileUploaderBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class TestPageController extends AbstractController
{
    /**
     * @Route("/testPage", name="test_page")
     */
    public function index()
    {
        return $this->render('/test_page/index.html.twig', [
            'controller_name' => 'TestPageController',
        ]);
    }
}
