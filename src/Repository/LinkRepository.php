<?php

namespace App\Repository;

use App\Entity\Link;
use App\Entity\Resource;
use App\Entity\CatalogueNodeItem;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method Link|null find($id, $lockMode = null, $lockVersion = null)
 * @method Link|null findOneBy(array $criteria, array $orderBy = null)
 * @method Link[]    findAll()
 * @method Link[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class LinkRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Link::class);
    }

    public function fetchWithResourceAndItemInfo($user_id)
    {
      $query = $this->getEntityManager()->createQuery(
        'SELECT l.id as link_id, r.id as resource_id, i.id as item_id, l.target, 
        l.external_url, i.name as item_name
        FROM '.$this->_entityName.' l
        INNER JOIN '.(Resource::class).' r
        INNER JOIN '.(CatalogueNodeItem::class).' i
        WHERE l.src_id = r.id
        AND r.item = i.id
        AND l.created_by = '. $user_id
      );
      return $query->execute();
    }

//    /**
//     * @return Link[] Returns an array of Link objects
//     */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('l.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Link
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
