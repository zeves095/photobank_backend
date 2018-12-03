<?php

namespace App\Repository;

use App\Entity\Resource;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;
use App\Entity\Search\ResourceQueryObject;

/**
 * @method Resource|null find($id, $lockMode = null, $lockVersion = null)
 * @method Resource|null findOneBy(array $criteria, array $orderBy = null)
 * @method Resource[]    findAll()
 * @method Resource[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ResourceRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Resource::class);
    }

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

    public function getNestedResourcesByParent($node)
    {
      $queryBuilder = $this->createQueryBuilder('r');
      $queryBuilder->leftJoin('r.item', 'item')
       ->leftJoin('item.node', 'parent2')
       ->leftJoin('parent2.parent', 'parent3')
       ->leftJoin('parent3.parent', 'parent4')
       ->leftJoin('parent4.parent', 'parent5')
       ->leftJoin('parent5.parent', 'parent6')
       ->where('r.autogenerated = 0')
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
      * @return Resource[] Returns an array of Resource objects
      */

      public function search(ResourceQueryObject $queryObject)
      {
        $queryBuilder = $this->createQueryBuilder('r');
        if($queryObject->getField("item_query")->getField("name") != ""){
          $queryBuilder->innerJoin('r.item', 'c')
          ->andWhere('c.name LIKE :name')
          ->setParameter('name', '%'.$queryObject->getField("item_query")->getField("name").'%');
        }
        if($queryObject->getField("item_query")->getField("code") != ""){
          $codeCounter = 0;
          foreach($queryObject->getField("item_query")->getField("code") as $code){
              $queryBuilder->innerJoin('r.item', 'c')
              ->orWhere('c.id LIKE :code'.$codeCounter)
              ->setParameter('code'.$codeCounter++, '%'.$code);
          }
        }
        if($queryObject->getField("item_query")->getField("parent_name") != "" && $queryObject->getField("item_query")->getField("search_nested") == 0){
          $queryBuilder->innerJoin('r.item', 'c')
          ->leftJoin('c.node', 'parent')
          ->where('parent.name LIKE :pname')
          ->orWhere('parent.id LIKE :pcode')
          ->setParameter('pname', '%'.$queryObject->getField("item_query")->getField("parent_name").'%')
          ->setParameter('pcode', '%'.$queryObject->getField("item_query")->getField("parent_name"));
        }
        if($queryObject->getField("item_query")->getField("parent_name") != "" && $queryObject->getField("item_query")->getField("search_nested") == 1){
          $queryBuilder->innerJoin('r.item', 'c')
          ->leftJoin('c.node', 'parent')
         ->leftJoin('parent.parent', 'parent2')
         ->leftJoin('parent2.parent', 'parent3')
         ->leftJoin('parent3.parent', 'parent4')
         ->leftJoin('parent4.parent', 'parent5')
         ->leftJoin('parent5.parent', 'parent6')
         ->where('parent.name LIKE :pname')
         ->orWhere('parent2.name LIKE :pname')
         ->orWhere('parent3.name LIKE :pname')
         ->orWhere('parent4.name LIKE :pname')
         ->orWhere('parent5.name LIKE :pname')
         ->orWhere('parent6.name LIKE :pname')
         ->orWhere('parent.id LIKE :pcode')
         ->orWhere('parent2.id LIKE :pcode')
         ->orWhere('parent3.id LIKE :pcode')
         ->orWhere('parent4.id LIKE :pcode')
         ->orWhere('parent5.id LIKE :pcode')
         ->orWhere('parent6.id LIKE :pcode')
         // ->orderBy('parent.name,parent2.name,parent3.name,parent4.name,parent5.name,parent6.name','ASC')
         ->orderBy('c.name', 'ASC')
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
         $queryBuilder->andWhere('r.type = :type')
         ->setParameter('type', $queryObject->getField("preset"));
       }
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
