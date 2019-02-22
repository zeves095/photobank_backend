<?php
/**
  * Контроллер для получения и обновления информации о сущностях каталога GarbageNode, Resource
  *
  */
namespace App\Controller;
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
use App\Entity\GarbageNode;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

use Symfony\Component\Messenger\MessageBusInterface;

use App\Service\Search\SearchQueryBuilder;
use App\Service\Search\SearchService;
use App\Service\ResourceService;
use App\Service\GarbageService;

/**
  * Контроллер для получения и обновления информации о сущностях каталога GarbageNode, Resource
  */
class GarbageStorageController extends AbstractController
{

    /**
     * Получает нормализованный объект с информацией о разделе свалки
     *
     * @param GarbageNode $gnode Обьект раздела, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/garbage/node/{id}",
     * methods={"GET"},
     * name="garbage_node")
     */
    public function getNode(GarbageNode $gnode, AppSerializer $serializer)
    {
        $response = new JsonResponse();

        $gnodeArray = [];
        if(!$gnode->getDeleted()){
          $gnodeArray = $serializer->normalize($gnode, null, array(
              'add-relation' => false
          ));
        }

        $response->setData($gnodeArray);
        return $response;
    }
    /**
     * Получает нормализованный объект с информацией о дочерних разделах каталога
     *
     * @param int $id Идентификатор раздела каталога, подтягивается через wildcard {id}
     * @param GarbageNode $gnode Обьект раздела, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/garbage/nodes/{id}",
     * methods={"GET"},
     * name="garbage_nodes",
     * defaults={"id" = null})
     */
    public function getNodes($id, GarbageNode $gnode = null, AppSerializer $serializer)
    {

        if (!is_null($id) && !$gnode) {
            throw $this->createNotFoundException(
                'Не найдено категории с идентификатором = '.$id
            );
        }

        $response = new JsonResponse();

        $em = $this->getDoctrine()->getManager();
        $repo = $em->getRepository(GarbageNode::class);

        if(!$gnode){
            $children = $repo->findBy([
                'parent' => null,
                'deleted' => false
            ],[
              'name'=>'ASC'
            ]);
        }else{
            // $children = $gnode->getChildren();
            $children = $repo->findBy([
                'parent' => $gnode->getId(),
                'deleted' => false
            ],[
              'name'=>'ASC'
            ]);
        }
        $gnodeArray = $serializer->normalize($children, null, array(
            'add-relation' => false,
            'add-item-count' => true
        ));
        $response->setData($gnodeArray);
        return $response;
    }

    /**
     * Получает нормализованный объект с информацией о разделе свалки
     *
     * @param GarbageNode $gnode Обьект раздела, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/garbage/node/add",
     * methods={"POST"},
     * name="garbage_create_node")
     */
    public function createNode(Request $request, GarbageService $garbageService)
    {
        $data = json_decode(
          $request->getContent(),
          true
        );

        if(isset($data['name'])&&isset($data['parent'])){
          if(!$garbageService->createNode($data['name'],$data['parent'])['successful']){
            throw new \Exception('Ошибка при добавлении папки');
          }
        }else{
          throw new \Exception('Должны быть указаны название и родительский ресурс');
        }

        return new JsonResponse();
    }

    /**
     * Получает нормализованный объект с информацией о разделе свалки
     *
     * @param GarbageNode $gnode Обьект раздела, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/garbage/node/update",
     * methods={"POST"},
     * name="garbage_update_node")
     */
    public function updateNode(Request $request, GarbageService $garbageService)
    {
        $data = json_decode(
          $request->getContent(),
          true
        );

        if(isset($data['id']) && (isset($data['name'])||isset($data['parent']))){
          if(!$garbageService->updateNode($data['id'],['name'=>$data['name'],'parent'=>$data['parent']])['successful']){
            throw new \Exception('Ошибка при изменении папки');
          }
        }else{
          throw new \Exception('Должны быть указаны верные данные');
        }

        return new JsonResponse();
    }

    /**
     * Получает нормализованный объект с информацией о разделе свалки
     *
     * @param GarbageNode $gnode Обьект раздела, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/garbage/node/remove",
     * methods={"POST"},
     * name="garbage_remove_node")
     */
    public function removeNode(Request $request, GarbageService $garbageService)
    {
        $data = json_decode(
          $request->getContent(),
          true
        );

        if(isset($data['id'])){
          if(!$garbageService->removeNode($data['id'])['successful']){
            throw new \Exception('Ошибка при удалении папки');
          }
        }else{
          throw new \Exception('Должен быть указан идентификатор ресурса');
        }

        return new JsonResponse();
    }

    /**
     * Получает нормализованный объект с информацией о ресурсе по идентификатору товара
     *
     * @param GarbageNode $gitem Объект товара, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     * @param EntityManagerInterface $entityManager Инструмент работы с сущностями Doctrine ORM
     *
     * @Route(
     *      "/garbage/node/resources/{id}",
     *      methods={"GET"},
     *      name="garbage_node_item_resources"
     * )
     */
    public function getResources(GarbageNode $gitem, AppSerializer $serializer, ResourceService $resourceService)
    {
        $response = new JsonResponse();

        $resources = $resourceService->getOriginal($gitem);
        $resourcesArray = $serializer->normalize($resources, 'json', array());

        $response->setData($resourcesArray);
        return $response;
    }

    // /**
    //  * Получает нормализованный объект с информацией о товаре по коду 1С
    //  *
    //  * @param GarbageNode $gitem Объект товара, подтягивается через wildcard {id}
    //  * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
    //  *
    //  * @Route("/garbage/node/item/{item}",
    //  * requirements={"item" = "\d{11}"},
    //  * methods={"GET"},
    //  * name="garbage_node_item_by_itemcode")
    //  * @ParamConverter("gitem", class="App\Entity\GarbageNode", options={"mapping": {"item": "id"}})
    //  */
    // public function getItemByItemCode(GarbageNode $gitem, AppSerializer $serializer)
    // {
    //     $response = new JsonResponse();
    //
    //     $gitemArray = $serializer->normalize($gitem, null, array(
    //       'add-children'=>true,
    //         ObjectNormalizer::ENABLE_MAX_DEPTH => true,
    //         'groups' => array('main','parent')
    //     ));
    //
    //     $response->setData($gitemArray);
    //
    //     return $response;
    // }
    //
    // /**
    //  * Получает нормализованный объект с информацией о товаре
    //  *
    //  * @param GarbageNode $gitem Объект товара, подтягивается через wildcard {id}
    //  * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
    //  *
    //  * @Route("/garbage/node/item/{id}",
    //  * methods={"GET"},
    //  * name="garbage_node_item")
    //  */
    // public function getItem(GarbageNode $gitem, AppSerializer $serializer)
    // {
    //     $response = new JsonResponse();
    //
    //     $gitemArray = $serializer->normalize($gitem, null, array(
    //       'add-children'=>true,
    //         ObjectNormalizer::ENABLE_MAX_DEPTH => true,
    //         'groups' => array('main','parent')
    //     ));
    //
    //     $response->setData($gitemArray);
    //     return $response;
    // }
    //
    // /**
    //  * Получает нормализованный объект с информацией о дочерних товарах от раздела каталога
    //  *
    //  * @param GarbageNode $gnode Обьект раздела, подтягивается через wildcard {id}
    //  * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
    //  *
    //  * @Route("/garbage/node/items/{id}",
    //  * methods={"GET"},
    //  * name="garbage_node_items")
    //  */
    // public function getItems(GarbageNode $gnode, AppSerializer $serializer)
    // {
    //     $response = new JsonResponse();
    //
    //     $items = $gnode->getItems();
    //     $itemsArray = $serializer->normalize($items, null, array(
    //         ObjectNormalizer::ENABLE_MAX_DEPTH => true,
    //         'groups' => array('main')
    //     ));
    //
    //     $response->setData($itemsArray);
    //     return $response;
    // }
    //
    // /**
    //  * Осуществляет поиск среди товаров
    //  *
    //  * @param Request $request Объект актуального запроса
    //  * @param SearchQueryBuilder $queryBuilder Сервис создания поискового объекта
    //  * @param SearchService $searchService Сервис, осуществляющий поиск через репозиторий
    //  * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
    //  *
    //  * @Route("/garbage/search/items",
    //  * methods={"GET"},
    //  * name="garbage_search_items")
    //  */
    // public function searchItems(Request $request, SearchQueryBuilder $queryBuilder, SearchService $searchService,AppSerializer $serializer)
    // {
    //   $response = new JsonResponse();
    //   $queryObject = $queryBuilder->makeItemQuery($request);
    //   $items = $searchService->search($queryObject);
    //   $itemsArray = $serializer->normalize($items, null, array(
    //       ObjectNormalizer::ENABLE_MAX_DEPTH => true,
    //       'groups' => array('main')
    //   ));
    //   $response->setData($itemsArray);
    //   return $response;
    // }

}
