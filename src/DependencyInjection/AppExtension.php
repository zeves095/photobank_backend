<?php
namespace App\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class AppExtension extends Extension
{
  public function load(array $configs, ContainerBuilder $container)
  {
    $loader = new YamlFileLoader(
      $container,
      new FileLocator(__DIR__.'/../../config')
    );
    $loader->load('services.yaml');

    $configuration = new Configuration();
    $config = $this->processConfiguration($configuration, $configs);
    $container->setParameter('upload_directory', $config['back']['dupload_directory']);
    $container->setParameter('upload_target_url', $config['back']['tupload_target_url']);
    $container->setParameter('existing_uploads_url', $config['front']['existing_uploads_url']);
    $container->setParameter('unfinished_uploads_url', $config['front']['unfinished_uploads_url']);
    $container->setParameter('commit_upload_url', $config['front']['commit_upload_url']);
    $container->setParameter('remove_upload_url', $config['front']['remove_upload_url']);
    $container->setParameter('update_resource_url', $config['front']['update_resource_url']);
    $container->setParameter('get_nodes_url', $config['front']['get_nodes_url']);
    $container->setParameter('get_items_url', $config['front']['get_items_url']);
    $container->setParameter('max_main_resources', $config['front']['max_main_resources']);
    $container->setParameter('max_additional_resources', $config['front']['max_additional_resources']);
  }
}
