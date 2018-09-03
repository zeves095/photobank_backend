<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use App\Service\UploadReceiver;

class FileUploadController extends AbstractController
{
    /**
     * @Route("/file/upload", methods={"POST"})
     */
    public function upload(UploadReceiver $receiver)
    {
      $receiver->uploadChunks();
      return new Response(
            '<b>UP</b>'
        );
    }
    /**
     * @Route("/file/upload", methods={"GET"})
     */
    public function test(UploadReceiver $receiver)
    {
      if($receiver->testChunks()){
        return new Response(
          '<b>FOUND</b>'
        );
      } else {
        throw $this->createNotFoundException();
        return new Response(
          '<b>NOT FOUND</b>'
        );
      }
    }
}
