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
use Symfony\Component\HttpFoundation\RequestStack;

class FileUploadController extends AbstractController
{
    /**
     * @Route("/", methods={"POST"})
     */
    public function upload(UploadReceiver $receiver, EventDispatcherInterface $dispatcher, ContainerInterface $container, TokenStorageInterface $token, RequestStack $requestStack)
    {
      $this->username = $token->getToken()->getUser()->getUsername();
      $itemId = $requestStack->getCurrentRequest()->query->get('itemId');
      $result = $receiver->uploadChunks($this->getUploadParameters($container, $requestStack));
      if($result['completed']){
        $responseParams=array(
          'path'=>$result['path'],
          'chunkPath'=>$result['chunkPath'],
          'filename'=>$result['filename'],
          'src_filename'=>$result['src_filename'],
          'username'=>$this->username,
          'item_id'=>$itemId,
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
    public function test(UploadReceiver $receiver, ContainerInterface $container, TokenStorageInterface $token, RequestStack $requestStack)
    {
      $this->username = $token->getToken()->getUser()->getUsername();
      if($receiver->testChunks($this->getUploadParameters($container, $requestStack))){
        return new Response();
      } else {
        throw $this->createNotFoundException();
        return new Response();
      }
    }

    private function getUploadParameters($container, $requestStack){

      $request = $requestStack->getCurrentRequest();

      $resumableVars = array(
        "resumableIdentifier"=>$request->query->get('resumableIdentifier'),
        "resumableFilename"=>$request->query->get('resumableFilename'),
        "resumableChunkNumber"=>$request->query->get('resumableChunkNumber'),
        "resumableChunkSize"=>$request->query->get('resumableChunkSize'),
        "resumableTotalSize"=>$request->query->get('resumableTotalSize'),
        "resumableTotalChunks"=>$request->query->get('resumableTotalChunks'),
      );

      $itemId = $request->query->get('itemId');
      $files = $request->files;

      $splitId = array();
      for($i=0; $i<=strlen($itemId)/2; $i++){
        $splitId[] = substr($itemId, $i*2, 2);
      }
      $splitIdPath = implode('/',$splitId)."/";
      $destinationDir = $container->getParameter('fileuploader.desinationdir').$splitIdPath;

      $tempDir = $container->getParameter('fileuploader.tempdir');
      $username = $this->username;
      $filenameArr = explode(".",$resumableVars['resumableFilename']);
      $extension = sizeof($filenameArr)>1?end($filenameArr):"";
      $filename = $resumableVars['resumableIdentifier'].".".$extension;
      $partstring = '.part'.$resumableVars['resumableChunkNumber'];
      $tempChunkDir = $tempDir.$username.'/'.$resumableVars['resumableIdentifier'];
      return array(
        'resumablevars' => $resumableVars,
        'filename' => $filename,
        'partstring' => $partstring,
        'tempchunkdir' => $tempChunkDir,
        'destinationdir' => $destinationDir,
        'files' => $files,
        'temp_dir' => $tempDir,
        'username' => $username,
      );
    }
}
