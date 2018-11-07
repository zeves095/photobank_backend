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
        ->where('parent.name LIKE :pname')
        ->orWhere('parent.id LIKE :pcode')
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
