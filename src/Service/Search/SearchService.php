<?php
/**
 * Сервис для осущетсвления поиска сущностей Doctrine ORM
 */
namespace App\Service\Search;

use App\Entity\Search\ItemQueryObject;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\CatalogueNodeItem;
/**
 * Сервис для осущетсвления поиска сущностей Doctrine ORM
 */
class SearchService {

  /**
  * Инструмент работы с сущностями Doctrine ORM
  */
private $entityManager;

  /**
   * Конструктор класса
   * @param EntityManagerInterface $entityManager Инструмент работы с сущностями Doctrine ORM
   */
  public function __construct(EntityManagerInterface $entityManager){
    $this->entityManager = $entityManager;
  }

  /**
   * Выполняет поиск сущностей через репозиторий
   * @param mixed $queryObject Объект поиска
   * @return mixed[] Результат поиска
   */
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
