<?php

namespace App\Repository;

use App\Entity\CatalogueNodeItem;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;
use App\Entity\Search\ItemQueryObject;

/**
 * @method CatalogueNodeItem|null find($id, $lockMode = null, $lockVersion = null)
 * @method CatalogueNodeItem|null findOneBy(array $criteria, array $orderBy = null)
 * @method CatalogueNodeItem[]    findAll()
 * @method CatalogueNodeItem[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CatalogueNodeItemRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, CatalogueNodeItem::class);
    }

  /**
    * @return CatalogueNodeItem[] Returns an array of CatalogueNodeItem objects
    */

    public function search(ItemQueryObject $queryObject)
    {
      $queryBuilder = $this->createQueryBuilder('c');
      if($queryObject->getField("name") != ""){
        $queryBuilder->andWhere('c.name LIKE :name')
        ->setParameter('name', '%'.$queryObject->getField("name").'%');
      }
      if($queryObject->getField("code") != ""){
        $queryBuilder->andWhere('c.id LIKE :code')
        ->setParameter('code', '%'.$queryObject->getField("code"));
      }
      if($queryObject->getField("parent_name") != ""){
        $queryBuilder->leftJoin('c.node', 'parent')
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
       ->setParameter('pname', '%'.$queryObject->getField("parent_name").'%')
       ->setParameter('pcode', '%'.$queryObject->getField("parent_name"));
     }
      return $queryBuilder->setMaxResults(100)->getQuery()->getResult();

    }



//    /**
//     * @return CatalogueNodeItem[] Returns an array of CatalogueNodeItem objects
//     */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('c.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?CatalogueNodeItem
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
