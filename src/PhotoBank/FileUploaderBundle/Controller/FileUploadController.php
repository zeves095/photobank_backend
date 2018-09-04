<?php

namespace App\PhotoBank\FileUploaderBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use App\PhotoBank\FileUploaderBundle\Service\UploadReceiver;

class FileUploadController extends AbstractController
{
    /**
     * @Route("", methods={"POST"})
     */
    public function upload(UploadReceiver $receiver)
    {
      $receiver->uploadChunks();
      return new Response('ok');
    }
    /**
     * @Route("/", methods={"GET"})
     */
    public function test(UploadReceiver $receiver)
    {
      if($receiver->testChunks()){
        return new Response();
      } else {
        throw $this->createNotFoundException();
        return new Response();
      }
    }
}
