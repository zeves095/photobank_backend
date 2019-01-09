<?php
/**
  * Контроллер для получения и обновления информации о сущностях каталога CatalogueNode, CatalogueNodeItem, Resource
  *
  */
namespace App\Controller;
// TODO Разбить на разные файлы, оч жирный
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use \Symfony\Component\HttpKernel\Exception\HttpException;

// use Symfony\Component\Serializer\SerializerInterface; // use AppSerializer instead
use App\Serializer\AppSerializer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use App\Entity\CatalogueNode;
use App\Entity\CatalogueNodeItem;
use App\Entity\Resource;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Service\ResourceService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

use Symfony\Component\Messenger\MessageBusInterface;
use App\Message\ResourcePresetNotification;

use App\Service\Search\SearchQueryBuilder;
use App\Service\Search\SearchService;

/**
  * Контроллер для получения и обновления информации о сущностях каталога CatalogueNode, CatalogueNodeItem, Resource
  */
class CatalogueController extends AbstractController
{
    /**
     * Получает нормализованный объект с информацией о разделе каталога
     *
     * @param CatalogueNode $cnode Обьект раздела, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/catalogue/node/{id}",
     * methods={"GET"},
     * name="catalogue_node")
     */
    public function getNode(CatalogueNode $cnode, AppSerializer $serializer)
    {
        $response = new JsonResponse();

        $cnodeArray = $serializer->normalize($cnode, null, array(
            'add-relation' => false
        ));

        $response->setData($cnodeArray);
        return $response;
    }
    /**
     * Получает нормализованный объект с информацией о дочерних разделах каталога
     *
     * @param int $id Идентификатор раздела каталога, подтягивается через wildcard {id}
     * @param CatalogueNode $cnode Обьект раздела, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/catalogue/nodes/{id}",
     * methods={"GET"},
     * name="catalogue_nodes",
     * defaults={"id" = null})
     */
    public function getNodes($id, CatalogueNode $cnode = null, AppSerializer $serializer)
    {

        if (!is_null($id) && !$cnode) {
            throw $this->createNotFoundException(
                'Не найдено категории с идентификатором = '.$id
            );
        }

        $response = new JsonResponse();


        $em = $this->getDoctrine()->getManager();
        $repo = $em->getRepository(CatalogueNode::class);

        if(!$cnode){
            $children = $repo->findBy([
                'parent' => null,
            ],[
              'name'=>'ASC'
            ]);
        }else{
            // $children = $cnode->getChildren();
            $children = $repo->findBy([
                'parent' => $cnode->getId(),
            ],[
              'name'=>'ASC'
            ]);
        }
        $cnodeArray = $serializer->normalize($children, null, array(
            'add-relation' => false,
            'add-item-count' => true
        ));

        $response->setData($cnodeArray);
        return $response;
    }
    /**
     * Получает нормализованный объект с информацией о товаре по коду 1С
     *
     * @param CatalogueNodeItem $citem Объект товара, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/catalogue/node/item/{item}",
     * requirements={"item" = "\d{11}"},
     * methods={"GET"},
     * name="catalogue_node_item_by_itemcode")
     * @ParamConverter("citem", class="App\Entity\CatalogueNodeItem", options={"mapping": {"item": "id"}})
     */
    public function getItemByItemCode(CatalogueNodeItem $citem, AppSerializer $serializer)
    {
        $response = new JsonResponse();

        $citemArray = $serializer->normalize($citem, null, array(
          'add-children'=>true,
            ObjectNormalizer::ENABLE_MAX_DEPTH => true,
            'groups' => array('main','parent')
        ));

        $response->setData($citemArray);

        return $response;
    }

    /**
     * Получает нормализованный объект с информацией о товаре
     *
     * @param CatalogueNodeItem $citem Объект товара, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/catalogue/node/item/{id}",
     * methods={"GET"},
     * name="catalogue_node_item")
     */
    public function getItem(CatalogueNodeItem $citem, AppSerializer $serializer)
    {
        $response = new JsonResponse();

        $citemArray = $serializer->normalize($citem, null, array(
          'add-children'=>true,
            ObjectNormalizer::ENABLE_MAX_DEPTH => true,
            'groups' => array('main','parent')
        ));

        $response->setData($citemArray);
        return $response;
    }

    /**
     * Получает нормализованный объект с информацией о дочерних товарах от раздела каталога
     *
     * @param CatalogueNode $cnode Обьект раздела, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/catalogue/node/items/{id}",
     * methods={"GET"},
     * name="catalogue_node_items")
     */
    public function getItems(CatalogueNode $cnode, AppSerializer $serializer)
    {
        $response = new JsonResponse();

        $items = $cnode->getItems();
        $itemsArray = $serializer->normalize($items, null, array(
            ObjectNormalizer::ENABLE_MAX_DEPTH => true,
            'groups' => array('main')
        ));

        $response->setData($itemsArray);
        return $response;
    }

    /**
     * Осуществляет поиск среди товаров
     *
     * @param Request $request Объект актуального запроса
     * @param SearchQueryBuilder $queryBuilder Сервис создания поискового объекта
     * @param SearchService $searchService Сервис, осуществляющий поиск через репозиторий
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/catalogue/search/items",
     * methods={"GET"},
     * name="catalogue_search_items")
     */
    public function searchItems(Request $request, SearchQueryBuilder $queryBuilder, SearchService $searchService,AppSerializer $serializer)
    {
      $response = new JsonResponse();
      $queryObject = $queryBuilder->makeItemQuery($request);
      $items = $searchService->search($queryObject);
      $itemsArray = $serializer->normalize($items, null, array(
          ObjectNormalizer::ENABLE_MAX_DEPTH => true,
          'groups' => array('main')
      ));
      $response->setData($itemsArray);
      return $response;
    }

    /**
     * Осуществляет поиск среди ресурсов
     *
     * @param Request $request Объект актуального запроса
     * @param SearchQueryBuilder $queryBuilder Сервис создания поискового объекта
     * @param SearchService $searchService Сервис, осуществляющий поиск через репозиторий
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/catalogue/search/resources",
     * methods={"GET"},
     * name="catalogue_search_resources")
     */
    public function searchResources(Request $request, SearchQueryBuilder $queryBuilder, SearchService $searchService, AppSerializer $serializer)
    {
      $response = new JsonResponse();
      $queryObject = $queryBuilder->makeResourceQuery($request);
      $resources = $searchService->search($queryObject);
      $resourcesArray = $serializer->normalize($resources, null, array(
          "add-relation"=>true,
          ObjectNormalizer::ENABLE_MAX_DEPTH => true,
          'groups' => array('main')
      ));
      $response->setData($resourcesArray);
      return $response;
    }

    /**
     * Получает нормализованный объект с информацией о ресурсе
     *
     * @param Resource $resource Объект ресурса, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route(
     *      "/catalogue/node/item/resource/{id}",
     *      methods={"GET"},
     *      name="catalogue_node_item_resource",
     *      requirements={"id"="\d+"}
     * )
     */
    public function getResource(Resource $resource, AppSerializer $serializer)
    {
        $response = new JsonResponse();

        $resourceArray = $serializer->normalize($resource, null, array());

        $response->setData($resourceArray);
        return $response;
    }

    /**
     * Получает нормализованный объект с информацией о ресурсе вместе с товаром, к которому он привязан
     *
     * @param Resource $resource Объект ресурса, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route(
     *      "/catalogue/node/item/resource/full/{id}",
     *      methods={"GET"},
     *      name="catalogue_node_item_resource_with_item",
     *      requirements={"id"="\d+"}
     * )
     */
    public function getResourceWithItem(Resource $resource, AppSerializer $serializer)
    {
        $response = new JsonResponse();

        $resourceArray = $serializer->normalize($resource, null, ['add-relation'=>true]);

        $response->setData($resourceArray);
        return $response;
    }

    /**
     * Получает нормализованный объект с информацией о ресурсе по идентификатору товара
     *
     * @param CatalogueNodeItem $citem Объект товара, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     * @param EntityManagerInterface $entityManager Инструмент работы с сущностями Doctrine ORM
     *
     * @Route(
     *      "/catalogue/node/item/resources/{id}",
     *      methods={"GET"},
     *      name="catalogue_node_item_resources"
     * )
     */
    public function getResources(CatalogueNodeItem $citem, AppSerializer $serializer, EntityManagerInterface $entityManager)
    {
      // TODO Убрать работу с базой в сервис
        $response = new JsonResponse();

        //$resources = $citem->getResources();
        $resources = $entityManager->getRepository(Resource::class)->findOriginalResources($citem);
        $resourcesArray = $serializer->normalize($resources, 'json', array());

        $response->setData($resourcesArray);
        return $response;
    }

    /**
     * Получает изображение ресурса, если указан jpg как формат, и нормализованный объект с информацией о ресурсе, если json
     *
     * @param string $_format Формат возвращаемого ресурса, подтягивется через wildcard {_format}
     * @param Resource $resource Объект ресурса, подтягивается через wildcard {id}
     * @param ResourceService $resourceService Сервис для работы с ресурсами
     *
     * @Route(
     *      "/catalogue/node/item/resource/{id}.{_format}",
     *      methods={"GET"},
     *      name="catalogue_node_item_resource_raw",
     *      requirements={
     *          "id"="\d+",
     *          "_format": "jpg|json"
     *      }
     * )
     */
    public function getResourceRaw($_format, Resource $resource, ResourceService $resourceService)
    {
        if($_format == 'json'){
            return $this->redirect(
                $this->generateUrl(
                    'catalogue_node_item_resource',
                    array('id' => $resource->getId())
                )
            );
        }

        $upload_directory = $this->getParameter('upload_directory');
        // TODO: DELETE and use service|utils methods to get $fileDirectory
        $item_code = $resource->getItem()->getId();
        $fileDirectory = $upload_directory .'/'. $resourceService->generatePath($item_code);
        $filename = $resource->getFilename();
        $fullFilePath = $fileDirectory . $filename;
        $src_filename = $resource->getSrcFilename()?:'noName';

        if(!file_exists($fullFilePath)){throw new HttpException(503, "Ресурс временно недоступен");}

        return $this->file($fullFilePath, $src_filename, ResponseHeaderBag::DISPOSITION_INLINE);
    }

    /**
     * Получает по коду 1С и приоритету изображение ресурса, если указан jpg как формат, и нормализованный объект с информацией о ресурсе, если json
     *
     * @param string $_format Формат возвращаемого ресурса, подтягивется через wildcard {_format}
     * @param string $_priority Приоритет изображения в группе, 1 соответсвует основному, 2 и далее соотвествуют приоритету дополнительного изображения -1
     * @param string $_code Код 1С товара, подтягивается через wildcard {_code}
     * @param ResourceService $resourceService Сервис для работы с ресурсами
     *
     * @Route(
     *      "/catalogue/node/item/resource/{_code}_{_priority}.{_format}",
     *      methods={"GET"},
     *      name="catalogue_node_item_resource_by_priority_raw",
     *      requirements={
     *          "id"="\d+",
     *          "_priority"="\d{1,3}",
     *          "_format": "jpg|json|bool"
     *      }
     * )
     */
    public function getResourceByPriorityRaw($_format, $_priority, $_code, ResourceService $resourceService)
    {
        $resource = $resourceService->getByItemAndPriority($_code, $_priority);

        if($_format == 'bool'){
            return new Response(($resource?1:0));
        }

        if($resource == null){
          throw new HttpException(404, "Ресурс не найден");
        }

        if($_format == 'json'){
            return $this->redirect(
                $this->generateUrl(
                    'catalogue_node_item_resource',
                    array('id' => $resource->getId())
                )
            );
        }

        $upload_directory = $this->getParameter('upload_directory');
        // TODO: DELETE and use service|utils methods to get $fileDirectory
        $item_code = $resource->getItem()->getId();
        $fileDirectory = $upload_directory .'/'. $resourceService->generatePath($item_code);
        $filename = $resource->getFilename();
        $fullFilePath = $fileDirectory . $filename;
        $src_filename = $resource->getSrcFilename()?:'noName';

        if(!file_exists($fullFilePath)){throw new HttpException(503, "Ресурс временно недоступен");}

        return $this->file($fullFilePath, $src_filename, ResponseHeaderBag::DISPOSITION_INLINE);
    }

    /**
     * Получает нормализованный объект с информацией о ресурсом, который является конкретным пресетом в той же группе ресурсов, что и переданный в url идентификатор
     *
     * @param int $rid Идентификатор ресурса
     * @param int $pid Идентификатор пресета
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     * @param EntityManagerInterface $entityManager Инструмент работы с сущностями Doctrine ORM
     *
     * @Route(
     *      "/catalogue/node/item/resource/{rid}/{pid}",
     *      methods={"GET"},
     *      name="catalogue_node_item_resource_preset",
     *      requirements={"pid"="\d+","rid"="\d+"}
     * )
     */
     public function getResourcePreset($rid, $pid, AppSerializer $serializer, EntityManagerInterface $entityManager)
     {
       // TODO Убрать работу с базой в сервис
       $response = new JsonResponse();
       $resourceGroup = $entityManager->getRepository(Resource::class)->findBy(['gid'=>$rid]);
       foreach($resourceGroup as $resource){
         if($resource->getPreset() == $pid){
           $resourceArray = $serializer->normalize($resource, null, array());
           $response->setData($resourceArray);
         }
       }
       return $response;
     }

     /**
      * Получает нормализованный объект с информацией о ресурсе, который является пресетом 1(thumbnail) по идентификатору группы ресурсов
      *
      * @param int $gid Идентификатор группы ресурсов
      * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
      * @param EntityManagerInterface $entityManager Инструмент работы с сущностями Doctrine ORM
      *
      * @Route(
      *      "/catalogue/node/item/resource/thumbnail/{gid}",
      *      methods={"GET"},
      *      name="catalogue_node_item_resource_thumbnail",
      *      requirements={"gid"="\d+"}
      * )
      */
      public function getResourceThumbnail($gid, AppSerializer $serializer, EntityManagerInterface $entityManager)
      {
        // TODO Убрать работу с базой в сервис
        $response = new JsonResponse();
        $thumbnail = $entityManager->getRepository(Resource::class)->getThumbnail($gid);
        $resourceData = $serializer->normalize($thumbnail, null, array());
        $response->setData($resourceData);
        return $response;
      }

      /**
       * Получает массив с нормализованными объектами с информацией о ресурсах, которые являются пресетом 1(thumbnail) по массиву из идентификаторов ресурсов
       *
       * @param Request $request Объект актуального запроса
       * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
       * @param EntityManagerInterface $entityManager Инструмент работы с сущностями Doctrine ORM
       *
       * @Route(
       *      "/catalogue/node/item/resource/thumbnails/",
       *      methods={"POST"},
       *      name="catalogue_node_item_resource_thumbnails"
       * )
       */
       public function getResourceThumbnails(Request $request, AppSerializer $serializer, EntityManagerInterface $entityManager)
       {
       // TODO Убрать работу с базой в сервис
         $data = json_decode(
             $request->getContent(),
             true
         );
         if(sizeof($data['resources'])){
           $thumbnailids = array();
           $repo = $entityManager->getRepository(Resource::class);
           $thumbnails = $repo->getThumbnailIds($data['resources']);
         }else{
           $thumbnails = [];
         }
         $response = new JsonResponse();
         $response->setData($thumbnails);
         return $response;
       }

       /**
        * Обновляет запись о ресурсе
        *
        * @param Resource $resource Объект ресурса, подтягивается через wildcard {id}
        * @param Request $request Объект актуального запроса
        * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
        * @param ResourceService $resourceService Сервис для работы с ресурсами
        *
        * @Route(
        *      "/catalogue/node/item/resource/{id}",
        *      methods={"PATCH"},
        *      name="patch_resource",
        *      requirements={
        *          "id"="\d+"
        *      }
        * )
        */
        public function patchResource(Resource $resource, Request $request, AppSerializer $serializer, ResourceService $resourceService)
        {
          $data = json_decode(
              $request->getContent(),
              true
            );

            if(!isset($data['id'])){
              throw new HttpException(400, 'Bad data');
            }

            if(!$resourceService->patchResource($resource,$data)){
              throw new HttpException(400,'Bad data');
            }
            $resourceService->dispatchPresetMessages($data['id'], $data['type']);

            $response = new JsonResponse();
            $resourceArray = $serializer->normalize($resource, null, array());
            $response->setData($resourceArray);
            return $response;
        }

        /**
        * Получает список возможных пресетов
        *
        * @param ContainerInterface $container Контейнер сервисов Symfony, для получения конфигурации
        *
        * @Route(
        *      "/catalogue/resource/presets",
        *      methods={"GET"},
        *      name="catalogue_resource_presets"
        * )
        */
        public function getResourcePresets(ContainerInterface $container)
        {
          $response = new JsonResponse();
          $presets = array();
          foreach($container->getParameter('presets') as $preset){
            $presets[$preset['id']] = [
              'name'=>$preset['name'],
              'id'=>$preset['id'],
              'height'=>$preset['height'],
              'width'=>$preset['width'],
            ];
          }
          $response->setData($presets);
          return $response;
        }

        /**
        * Получает список возможных типов ресурсов
        *
        * @param ContainerInterface $container Контейнер сервисов Symfony, для получения конфигурации
        *
        * @Route(
        *      "/catalogue/resource/types",
        *      methods={"GET"},
        *      name="catalogue_resource_types"
        * )
        */
        public function getResourceTypes(ContainerInterface $container)
        {

          // TODO Типы прописаны хардом, надо поменять
          $response = new JsonResponse();
          $presets = [
              1=>'Основное',
              2=>'Дополнительное',
              3=>'Исходник'
          ];
          $response->setData($presets);
          return $response;
        }
}
