<?php

namespace App\Serializer\Normalizer;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\CustomNormalizer;

use App\Entity\Resource;

class ResourceNormalizer extends CustomNormalizer implements NormalizerInterface
{
    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = array())
    {
        return [
            'id'     => $object->getId(),
            'gid'     => $object->getGid(),
            'path'     => $object->getPath(),
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
    }

    /**
     * {@inheritdoc}
     */
    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Resource;
    }
}
