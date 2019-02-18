<?php

namespace App\Repository;

use App\Entity\GarbageNode;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method GarbageNode|null find($id, $lockMode = null, $lockVersion = null)
 * @method GarbageNode|null findOneBy(array $criteria, array $orderBy = null)
 * @method GarbageNode[]    findAll()
 * @method GarbageNode[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class GarbageNodeRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, GarbageNode::class);
    }

    // /**
    //  * @return GarbageNode[] Returns an array of GarbageNode objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('g.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?GarbageNode
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
