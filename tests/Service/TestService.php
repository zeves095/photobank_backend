<?php

namespace App\Tests\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\CatalogueNode;
use App\Entity\GarbageNode;
use App\Entity\CatalogueNodeItem;
use App\Entity\Resource;
use App\Entity\Link;
use App\Entity\Security\User;
use App\Serializer\AppSerializer;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ContainerInterface;

class TestService{

  private $entityManager;
  private $container;
  private $fileSystem;

  public function __construct(EntityManagerInterface $entityManager, ContainerInterface $container, Filesystem $fileSystem)
  {
    $this->entityManager = $entityManager;
    $this->container = $container;
    $this->fileSystem = $fileSystem;
  }

  public function getDataSample()
  {
    $resourceRepo = $this->entityManager->getRepository(Resource::class);
    $itemRepo = $this->entityManager->getRepository(CatalogueNodeItem::class);
    $nodeRepo = $this->entityManager->getRepository(CatalogueNode::class);
    $garbageNodeRepo = $this->entityManager->getRepository(GarbageNode::class);
    $userRepo = $this->entityManager->getRepository(User::class);
    $linkRepo = $this->entityManager->getRepository(Link::class);

    $resources = $resourceRepo->findBy([],['id'=>'ASC'],50);
    $garbageResource = $resourceRepo->findOneBy(['item' => NULL])->getId();
    $items = $itemRepo->findBy([],['id'=>'ASC'],50);
    $nodes = $nodeRepo->findBy([],['id'=>'ASC'],150);
    $garbageNodes = $garbageNodeRepo->findBy([],['id'=>'ASC'],150);
    $users = $userRepo->findBy([],['id'=>'ASC'],100);
    $links = $linkRepo->findBy([],['id'=>'ASC'],100);

    $resourceIds = array();
    $itemIds = array();
    $nodeIds = array();
    $garbageNodeIds = array();
    $linkIds = array();

    foreach($resources as $resource){
      if(!isset($baseResource)
      & $resource->getId() === $resource->getGid()){
        $baseResource = $resource->getId();
      }
      $resourceIds[] = $resource->getId();
    }
    foreach($items as $item){
      if(!isset($itemWithResources)
      & sizeof($item->getResources())>0){
        $itemWithResources = $item->getId();
      }
      $itemIds[] = $item->getId();
    }
    foreach($nodes as $node){
      if(!isset($nodeWithChildren)
      & sizeof($node->getChildren())>0){
        $nodeWithChildren = $node->getId();
      }
      if(!isset($nodeWithItems) && sizeof($node->getItems())>0){
        $nodeWithItems = $node->getId();
      }
      $nodeIds[] = $node->getId();
    }
    foreach($garbageNodes as $node){
      if(!isset($garbageNodeWithChildren)
      & sizeof($node->getChildren())>0){
        $garbageNodeWithChildren = $node->getId();
      }
      $garbageNodeIds[] = $node->getId();
    }
    foreach($users as $user){
      if(!isset($adminObject) && in_array('ROLE_ADMIN', $user->getRoles())){
        $admin = [
          "name"=>$user->getUsername(),
          "password"=>$user->getPassword()
        ];
      }
      if(!in_array('ROLE_SUPER_ADMIN', $user->getRoles())){
          $userIds[] = $user->getId();
      }
    }
    foreach($links as $link){
      $linkIds[] = $link->getId();
    }

    $searchItem = [
      'id'=> $items[0]->getId(),
      'name'=> $items[0]->getName(),
      'parent_name'=> $items[0]->getNode()->getName(),
    ];

    $searchResource = [
      "item_search_name"=>$resources[0]->getItem()->getName(),
      "item_search_parent_name"=>$resources[0]->getItem()->getNode()->getName(),
      "item_search_search_nested"=>"false",
      "item_search_code"=>$resources[0]->getItem()->getId(),
      "resource_search_id"=>$resources[0]->getId(),
      "resource_search_preset"=>$resources[0]->getPreset(),
      "resource_search_type"=>$resources[0]->getType(),
    ];

    $sample = [
      'resources'=>$resourceIds,
      'items'=>$itemIds,
      'nodes'=>$nodeIds,
      'garbageNodes'=>$garbageNodeIds,
      'users'=>$userIds,
      'links'=>$linkIds,
      'admin'=>$admin,
      'nodeWithChildren'=>$nodeWithChildren,
      'garbageNodeWithChildren'=>$garbageNodeWithChildren,
      'nodeWithItems'=>$nodeWithItems,
      'itemWithResources'=>$itemWithResources,
      'baseResource'=>$baseResource,
      'searchItem'=>$searchItem,
      'searchResource'=>$searchResource,
      'garbageResource'=>$garbageResource,
    ];

    return $sample;
  }

}
