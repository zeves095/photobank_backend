<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\MessageBusInterface;
use App\Message\LinkCreatedMessage;
use App\Message\LinkDeletedMessage;
use App\Service\LinkService;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Serializer\AppSerializer;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;

/**
  * @Route("/api/links")
  */
class LinkController extends AbstractController
{
    /**
     * @Route("/test", name="links")
     */
    public function index()
    {
        return $this->render('link/index.html.twig', [
            'controller_name' => 'LinkController',
        ]);
    }

    /**
     * @Route("/submit", name="links_create")
     */
    public function create(Request $request, LinkService $linkService, MessageBusInterface $bus)
    {

      $data = json_decode(
          $request->getContent(),
          true
      );
      $resourceIds = explode(',',$data['resource']);
      if(sizeof($resourceIds)==0){
        throw new HttpException(400);
      }
      foreach($resourceIds as $res_id){
        $post = $data;
        $user = $this->getUser();
        $username = $user->getUsername();
        $params = [
          'access'=> isset($post['access'])?$post['access']:null,
          'target'=> isset($post['target'])?$post['target']:null,
          'expires_by'=> isset($post['expires_by'])?$post['expires_by']:null,
          'comment'=> isset($post['comment'])?$post['comment']:null,
          'max_requests'=> isset($post['max_requests'])?$post['max_requests']:null,
          'created_by'=>$user,
          'resource'=>$res_id
        ];

        $link = $linkService->createLink($params);
        $linkId = $link->getId();
        $linkHash = $link->getHash();

        $custom_size = isset($post['size']['height'])&&isset($post['size']['width'])?$post['size']['width']."/".$post['size']['height']:null;

        $bus->dispatch(new LinkCreatedMessage($linkId, $linkHash, $username, $res_id, $custom_size));
      }
      return new Response();
    }

    /**
     * @Route("/update/{link_id}", name="links_update")
     */
     public function updateLink($link_id, Request $request, LinkService $linkService)
     {
        $user = $this->getUser();
        $data = json_decode(
            $request->getContent(),
            true
        );
        $params = $data;
        if($linkService->userIsOwner($link_id, $user->getId())){
            $linkService->updateLink($params);
        }else{
            throw new HttpException(403);
        }
        $response = new JsonResponse();
        return $response;
     }

    /**
     * @Route("/get/{link_hash}.jpg", name="links_get")
     */
     public function getResource($link_hash, Request $request, LinkService $linkService)
     {
        $user = $this->getUser();
        $imageData = $linkService->getImageData($link_hash, $request, $user);
        $image = $imageData['content'];
        $headers = array(
          'Content-Type'     => 'image/jpeg',
          'Content-Disposition' => 'inline; filename="'.$imageData['filename'].'"');
        return new Response($image, 200, $headers);
     }

    /**
     * @Route("/get/{link_hash}", name="links_get_data")
     */
     public function getLinkData($link_hash, Request $request, LinkService $linkService)
     {
        var_dump($link_hash);
        return new Response();
     }

     /**
      * @Route("/fetchall", name="links_fetch_all")
      */
      public function fetchAll(Request $request, LinkService $linkService, AppSerializer $serializer)
      {
         $user = $this->getUser();

         $links = $linkService->fetchAllWithExtraFields($user);

         // Альтернативный способ получения линков если нет нужды в полях, привязанных к сущностям Resource и CatalogueNodeItem
         // $links = $linkService->fetchAllForUser($user);
         // $links = $serializer->normalize($links, null, array(
         //     ObjectNormalizer::ENABLE_MAX_DEPTH => true,
         //     'groups' => array('main')
         // ));
         $response = new JsonResponse($links);
         return $response;
      }

      /**
       * @Route("/delete/{link}", name="links_delete")
       */
       public function delete($link, Request $request, LinkService $linkService, AppSerializer $serializer, MessageBusInterface $bus)
       {
          $user = $this->getUser()->getId();
          $bus->dispatch(new LinkDeletedMessage($link, $user));
          $response = new JsonResponse();
          return $response;
       }


}
