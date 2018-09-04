<?php
namespace App\PhotoBank\FileUploaderBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

class Configuration implements ConfigurationInterface
{
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('photobank_file_uploader');

        $rootNode
            ->children()
                ->arrayNode('front')
                    ->children()
                        ->scalarNode('chunk_size')
                            ->defaultValue('1*1024*1024')
                        ->end()
                        ->integerNode('simultaneous_uploads')
                            ->defaultValue(3)
                            ->min(1)
                        ->end()
                    ->end()
                ->end()
                ->arrayNode('back')
                    ->children()
                        ->scalarNode('destination_dir')
                            ->defaultValue('/assets/uploads/')
                        ->end()
                        ->scalarNode('temp_dir')
                            ->defaultValue('/assets/uploads/temp/')
                        ->end()
                    ->end()
                ->end()
            ->end()
        ;

        return $treeBuilder;
    }
}
