<?php
/**
  * Сервис для создания, обновления, удаления и получения информации по объектам типа "GarbageNode"
  */

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\GarbageNode;
use App\Entity\Resource;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
  * Сервис для создания, обновления, удаления и получения информации по объектам типа "GarbageNode"
  */
class GarbageService{
  /**
    * Инструмент работы с сущностями Doctrine ORM
    */
  private $entityManager;
  /**
    * Сервис-контейнер Symfony
    */
  private $container;

  /**
    * Конструктор класса
    *
    * @param EntityManagerInterface $entityManager Для создания и обновления сущностей в базе данных
    * @param ContainerInterface $container Для получения параметров конфигурации
    */
  public function __construct(EntityManagerInterface $entityManager, ContainerInterface $container)
  {
    $this->entityManager = $entityManager;
    $this->container = $container;
  }

  public function createNode($name, $parent)
  {
    $node = new GarbageNode();
    $node->setName($name);
    $parent = $this->entityManager->getRepository(GarbageNode::class)->findOneBy(['id'=>$parent]);
    $node->setParent($parent);
    $node->setDeleted(false);
    $this->entityManager->persist($node);
    $this->entityManager->flush();
    return ['successful'=>true];
  }

  public function updateNode($id, $params)
  {
    $repo = $this->entityManager->getRepository(GarbageNode::class);
    $node = $repo->findOneBy(['id'=>$id]);
    isset($params['name'])&&$node->setName($params['name']);
    if(isset($params['parent'])){
      $parent = $repo->findOneBy(['id'=>$params['parent']]);
      $node->setParent($parent);
    }
    var_dump([$id,$params]);
    $this->entityManager->flush();
    return ['successful'=>true];
  }

  public function removeNode($id)
  {
    $repo = $this->entityManager->getRepository(GarbageNode::class);
    $resRepo = $this->entityManager->getRepository(Resource::class);
    if(sizeof($repo->findBy(['parent'=>$id, 'deleted' => false]))>0||sizeof($resRepo->findBy(['garbageNode'=>$id]))>0){
      return ['successful'=>false, 'error'=>'Папка не пуста'];
    }
    $node = $repo->findOneBy(['id'=>$id]);
    $node->setDeleted(true);
    $this->entityManager->flush();
    return ['successful'=>true];
  }

}
