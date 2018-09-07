<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\PhotoBank\FileUploaderBundle\Service\UploadRecordManager;

class UploadController extends AbstractController
{
    /**
     * @Route("/upload", name="upload")
     */
    public function index(ContainerInterface $container, UploadRecordManager $recordManager)
    {
        $uploadArr = array();
        $uploads = $recordManager->get();
        foreach($uploads as $upload){
          $uploadArr[] = implode(',', $upload);
        }
        $unfinished_uploads = implode('|', $uploadArr);


        return $this->render('upload/index.html.twig', [
            'controller_name' => 'UploadController',
            'target_url' => $container->getParameter('fileuploader.targeturl'),
            'chunk_size' => $container->getParameter('fileuploader.chunksize'),
            'simultaneous_uploads' => $container->getParameter('fileuploader.simultaneousuploads'),
            'unfinished_uploads' => $unfinished_uploads
        ]);
    }
}
