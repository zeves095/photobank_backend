<?php

namespace App\Service\Search;

use App\Entity\Search\ItemQueryObject;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\CatalogueNodeItem;

class SearchService {

  private $entityManager;

  public function __construct(EntityManagerInterface $entityManager){
    $this->entityManager = $entityManager;
  }

  public function search($queryObject){

    $entityType = $queryObject->getType();
    if($this->entityManager->getMetadataFactory()->isTransient($entityType)){return array();}
    $repository = $this->entityManager->getRepository($entityType);
    if(method_exists($repository,"search")){
      $items = $repository->search($queryObject);
      return $items;
    }else{
      return array();
    }
  }

}
