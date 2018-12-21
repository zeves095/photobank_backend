<?php

namespace App\Service;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Exception\DeadMountException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class FilesystemDecorator extends Filesystem {
  protected $fileSystem;
  public function __construct(Filesystem $fileSystem, ContainerInterface $container)
  {
    $this->fileSystem = $fileSystem;
    $this->container = $container;
  }

  public function dumpFile($target, $content)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->dumpFile($target, $content);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  public function copy($source, $target, $overwriteNewerFiles = false)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->copy($source, $target, $overwriteNewerFiles);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  public function remove($target)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->remove($target);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  public function appendToFile($target, $content)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->appendToFile($target, $content);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  public function mkdir($dir, $mode = 0777)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->mkdir($dir);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  private function checkMount()
  {
    $livemount = $this->container->getParameter('upload_directory')."/livemount";
    if(!$this->fileSystem->exists($livemount)){
      return false;
    }
    return true;
  }

}
