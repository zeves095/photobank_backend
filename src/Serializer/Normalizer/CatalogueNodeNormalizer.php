<?php
/**
 * Нормализатор для вывода данных о разделах каталога
 */
namespace App\Serializer\Normalizer;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\CustomNormalizer;

use App\Entity\CatalogueNode;
use App\Entity\CatalogueNodeItem;
/**
 * Нормализатор для вывода данных о разделах каталога
 */
class CatalogueNodeNormalizer extends CustomNormalizer implements NormalizerInterface
{
  /**
   * {@inheritdoc}
   *
   * @param CatalogueNode $object Объект, который нужно нормализовать
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
                function (CatalogueNode $child) {
                    return $child->getId();
                },
                $object->getChildren()->toArray()
            ),
        ];

        if($context['add-relation']??false){
            $main_data = array_merge($main_data, [
                'items' => array_map(
                    function (CatalogueNodeItem $item) use ($format, $context){
                        return $this->serializer->normalize($item, $format, $context);
                    },
                    $object->getItems()->toArray()
                ),
            ]);
        }

        if($context['add-item-count']??false){
            $main_data = array_merge($main_data, [
                'items_count' => $object->getItems()->count()
            ]);
        }

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
        return $data instanceof CatalogueNode;
    }
}
