<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
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
    public function getResources(CatalogueNodeItem $citem, AppSerializer $serializer)
    {
        $response = new JsonResponse();
        
        $resources = $citem->getResources();
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
    public function getResourceRaw($_format, Resource $resource)
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
        $fileDirectory = $upload_directory . '/12/31/23/12/31/2/'; 
        $filename = $resource->getFilename();
        $fullFilePath = $fileDirectory . $filename;
        $src_filename = $resource->getSrcFilename()?:'noName';

        return $this->file($fullFilePath, $src_filename, ResponseHeaderBag::DISPOSITION_INLINE);
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
    public function patchResource(Resource $resource, Request $request, AppSerializer $serializer)
    {
        
        // {id: "11", priority: "", 1c: false, deleted: false, default: true}
        $data = json_decode(
            $request->getContent(),
            true
        );

        $priority = $data['priority']??$resource->getPriority();
        $resource->setPriority($priority);

        $Is1c = $data['1c']??$resource->getIs1c();
        $resource->setIs1c($Is1c);
        
        $IsDeleted = $data['deleted']??$resource->getIsDeleted();
        $resource->setIsDeleted($IsDeleted);

        $IsDefault = $data['default']??$resource->getIsDefault();
        $resource->setIsDefault($IsDefault);
        
        $em = $this->getDoctrine()->getManager();
        $em->flush($resource);

        $response = new JsonResponse();
        $resourceArray = $serializer->normalize($resource, null, array());
        $response->setData($resourceArray);
        return $response;
    }
}


