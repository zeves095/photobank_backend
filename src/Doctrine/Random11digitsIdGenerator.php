<?php
namespace App\Doctrine;

use Doctrine\ORM\Id\AbstractIdGenerator;
use Doctrine\ORM\EntityManager;

use App\Entity\GarbageNode;

class Random11digitsIdGenerator extends AbstractIdGenerator
{
    public function generate(EntityManager $entityManager, $entity)
    {
        $entity_name = $entityManager->getClassMetadata(get_class($entity))->getName();
        

        $repository = $entityManager->getRepository(GarbageNode::class);
        
        $max_id = $repository->createQueryBuilder('g')
                ->select('MAX(g.id)')
                ->getQuery()
                ->getSingleScalarResult();

        $tryes = 50;

        while ($tryes--)
        {
            $max_id = $this->increment_id($max_id);
            
            $item = $entityManager->find($entity_name, $max_id);

            if (!$item)
            {
                return $max_id;
            }
        }
 
        throw new \Exception('RandomIdGenerator worked hard, but could not generate unique ID :(');
    }

    private function increment_id($max_id)
    {
        $new_max_id = (string) $max_id; // преобразование важно

        if(preg_match('/^([0-8]\d{10}|\d{12})\d*$|\D/', $new_max_id)) // переполнение или недопустимые символы --> исключение
            throw new \Exception('Переполнение длинны входящего идентификаторов или недопустимые символы - СЛУЧИЛОСЬ!!!');

        $new_max_id = str_pad($new_max_id, 10, "0", STR_PAD_LEFT);
        $new_max_id = 10 === strlen($new_max_id) ? '9' . $new_max_id : $new_max_id;


        // 2. Разбить строку по Y символов (например два по 5 плюс первая 9-ка) 
        //    p.s. тут хардкорно сделано из расчета 1 + 10 символов - если будет нужна динамика - переделать на loop
        $new_max_id1 = substr($new_max_id,1,5);
        $new_max_id2 = substr($new_max_id,6,5);
        $new_max_id2 = (string) (( $new_max_id2 * 1 ) + 1);
        $new_max_id2 = str_pad($new_max_id2, 5, "0", STR_PAD_LEFT);
        if(6 === strlen($new_max_id2)) {
            $new_max_id2 = substr($new_max_id2, 1, 5);
            $new_max_id1 = (string) (( $new_max_id1 * 1 ) + 1);
            $new_max_id1 = str_pad($new_max_id1, 5, "0", STR_PAD_LEFT);
            if(6 === strlen($new_max_id1)) throw new \Exception('Переполнение длинны идентификаторов - СЛУЧИЛОСЬ!!!');
        }
        $new_max_id = '9' . $new_max_id1 . $new_max_id2;

        return $new_max_id;
    }
}
