<?php

namespace App\PhotoBank\FileUploaderBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use App\PhotoBank\FileUploaderBundle\Event\FileUploadedEvent;
use App\PhotoBank\FileUploaderBundle\Service\UploadReceiver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class FileUploadController extends AbstractController
{
    /**
     * @Route("/", methods={"POST"})
     */
    public function upload(UploadReceiver $receiver, EventDispatcherInterface $dispatcher, ContainerInterface $container, TokenStorageInterface $token)
    {
      $this->username = $token->getToken()->getUser()->getUsername();
      $result = $receiver->uploadChunks($this->getServiceParameters($container));
      if($result['completed']){
        $responseParams=array(
          'path'=>$result['path'],
          'chunkPath'=>$result['chunkPath'],
          'filename'=>$result['filename'],
          'src_filename'=>$result['src_filename'],
          'username'=>$this->username,
          'item_id'=>1,
          'preset'=>1,
          'type'=>1,
        );
        $event= new FileUploadedEvent($responseParams);
        $dispatcher->dispatch(FileUploadedEvent::NAME, $event);
      }
      return new Response();
    }
    /**
     * @Route("/", methods={"GET"})
     */
    public function test(UploadReceiver $receiver, ContainerInterface $container, TokenStorageInterface $token)
    {
      $this->username = $token->getToken()->getUser()->getUsername();
      if($receiver->testChunks($this->getServiceParameters($container))){
        return new Response();
      } else {
        throw $this->createNotFoundException();
        return new Response();
      }
    }

    private function getServiceParameters($container){
      return array(
            'destination_dir' => $container->getParameter('fileuploader.desinationdir'),
            'temp_dir' => $container->getParameter('fileuploader.tempdir'),
            'username' => $this->username,
      );
    }
}
