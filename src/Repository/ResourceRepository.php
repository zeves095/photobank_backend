<?php
/**
* Репозиторий Doctrine ORM для работы с сущностями типа "Resource"
*/
namespace App\Repository;

use App\Entity\Resource;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;
use App\Entity\Search\ResourceQueryObject;

/**
* Репозиторий Doctrine ORM для работы с сущностями типа "Resource"
*
 * @method Resource|null find($id, $lockMode = null, $lockVersion = null)
 * @method Resource|null findOneBy(array $criteria, array $orderBy = null)
 * @method Resource[]    findAll()
 * @method Resource[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ResourceRepository extends ServiceEntityRepository
{
  /**
   * Конструктор класса
   * @param RegistryInterface $registry Внутренний инструмент работы с подключениями Doctrine ORM
   */
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Resource::class);
    }

    /**
    * Выполняет поиск главного ресурса в группе
    *
    * @param CatalogueNodeItem $item Товар, которому принадлежит искомый ресурс
    *
    * @return Resource Найденный ресурс
    *
    */
    public function findOriginalResources($item)
    {

        return $this->createQueryBuilder('r')
            ->andWhere('r.item = :item')
            ->setParameter('item', $item)
            ->andWhere('r.gid = r.id')
            ->orderBy('r.id', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }

    /**
    * Выполняет поиск ресурса по разделу каталога во вложенных разделах
    *
    * @param CatalogueNode $node Раздел каталога, в котором проводится поиск
    *
    * @return Resource[] результат поиска
    *
    */
    public function getNestedResourcesByParent($node)
    {
      $queryBuilder = $this->createQueryBuilder('r');
      $queryBuilder->leftJoin('r.item', 'item')
       ->leftJoin('item.node', 'parent2')
       ->leftJoin('parent2.parent', 'parent3')
       ->leftJoin('parent3.parent', 'parent4')
       ->leftJoin('parent4.parent', 'parent5')
       ->leftJoin('parent5.parent', 'parent6')
       ->andWhere('r.autogenerated = 0')
       ->andWhere('item.id = :pcode')
       ->orWhere('parent2.id = :pcode')
       ->orWhere('parent3.id = :pcode')
       ->orWhere('parent4.id = :pcode')
       ->orWhere('parent5.id = :pcode')
       ->orWhere('parent6.id = :pcode')
       ->setParameter('pcode', $node);
      return $queryBuilder->setMaxResults(1500)->getQuery()->getResult();

    }

    /**
    * Получает ресурс с пресетом thumbnail(1) привязанный к ресурсу
    *
    * @param int $id Идентификатор ресурса
    *
    * @return Resource Найденный ресурс
    *
    */
    public function getThumbnail($id)
    {
      $queryBuilder = $this->createQueryBuilder('r')
      ->join($this->_entityName, 'r2')
      ->andWhere('r.id = :id')
      ->andWhere('r2.gid = r.gid')
      ->andWhere('r2.preset = 1')
      ->setParameter('id', $id);
      return $queryBuilder->getQuery()->getOneOrNullResult();
    }

    /**
    * Создает массив идентификаторов пресетов tumbnail(1) для ряда ресурсов
    *
    * @param int[] $ids Идентификаторы ресурсов, для которых необходимо найти пресеты
    *
    * @return mixed[] Найденный ресурс
    *
    */
    public function getThumbnailIds($ids)
    {
      $query = $this->getEntityManager()->createQuery(
        'SELECT r.id, r2.id as thumb_id
        FROM '.$this->_entityName.' r
        INNER JOIN '.$this->_entityName.' r2
        WHERE r.id IN ('.implode(',',$ids).')
        AND r2.gid = r.gid
        AND r2.preset = 1'
      );
      return $query->execute();
    }

    /**
    * Выполняет поиск ресурсов по ряду полей из формы
    *
    * @param ResourceQueryObject $queryObject Объект поиска
    * @see App\Entity\Search\ResourceQueryObject
    *
    * @return Resource[] Найденные ресурсы
    *
    */

      public function search(ResourceQueryObject $queryObject)
      {
        $queryBuilder = $this->createQueryBuilder('r');
        if($queryObject->getField("item_query")->getField("name") != ""){
          $queryBuilder->innerJoin('r.item', 'i')
          ->andWhere('i.name LIKE :iname')
          ->setParameter('iname', '%'.$queryObject->getField("item_query")->getField("name").'%');
        }
        if($queryObject->getField("item_query")->getField("code") != ""){
          $queryBuilder->innerJoin('r.item', 'ic');
          $codes = $queryObject->getField("item_query")->getField("code");
          if(sizeof($codes)===1){
            $queryBuilder->andWhere('ic.id LIKE :iccode')
            ->setParameter('iccode', '%'.$codes[0]);
          }else{
            $codeCounter = 0;
            foreach($codes as $code){
              $queryBuilder->orWhere('ic.id = :iccode'.++$codeCounter)
              ->setParameter('iccode'.$codeCounter, $code);
            }
          }
          $codeCounter = 0;

        }
        if($queryObject->getField("item_query")->getField("article") != ""){
          $articleCounter = 0;
          $queryBuilder->innerJoin('r.item', 'ia');
          foreach($queryObject->getField("item_query")->getField("article") as $article){
              $queryBuilder
              ->orWhere('ia.article = :article'.$articleCounter)
              ->setParameter('article'.$articleCounter++, $article);
          }
        }
        if($queryObject->getField("item_query")->getField("parent_name") != "" && $queryObject->getField("item_query")->getField("search_nested") == "false"){
          $queryBuilder->innerJoin('r.item', 'in')
          ->leftJoin('in.node', 'n')
          ->andWhere('n.name LIKE :nname')
          ->orWhere('n.id LIKE :ncode')
          ->setParameter('nname', '%'.$queryObject->getField("item_query")->getField("parent_name").'%')
          ->setParameter('ncode', '%'.$queryObject->getField("item_query")->getField("parent_name"));
        }
        if($queryObject->getField("item_query")->getField("parent_name") != "" && $queryObject->getField("item_query")->getField("search_nested") == "true"){
          $queryBuilder->innerJoin('r.item', 'parent')
          ->leftJoin('parent.node', 'parent1')
         ->leftJoin('parent1.parent', 'parent2')
         ->leftJoin('parent2.parent', 'parent3')
         ->leftJoin('parent3.parent', 'parent4')
         ->leftJoin('parent4.parent', 'parent5')
         ->leftJoin('parent5.parent', 'parent6')
         ->andWhere('parent.name LIKE :pname')
         ->orWhere('parent1.name LIKE :pname')
         ->orWhere('parent2.name LIKE :pname')
         ->orWhere('parent3.name LIKE :pname')
         ->orWhere('parent4.name LIKE :pname')
         ->orWhere('parent5.name LIKE :pname')
         ->orWhere('parent6.name LIKE :pname')
         ->orWhere('parent.id LIKE :pcode')
         ->orWhere('parent1.id LIKE :pcode')
         ->orWhere('parent2.id LIKE :pcode')
         ->orWhere('parent3.id LIKE :pcode')
         ->orWhere('parent4.id LIKE :pcode')
         ->orWhere('parent5.id LIKE :pcode')
         ->orWhere('parent6.id LIKE :pcode')
         // ->orderBy('parent.name,parent2.name,parent3.name,parent4.name,parent5.name,parent6.name','ASC')
         ->orderBy('parent.name', 'ASC')
         ->setParameter('pname', '%'.$queryObject->getField("item_query")->getField("parent_name").'%')
         ->setParameter('pcode', '%'.$queryObject->getField("item_query")->getField("parent_name"));
       }
       if($queryObject->getField("id") != ""){
         $queryBuilder->andWhere('r.id = :id')
         ->setParameter('id', $queryObject->getField("id"));
       }
       if($queryObject->getField("preset") != ""){
         $queryBuilder->andWhere('r.preset = :preset')
         ->setParameter('preset', $queryObject->getField("preset"));
       }
       if($queryObject->getField("type") != ""){
         $queryBuilder->join($this->_entityName, 'r2')
         ->andWhere('r.gid = r2.gid')
         ->andWhere('r2.type = :type')
         ->setParameter('type', $queryObject->getField("type"));
       }
        //var_dump($queryBuilder->getDQL());
        //var_dump($queryObject);
        //var_dump($queryBuilder->setMaxResults(100)->getQuery());
        return $queryBuilder->setMaxResults(100)->getQuery()->getResult();

      }

//    /**
//     * @return Resource[] Returns an array of Resource objects
//     */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('r.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Resource
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
