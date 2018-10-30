<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Resource;
use App\Service\ResourceService;

class ThmbnailgenController extends AbstractController
{
    /**
     * @Route("/thmbnailgen", name="thmbnailgen")
     */
    public function index(EntityManagerInterface $em, ResourceService $rs)
    {

        $repo = $em->getRepository(Resource::class);
        $res = $repo->findAll();

        foreach($res as $r){
          $rs->dispatchPresetMessages($r->getId(), $r->getType());
        }

        return $this->render('thmbnailgen/index.html.twig', [
            'controller_name' => 'ThmbnailgenController',
        ]);
    }
}
