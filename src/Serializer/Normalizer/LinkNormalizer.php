<?php

namespace App\Serializer\Normalizer;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\CustomNormalizer;

use App\Entity\Link;

class LinkNormalizer extends CustomNormalizer implements NormalizerInterface
{
    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = array())
    {
        $main_data = [
            'id'     => $object->getId(),
            'created_by'   => $object->getCreatedBy()->getId(),
            'external_url' => $object->getExternalUrl(),
            'size_px' => $object->getSizePx(),
        ];
        return $main_data;
    }

    /**
     * {@inheritdoc}
     */
    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Link;
    }
}
