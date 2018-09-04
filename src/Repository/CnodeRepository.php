<?php

namespace App\Repository;

use App\Entity\Cnode;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method Cnode|null find($id, $lockMode = null, $lockVersion = null)
 * @method Cnode|null findOneBy(array $criteria, array $orderBy = null)
 * @method Cnode[]    findAll()
 * @method Cnode[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CnodeRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Cnode::class);
    }

//    /**
//     * @return Cnode[] Returns an array of Cnode objects
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
    public function findOneBySomeField($value): ?Cnode
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
