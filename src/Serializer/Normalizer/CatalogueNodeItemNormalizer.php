<?php

namespace App\Serializer\Normalizer;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\CustomNormalizer;

use App\Entity\Resource;
use App\Entity\CatalogueNodeItem;

class CatalogueNodeItemNormalizer extends CustomNormalizer implements NormalizerInterface
{
    /**
     * {@inheritdoc}
     */
    public function normalize($object, $format = null, array $context = array())
    {
        return [
            'id'     => $object->getId(),
            'name'   => $object->getName(),
            'itemCode' => $object->getItemCode(),
            'node' => $object->getNode()?$object->getNode()->getId():$object->getNode(),
            'resources' => array_map(
                function (Resource $resource) use ($format, $context){
                    return $this->serializer->normalize($resource, $format, $context);
                },
                $object->getResources()->toArray()
            ),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof CatalogueNodeItem;
    }
}
