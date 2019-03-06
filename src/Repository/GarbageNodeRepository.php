<?php

namespace App\Repository;

use App\Entity\GarbageNode;
use App\Entity\Search\GarbageQueryObject;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

use App\Entity\Resource;

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

    /**
     * Выполняет поиск сущностей по заданным полям
     * @param GarbageQueryObject $queryObject Объект поиска
      * @return GarbageNode[] Возвращает массив найденных нод
      */
      public function search(GarbageQueryObject $queryObject)
      {
        $queryBuilder = $this->createQueryBuilder('g');
        if($queryObject->getField("node_name") != ""){
          $queryBuilder->andWhere('g.name LIKE :nname')
          ->setParameter('nname', '%'.$queryObject->getField("node_name").'%');
        }
        if($queryObject->getField("file_name") != ""){
          $queryBuilder->join('App\Entity\Resource', 'res')
          ->andWhere('res.garbageNode = g.id')
          ->andWhere('res.src_filename LIKE :fname')
          ->setParameter('fname', '%'.$queryObject->getField("file_name").'%');
        }
       //var_dump($queryObject);
        //var_dump($queryBuilder->getDQL());
        return $queryBuilder->setMaxResults(100)->getQuery()->getResult();

      }

}
