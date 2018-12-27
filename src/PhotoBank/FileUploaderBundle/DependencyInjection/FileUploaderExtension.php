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
    $container->setParameter('fileuploader.desinationdir', $config['back']['destination_dir']);
    $container->setParameter('fileuploader.tempdir', $config['back']['temp_dir']);
    $container->setParameter('fileuploader.targeturl', $config['front']['target_url']);
    $container->setParameter('fileuploader.chunksize', $config['front']['chunk_size']);
    $container->setParameter('fileuploader.simultaneousuploads', $config['front']['simultaneous_uploads']);
    $container->setParameter('fileuploader.allowedfiletypes', $config['front']['allowed_filetypes']);
    $container->setParameter('fileuploader.uploaddirectory', $config['back']['upload_directory']);
    $this->addAnnotatedClassesToCompile(array(
        '@FileUploaderBundle\\Controller',
    ));
  }
}
