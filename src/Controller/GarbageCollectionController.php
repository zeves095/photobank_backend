<?php
/**
  * Контроллер для получения и обновления информации о сущностях каталога GarbageNode, GarbageNodeItem, Resource
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

/**
  * Контроллер для получения и обновления информации о сущностях каталога GarbageNode, GarbageNodeItem, Resource
  */
class GarbageCollectionController extends AbstractController
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

        $gnodeArray = $serializer->normalize($gnode, null, array(
            'add-relation' => false
        ));

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
            ],[
              'name'=>'ASC'
            ]);
        }else{
            // $children = $gnode->getChildren();
            $children = $repo->findBy([
                'parent' => $gnode->getId(),
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
    // /**
    //  * Получает нормализованный объект с информацией о товаре по коду 1С
    //  *
    //  * @param GarbageNodeItem $citem Объект товара, подтягивается через wildcard {id}
    //  * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
    //  *
    //  * @Route("/garbage/node/item/{item}",
    //  * requirements={"item" = "\d{11}"},
    //  * methods={"GET"},
    //  * name="garbage_node_item_by_itemcode")
    //  * @ParamConverter("citem", class="App\Entity\GarbageNodeItem", options={"mapping": {"item": "id"}})
    //  */
    // public function getItemByItemCode(GarbageNodeItem $citem, AppSerializer $serializer)
    // {
    //     $response = new JsonResponse();
    //
    //     $citemArray = $serializer->normalize($citem, null, array(
    //       'add-children'=>true,
    //         ObjectNormalizer::ENABLE_MAX_DEPTH => true,
    //         'groups' => array('main','parent')
    //     ));
    //
    //     $response->setData($citemArray);
    //
    //     return $response;
    // }
    //
    // /**
    //  * Получает нормализованный объект с информацией о товаре
    //  *
    //  * @param GarbageNodeItem $citem Объект товара, подтягивается через wildcard {id}
    //  * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
    //  *
    //  * @Route("/garbage/node/item/{id}",
    //  * methods={"GET"},
    //  * name="garbage_node_item")
    //  */
    // public function getItem(GarbageNodeItem $citem, AppSerializer $serializer)
    // {
    //     $response = new JsonResponse();
    //
    //     $citemArray = $serializer->normalize($citem, null, array(
    //       'add-children'=>true,
    //         ObjectNormalizer::ENABLE_MAX_DEPTH => true,
    //         'groups' => array('main','parent')
    //     ));
    //
    //     $response->setData($citemArray);
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
