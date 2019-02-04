<?php
/**
  * Контроллер для получения страниц интерфейса загрузки файлов
  *
  */
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\DependencyInjection\ContainerInterface;
use PhotoBank\FileUploaderBundle\Service\UploadRecordManager;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
  * Контроллер для получения страниц интерфейса загрузки файлов
  */
class UploadController extends AbstractController
{
    /**
      * Рендерит страницу загрузки. Получает конфигурацию из контейнера и пишет ее в data-config обертки react-компонента.
      *
      * @param ContainerInterface $container Сервис-контейнер Symfony
      * @param UploadRecordManager $recordManager Сервис управления данными по загрузкам
      *
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

    /**
      * Получает конфигурацию из контейнера для корректной работы фронтенд-приложения.
      *
      * @param ContainerInterface $container Сервис-контейнер Symfony
      *
     * @Route("/upload/config", name="upload_config")
     */
    public function getConfig(ContainerInterface $container)
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
      $response = new JsonResponse();
      $response->setData($config);
      return $response;
    }
}
