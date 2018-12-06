<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Messenger\MessageBusInterface;
use App\Message\LinkCreatedMessage;
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
      if(sizeof($data['resource'])==0){
        throw new HttpException(400);
      }
      foreach($data['resource'] as $res_id){
        $post = $data;
        $user = $this->getUser();
        $username = $user->getUsername();
        $params = [
          'access'=> $post['access'],
          'target'=> $post['target'],
          'expires_by'=> $post['expires_by'],
          'comment'=> $post['comment'],
          'max_requests'=> $post['max_requests'],
          'created_by'=>$user,
        ];

        $link = $linkService->createLink($params);
        $linkId = $link->getId();
        $linkHash = $link->getHash();

        $bus->dispatch(new LinkCreatedMessage($linkId, $linkHash, $username, $res_id['id'], $post['custom_size']));
      }
      return new Response();
    }

    /**
     * @Route("/get/{link_hash}.jpg", name="links_get")
     */
     public function getResource($link_hash, Request $request, LinkService $linkService)
     {
        $imageData = $linkService->getImageData($link_hash, $request);
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
         $links = $linkService->fetchAllForUser($user);
         $links = $serializer->normalize($links, null, array(
             ObjectNormalizer::ENABLE_MAX_DEPTH => true,
             'groups' => array('main')
         ));
         $response = new JsonResponse($links);
         return $response;
      }

      /**
       * @Route("/delete/{link}", name="links_delete")
       */
       public function delete($link, Request $request, LinkService $linkService, AppSerializer $serializer)
       {
          $user = $this->getUser()->getId();
          $response = $linkService->deleteLink($link, $user);
          $response = new JsonResponse($response);
          return $response;
       }


}
