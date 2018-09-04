<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use App\PhotoBank\FileUploaderBundle\FileUploadController;

class UploadHandlerController extends AbstractController
{
    /**
     * @Route("/api/uploadhandler", methods={"POST"}, name="upload_handler")
     */
    public function index()
    {
        return new Response();
    }
}
