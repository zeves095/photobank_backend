<?php

namespace App\Serializer\Normalizer;

use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\CustomNormalizer;

use App\Entity\CatalogueNode;
use App\Entity\CatalogueNodeItem;

class CatalogueNodeNormalizer extends CustomNormalizer implements NormalizerInterface
{
    /**
     * {@inheritdoc}
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

        return $main_data;
    }

    /**
     * {@inheritdoc}
     */
    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof CatalogueNode;
    }
}
