<?php
/**
* Репозиторий Doctrine ORM для работы с сущностями типа "CatalogueNode"
*/
namespace App\Repository;

use App\Entity\CatalogueNode;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
* Репозиторий Doctrine ORM для работы с сущностями типа "CatalogueNode"
*
 * @method CatalogueNode|null find($id, $lockMode = null, $lockVersion = null)
 * @method CatalogueNode|null findOneBy(array $criteria, array $orderBy = null)
 * @method CatalogueNode[]    findAll()
 * @method CatalogueNode[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CatalogueNodeRepository extends ServiceEntityRepository
{
  /**
   * Конструктор класса
   * @param RegistryInterface $registry Внутренний инструмент работы с подключениями Doctrine ORM
   */
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, CatalogueNode::class);
    }

//    /**
//     * @return CatalogueNode[] Returns an array of CatalogueNode objects
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
    public function findOneBySomeField($value): ?CatalogueNode
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
