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

        $user = $this->getUser();
        $auth = !!sizeof(array_diff(["ROLE_WRITER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"],$user->getRoles()))!==3;
        $response = new JsonResponse();

        $em = $this->getDoctrine()->getManager();
        $repo = $em->getRepository(GarbageNode::class);

        $params = [];

        if(!$gnode){
          $params['parent'] = null;
        }else{
          $params['parent'] = $gnode->getId();
        }
        if(!$auth){$params['deleted']=false;}
        $children = $repo->findBy($params,[
          'name'=>'ASC'
        ]);
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
     * @param Request $request объект текущего запроса
     * @param GarbageService $garbageService Сервис для работы со свалкой
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
     * @param Request $request объект текущего запроса
     * @param GarbageService $garbageService Сервис для работы со свалкой
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
     * Удаляет раздел свалки
     *
     * @param Request $request объект текущего запроса
     * @param GarbageService $garbageService Сервис для работы со свалкой
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
          $response = $garbageService->removeNode($data['id']);
          if(!$response['successful']){
            throw new \Exception($response['error']);
          }
        }else{
          throw new \Exception('Должен быть указан идентификатор ресурса');
        }

        return new JsonResponse();
    }

    /**
     * Востанавливает удаленные раздел свалки
     *
     * @param Request $request объект текущего запроса
     * @param GarbageService $garbageService Сервис для работы со свалкой
     *
     * @Route("/garbage/node/restore",
     * methods={"POST"},
     * name="garbage_restore_node")
     */
    public function restoreNode(Request $request, GarbageService $garbageService)
    {
        $data = json_decode(
          $request->getContent(),
          true
        );

        if(isset($data['id'])){
          $response = $garbageService->restoreNode($data['id']);
          if(!$response['successful']){
            throw new \Exception($response['error']);
          }
        }else{
          throw new \Exception('Должен быть указан идентификатор ресурса');
        }

        return new JsonResponse();
    }

    /**
     * Получает нормализованный объект с информацией о ресурсе по идентификатору папки свалки
     *
     * @param GarbageNode $gitem Объект товара, подтягивается через wildcard {id}
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     * @param ResourceService $resourceService Сервис для работы с ресурсами
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

    /**
     * Осуществляет поиск среди од свалки
     *
     * @param Request $request Объект актуального запроса
     * @param SearchQueryBuilder $queryBuilder Сервис создания поискового объекта
     * @param SearchService $searchService Сервис, осуществляющий поиск через репозиторий
     * @param AppSerializer $serializer Сериализатор для приведения к стандарту возвращаемого объекта
     *
     * @Route("/catalogue/search/garbage",
     * methods={"GET"},
     * name="catalogue_search_garbage")
     */
    public function searchItems(Request $request, SearchQueryBuilder $queryBuilder, SearchService $searchService,AppSerializer $serializer)
    {
      $response = new JsonResponse();
      $queryObject = $queryBuilder->makeGarbageQuery($request);
      $garbage = $searchService->search($queryObject);
      $garbageArray = $serializer->normalize($garbage, null, array(
          ObjectNormalizer::ENABLE_MAX_DEPTH => true,
          'groups' => array('main')
      ));
      $response->setData($garbageArray);
      return $response;
    }

}
