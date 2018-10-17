<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\Extension\Core\Type\TextType;

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

class CatalogueController extends AbstractController
{
    /**
     * @Route("/catalogue/node/{id}",
     * methods={"GET"},
     * schemes={"HTTP"},
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

        if(!$cnode){
            $em = $this->getDoctrine()->getManager();
            $repo = $em->getRepository(CatalogueNode::class);
            $children = $repo->findBy([
                'parent' => null,
            ]);
        }else{
            $children = $cnode->getChildren();
        }
        $cnodeArray = $serializer->normalize($children, null, array(
            'add-relation' => false
        ));

        $response->setData($cnodeArray);
        return $response;
    }
    /**
     * @Route("/catalogue/node/item/{item}",
     * requirements={"item" = "\d{11}"},
     * methods={"GET"},
     * name="catalogue_node_item_by_itemcode")
     * @ParamConverter("citem", class="App\Entity\CatalogueNodeItem", options={"mapping": {"item": "itemCode"}})
     */
    public function getItemByItemCode(CatalogueNodeItem $citem, AppSerializer $serializer)
    {
        $response = new JsonResponse();

        $citemArray = $serializer->normalize($citem, null, array(
            ObjectNormalizer::ENABLE_MAX_DEPTH => true,
            'groups' => array('main','parent')
        ));

        $response->setData($citemArray);

        return $response;
    }

    /**
     * @Route("/catalogue/node/item/{id}",
     * methods={"GET"},
     * name="catalogue_node_item")
     */
    public function getItem(CatalogueNodeItem $citem, AppSerializer $serializer)
    {
        $response = new JsonResponse();

        $citemArray = $serializer->normalize($citem, null, array(
            ObjectNormalizer::ENABLE_MAX_DEPTH => true,
            'groups' => array('main','parent')
        ));

        $response->setData($citemArray);
        return $response;
    }
    /**
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
     * @Route(
     *      "/catalogue/node/item/resources/{id}",
     *      methods={"GET"},
     *      name="catalogue_node_item_resources"
     * )
     */
    public function getResources(CatalogueNodeItem $citem, AppSerializer $serializer, EntityManagerInterface $entityManager)
    {
        $response = new JsonResponse();

        //$resources = $citem->getResources();
        $resources = $entityManager->getRepository(Resource::class)->findOriginalResources($citem);
        $resourcesArray = $serializer->normalize($resources, 'json', array());

        $response->setData($resourcesArray);
        return $response;
    }
    /**
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
        // @TODO: DELETE and use service|utils methods to get $fileDirectory
        $item_code = $resource->getItem()->getItemCode();
        $fileDirectory = $upload_directory .'/'. $resourceService->generatePath($item_code);
        $filename = $resource->getFilename();
        $fullFilePath = $fileDirectory . $filename;
        $src_filename = $resource->getSrcFilename()?:'noName';

        return $this->file($fullFilePath, $src_filename, ResponseHeaderBag::DISPOSITION_INLINE);
    }

    /**
     * @Route(
     *      "/catalogue/node/item/resource/{rid}/{pid}",
     *      methods={"GET"},
     *      name="catalogue_node_item_resource_preset",
     *      requirements={"pid"="\d+","rid"="\d+"}
     * )
     */
     public function getResourcePreset($rid, $pid, AppSerializer $serializer, EntityManagerInterface $entityManager)
     {
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
     * @Route(
     *      "/catalogue/node/item/resource/{id}",
     *      methods={"PATCH"},
     *      name="patch_resource",
     *      requirements={
     *          "id"="\d+"
     *      }
     * )
     */
    public function patchResource(Resource $resource, Request $request, AppSerializer $serializer, ContainerInterface $container, EntityManagerInterface $entityManager,MessageBusInterface $bus, ResourceService $resourceService)
    {
        $data = json_decode(
            $request->getContent(),
            true
        );

        $resourceService->dispatchPresetMessages($data['id'], $data['type']);

        //Validation for limited resource types
        $maxMain = $container->getParameter('max_main_resources');
        $maxAdd = $container->getParameter('max_additional_resources');
        $currMain = sizeof($entityManager->getRepository(Resource::class)->findBy(['type'=>1, 'gid'=>$resource->getGid()]));
        $currAdd = sizeof($entityManager->getRepository(Resource::class)->findBy(['type'=>2, 'gid'=>$resource->getGid()]));
        if(($maxMain==$currMain && $data['type']==1)||($maxAdd==$currAdd && $data['type']==2)){
          throw new \Exception('Bad data');
          return new Response();
        }

        $priority = $data['priority']??$resource->getPriority();
        $resource->setPriority(intval($priority));

        $type = $data['type']??$resource->getType();
        $resource->setType(intval($type));

        $Is1c = $data['1c']??$resource->getIs1c();
        $resource->setIs1c(intval($Is1c));

        $IsDeleted = $data['deleted']??$resource->getIsDeleted();
        $resource->setIsDeleted(intval($IsDeleted));

        $IsDefault = $data['default']??$resource->getIsDefault();
        $resource->setIsDefault(intval($IsDefault));

        $em = $this->getDoctrine()->getManager();
        $em->flush($resource);

        $response = new JsonResponse();
        $resourceArray = $serializer->normalize($resource, null, array());
        $response->setData($resourceArray);
        return $response;
    }
}
