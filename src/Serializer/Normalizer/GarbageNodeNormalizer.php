<?php
/**
 * Нормализатор для вывода данных о разделах каталога
 */
namespace App\Serializer\Normalizer;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\CustomNormalizer;

use App\Entity\GarbageNode;
use App\Entity\Resource;
/**
 * Нормализатор для вывода данных о разделах каталога "Мусорки"
 */
class GarbageNodeNormalizer extends CustomNormalizer implements NormalizerInterface
{
  /**
   * {@inheritdoc}
   *
   * @param GarbageNode $object Объект, который нужно нормализовать
   * @param  string $format  Формат, в котором будет получен ответ
   * @param  array  $context Опции контекста для нормализации
   */
    public function normalize($object, $format = null, array $context = array())
    {
        $main_data = [
            'id'     => $object->getId(),
            'name'   => $object->getName(),
            'parent' => $object->getParent()?$object->getParent()->getId():$object->getParent(),
            'children' => array_map(
                function (GarbageNode $child) {
                    return $child->getId();
                },
                $object->getChildren()->toArray()
            ),
        ];

        return $main_data;
    }

    /**
     * {@inheritdoc}
     *
     * @param $data Данные для проверки
     * @param $format Формат сериализации/десериализации
     *
     */
    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof GarbageNode;
    }
}
