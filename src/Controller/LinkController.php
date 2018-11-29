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

class LinkController extends AbstractController
{
    /**
     * @Route("/link", name="link")
     */
    public function index()
    {
        return $this->render('link/index.html.twig', [
            'controller_name' => 'LinkController',
        ]);
    }

    /**
     * @Route("/link/create", name="create_link")
     */
    public function create(Request $request, LinkService $linkService, MessageBusInterface $bus)
    {
      $post = $request->request;
      $user = $this->getUser();
      $username = $user->getUsername();
      $params = [
        'access'=> $post->get('access'),
        'target'=> $post->get('target'),
        'expires_by'=> $post->get('expires_by'),
        'comment'=> $post->get('comment'),
        'max_requests'=> $post->get('max_requests'),
        'created_by'=>$user,
      ];

      $link = $linkService->createLink($params);
      $linkId = $link->getId();
      $linkHash = $link->getHash();

      $bus->dispatch(new LinkCreatedMessage($linkId, $linkHash, $username, $post));

      return new Response();
    }
}
