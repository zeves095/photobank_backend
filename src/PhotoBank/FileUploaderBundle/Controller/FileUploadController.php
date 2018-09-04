<?php

namespace App\PhotoBank\FileUploaderBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Component\EventDispatcher\EventDispatcher;
use App\PhotoBank\FileUploaderBundle\Event\FileUploadedEvent;

use App\PhotoBank\FileUploaderBundle\Service\UploadReceiver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class FileUploadController extends AbstractController
{
    /**
     * @Route("/", methods={"POST"})
     */
    public function upload(UploadReceiver $receiver, TokenStorageInterface $token)
    {
      $result = $receiver->uploadChunks();
      if($result['completed']){
        $user = $token->getToken()->getUser();
        $uploadParams=array(
          'path'=>$result['path'],
          'username'=>$user->getUsername(),
          'item_id'=>1,
          'preset'=>1,
          'type'=>1,
        );
        $event= new FileUploadedEvent($uploadParams);
        $dispatcher = new EventDispatcher();
        $dispatcher->dispatch(FileUploadedEvent::NAME, $event);
      }
      return new Response();
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
