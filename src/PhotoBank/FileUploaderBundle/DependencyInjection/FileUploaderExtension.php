<?php
namespace App\PhotoBank\FileUploaderBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class FileUploaderExtension extends Extension
{
  public function load(array $configs, ContainerBuilder $container)
  {
    $loader = new YamlFileLoader(
      $container,
      new FileLocator(__DIR__.'/../Resources/config')
    );
    $loader->load('services.yaml');

    $configuration = new Configuration();
    $config = $this->processConfiguration($configuration, $configs);

    $this->addAnnotatedClassesToCompile(array(
        '@FileUploaderBundle\\Controller',
    ));
  }
}
