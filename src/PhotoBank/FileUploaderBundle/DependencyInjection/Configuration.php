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
                        ->integerNode('chunk_size')
                            ->defaultValue(1048576)
                            ->min(1)
                        ->end()
                        ->integerNode('simultaneous_uploads')
                            ->defaultValue(3)
                            ->min(1)
                        ->end()
                        ->scalarNode('target_url')
                            ->defaultValue('/api/upload/')
                        ->end()
                        ->scalarNode('allowed_filetypes')
                            ->defaultValue('jpg,jpeg,png,tiff,ari,dpx,arw,srf,sr2,bay,crw,cr2,dng,dcr,kdc,erf,3fr,mef,mrw,nef,nrw,orf,ptx,pef,raf,raw,rwl,dng,raw,rw2,r3d,srw,x3f')
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
                        ->scalarNode('upload_directory')
                            ->defaultValue('%kernel.project_dir%/public/uploads')
                        ->end()
                    ->end()
                ->end()
            ->end()
        ;

        return $treeBuilder;
    }
}
