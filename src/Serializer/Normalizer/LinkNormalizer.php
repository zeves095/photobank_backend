<?php
/**
 * Нормализатор для вывода данных о ссылках на ресурсы
 */
namespace App\Serializer\Normalizer;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\CustomNormalizer;
use App\Entity\Resource;
use App\Entity\Link;
/**
 * Нормализатор для вывода данных о ссылках на ресурсы
 */
class LinkNormalizer extends CustomNormalizer implements NormalizerInterface
{
  /**
   * {@inheritdoc}
   *
   * @param Link $object Объект, который нужно нормализовать
   * @param  string $format  Формат, в котором будет получен ответ
   * @param  array  $context Опции контекста для нормализации
   */
    public function normalize($object, $format = null, array $context = array())
    {
        $main_data = [
            'id'     => $object->getId(),
            'created_by'   => $object->getCreatedBy()->getId(),
            'external_url' => $object->getExternalUrl(),
            'size_px' => $object->getSizePx(),
            'max_requests' => $object->getMaxRequests(),
            'done_requests' => $object->getDoneRequests(),
            'expires_by' => $object->getExpiresBy()!==NULL?date_format($object->getExpiresBy(),"Y-m-d"):NULL,
            'target' => $object->getTarget(),
            'comment' => $object->getComment(),
            'resource' => $object->getSrcId(),
            'symlink' => $object->getSymlink(),
        ];

        if($context['full-info']??false){
          $resource =
          $main_data = array_merge($main_data, [
              'items' => $resource->serializer->normalize($item, $format, ['add-relation'=>true])
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
        return $data instanceof Link;
    }
}
