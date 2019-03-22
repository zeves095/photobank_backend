<?php
/**
* Репозиторий Doctrine ORM для работы с сущностями типа "Link"
*/
namespace App\Repository;

use App\Entity\Link;
use App\Entity\Resource;
use App\Entity\CatalogueNodeItem;
use App\Entity\GarbageNode;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
* Репозиторий Doctrine ORM для работы с сущностями типа "Link"
*
 * @method Link|null find($id, $lockMode = null, $lockVersion = null)
 * @method Link|null findOneBy(array $criteria, array $orderBy = null)
 * @method Link[]    findAll()
 * @method Link[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class LinkRepository extends ServiceEntityRepository
{
  /**
   * Конструктор класса
   * @param RegistryInterface $registry Внутренний инструмент работы с подключениями Doctrine ORM
   */
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, Link::class);
    }

    /**
    * Получает информацию по ссылкам конкретного пользователя с полями, относящимися к привязанным ресурсам и товарам
    *
    * @param int $user_id Идентификатор пользователя
    *
    * @return mixed[] результат поиска
    *
    */
    public function fetchWithResourceAndItemInfo($user_id)
    {
      $query = $this->getEntityManager()->createQuery(
        'SELECT DISTINCT l.id as link_id, r.id as resource_id, i.id as item_id, l.target,
        l.external_url, i.name as item_name
        FROM '.$this->_entityName.' l
        INNER JOIN '.(Resource::class).' r WITH r.id = l.src_id
        LEFT JOIN r.item i
        LEFT JOIN r.garbageNode gn
        WHERE (r.item = i.id OR r.garbageNode = gn.id )
        AND l.created_by = '. $user_id
      );
      return $query->execute();
    }

}
