<?php
/**
 * Нормализатор для вывода данных о ресурсах
 */
namespace App\Serializer\Normalizer;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\CustomNormalizer;
use Symfony\Component\DependencyInjection\ContainerInterface;

use App\Entity\Resource;
/**
 * Нормализатор для вывода данных о ресурсах
 */
class ResourceNormalizer extends CustomNormalizer implements NormalizerInterface
{

    /**
  * Сервис-контейнер Symfony
  */
private $container;

    /**
     * Конструктор класса
     * @param ContainerInterface $container Сервис-контейнер Symfony
     */
    public function __construct(ContainerInterface $container){
      $this->container = $container;
    }

    /**
     * {@inheritdoc}
     *
     * @param Resource $object Объект, который нужно нормализовать
     * @param  string $format  Формат, в котором будет получен ответ
     * @param  array  $context Опции контекста для нормализации
     */
    public function normalize($object, $format = null, array $context = array())
    {
        $main_data = [
            'id'     => $object->getId(),
            'gid'     => $object->getGid(),
            'path'     => $this->container->getParameter('upload_directory')."/".$object->getPath(),
            'username'   => $object->getUsername(),
            'preset' => $object->getPreset(),
            'type' => $object->getType(),
            'chunkPath' => $object->getChunkPath(),
            'created_on' => $object->getCreatedOn(),
            'filename' => $object->getFilename(),
            'src_filename' => $object->getSrcFilename(),
            'size_bytes' => $object->getSizeBytes(),
            'size_px' => $object->getSizePx(),
            'is1c' => $object->getIs1c(),
            'isDeleted' => $object->getIsDeleted(),
            'isDefault' => $object->getIsDefault(),
            'priority' => $object->getPriority(),
            'comment' => $object->getComment(),
            'item' => $object->getItem()?$object->getItem()->getId():$object->getItem(),
        ];

        if($context['add-relation']??false){
            $main_data = array_merge($main_data, [
                'item' => $this->serializer->normalize($object->getItem(), $format, [])
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
        return $data instanceof Resource;
    }
}
