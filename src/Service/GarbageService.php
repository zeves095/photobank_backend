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

  /**
   * Создает новую папку на свалке
   * @param  string $name   Имя новой папки
   * @param  int $parent Id родителя
   */
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

  /**
   * Устанавливает новое имя или родителя для папки на свалке
   * @param  int $id     Id обновляемой папки
   * @param  object $params Массив параметров для обновления
   */
  public function updateNode($id, $params)
  {
    $repo = $this->entityManager->getRepository(GarbageNode::class);
    $node = $repo->findOneBy(['id'=>$id]);
    isset($params['name'])&&$node->setName($params['name']);
    if(isset($params['parent'])){
      if(!$this->_checkParentRecursion($id, $params['parent'])){return ['successful'=>false, 'error'=>'Нельзя переназначить ресурс на дочерний'];}
      $parent = $repo->findOneBy(['id'=>$params['parent']]);
      $node->setParent($parent);
    }
    $this->entityManager->flush();
    return ['successful'=>true];
  }

  /**
   * Устанавливет флаг deleted в базе для папки
   * @param  int $id Id ресурса для удаления
   */
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

  /**
   * Делает проверку да предмет того, происходит ли попытка установить дочернюю папку ресурса как ее родителя
   * @param  int $nid Id папки
   * @param  int $pid Id папки-рподителя
   */
  private function _checkParentRecursion($nid,$pid)
  {
    $repo = $this->entityManager->getRepository(GarbageNode::class);
    while($pid){
      if($pid == $nid){
        return false;
      }
      $parent = $repo->findOneBy(['id'=>$pid])->getParent();
      if($parent){$pid = $parent->getId();}else{$pid=null;}
    }
    return true;
  }

}
