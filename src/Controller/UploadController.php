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
      $config = array(
        'upload_directory' => $container->getParameter('upload_directory'),
        'upload_target_url' => $container->getParameter('upload_target_url'),
        'existing_uploads_url' => $container->getParameter('existing_uploads_url'),
        'unfinished_uploads_url' => $container->getParameter('unfinished_uploads_url'),
        'commit_upload_url' => $container->getParameter('commit_upload_url'),
        'remove_upload_url' => $container->getParameter('remove_upload_url'),
        'resource_url' => $container->getParameter('resource_url'),
        'item_url' => $container->getParameter('item_url'),
        'item_search_url' => $container->getParameter('item_search_url'),
        'get_nodes_url' => $container->getParameter('get_nodes_url'),
        'get_items_url' => $container->getParameter('get_items_url'),
        'max_main_resources' => $container->getParameter('max_main_resources'),
        'max_additional_resources' => $container->getParameter('max_additional_resources'),
        'presets' => $container->getParameter('presets'),
        'upload_url' => $container->getParameter('upload_url')
      );

      $config_json = json_encode($config);

      return $this->render('upload/index.html.twig', [
          'controller_name' => 'UploadController',
          'target_url' => $container->getParameter('fileuploader.targeturl'),
          'chunk_size' => $container->getParameter('fileuploader.chunksize'),
          'simultaneous_uploads' => $container->getParameter('fileuploader.simultaneousuploads'),
          'config' => $config_json
      ]);
    }
}
