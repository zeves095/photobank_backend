<?php
/**
  * Контроллер для api внешних сайтов, использующих фотобанк
  *
  */
namespace App\Controller;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use \Symfony\Component\HttpKernel\Exception\HttpException;
use App\Entity\Resource;
use App\Service\ResourceService;

/**
  * Контроллер для api внешних сайтов, использующих фотобанк
  */
class ExternalController extends AbstractController
{

    /**
     * Отпраляет метаданных о ресурсах товара каталога и созданных для них пресетах
     *
     * @param String _code код товара каталога
     *
     * @Route("/resources/getmetadata/{_code}",
     * methods={"GET"},
     * name="resources_get_metadata")
     */
    public function searchResources($_code, ResourceService $resourceService)
    {
      $response = new JsonResponse();

      $metadata = $resourceService->getItemResourcesMetadata([$_code]);
      if(!isset($metadata[$_code])||sizeof($metadata[$_code])<1){
        throw new HttpException(404, "Не найдено ресурсов для товара");
      }
      $response->setData($metadata[$_code]);
      return $response;
    }

}
