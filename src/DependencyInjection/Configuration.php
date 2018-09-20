<?php
namespace App\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

class Configuration implements ConfigurationInterface
{
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();
        $rootNode = $treeBuilder->root('photobank');

        $rootNode
            ->children()
                ->arrayNode('front')
                    ->children()
                        ->scalarNode('upload_target_url')
                            ->defaultValue('/api/upload/')
                        ->end()
                        ->scalarNode('existing_uploads_url')
                            ->defaultValue('/catalogue/node/item/resources/')
                        ->end()
                        ->scalarNode('unfinished_uploads_url')
                            ->defaultValue('/api/upload/unfinished/')
                        ->end()
                        ->scalarNode('commit_upload_url')
                            ->defaultValue('/api/upload/commit')
                        ->end()
                        ->scalarNode('remove_upload_url')
                            ->defaultValue('/api/upload/remove')
                        ->end()
                        ->scalarNode('update_resource_url')
                            ->defaultValue('/catalogue/node/item/resource/')
                        ->end()
                        ->scalarNode('get_nodes_url')
                            ->defaultValue('/catalogue/nodes/')
                        ->end()
                        ->scalarNode('get_items_url')
                            ->defaultValue('/catalogue/node/items/')
                        ->end()
                        ->integerNode('max_main_resources')
                            ->defaultValue(1)
                        ->end()
                        ->integerNode('max_additional_resources')
                            ->defaultValue(7)
                        ->end()
                    ->end()
                ->end()
            ->end()
        ;

        return $treeBuilder;
    }
}
