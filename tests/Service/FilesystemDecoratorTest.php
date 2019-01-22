<?php
namespace App\Tests\Service;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Service\FilesystemDecorator;
use Symfony\Component\Filesystem\Filesystem;
use App\Exception\DeadMountException;
use Symfony\Component\HttpFoundation\Request;

class FilesystemDecoratorTest extends WebTestCase
{

  public function setUp()
  {
      self::bootKernel();
      $container = self::$container;

      $this->filesystem = self::$container->get('filesystem');
      $this->serviceContainer = self::$container->get('service_container');

      $this->dir = $this->serviceContainer->getParameter('upload_directory');
  }

  public function getService()
  {
    $filesystem = $this->filesystem;
    $serviceContainer = $this->serviceContainer;
    $service = new FilesystemDecorator($filesystem,$serviceContainer);
    return $service;
  }

  public function createLiveMount()
  {
    if(!$this->filesystem->exists($this->dir.'/livemount')){
     $this->filesystem->dumpFile($this->dir.'/livemount','');
    }
  }

  public function removeLiveMount()
  {
    if($this->filesystem->exists($this->dir.'/livemount')){
     $this->filesystem->remove($this->dir.'/livemount');
    }
  }

  public function testDumpFile()
  {
      var_dump($this->dir);
      $filesystemDecorator = $this->getService();
      $this->createLiveMount();
      $filesystemDecorator->dumpFile($this->dir.'/testfile','');
      $this->removeLiveMount();
      $this->expectException(DeadMountException::class);
      $filesystemDecorator->dumpFile($this->dir.'/testfile','');
  }

  public function testCopy()
  {
    $filesystemDecorator = $this->getService();
    $this->createLiveMount();
    $filesystemDecorator->copy($this->dir.'/../../../tests/mock/img/testimg.jpg',$this->dir.'/testfile');
    $this->removeLiveMount();
    $this->expectException(DeadMountException::class);
    $filesystemDecorator->copy($this->dir.'/../../../tests/mock/img/testimg.jpg',$this->dir.'/testfile');
  }

  public function testRemove()
  {
    $filesystemDecorator = $this->getService();
    $this->createLiveMount();
    $filesystemDecorator->copy($this->dir.'/../../../tests/mock/img/testimg.jpg',$this->dir.'/testfile');
    $filesystemDecorator->remove($this->dir.'/testfile');
    $filesystemDecorator->copy($this->dir.'/../../../tests/mock/img/testimg.jpg',$this->dir.'/testfile');
    $this->removeLiveMount();
    $this->expectException(DeadMountException::class);
    $filesystemDecorator->remove($this->dir.'/testfile');
  }

  public function testAppendToFile()
  {
    $filesystemDecorator = $this->getService();
    $this->createLiveMount();
    $filesystemDecorator->dumpFile($this->dir.'/testfile','');
    $filesystemDecorator->appendToFile($this->dir.'/testfile','asd');
    $this->removeLiveMount();
    $this->expectException(DeadMountException::class);
    $filesystemDecorator->appendToFile($this->dir.'/testfile','asd');
  }

  public function testMkdir()
  {
    $filesystemDecorator = $this->getService();
    $this->createLiveMount();
    $filesystemDecorator->mkDir($this->dir.'/testdir/');
    $this->removeLiveMount();
    $this->expectException(DeadMountException::class);
    $filesystemDecorator->mkDir($this->dir.'/testdir/');
  }

  public function testAfterAll()
  {
    $this->createLiveMount();
    $this->assertTrue(true);
  }

}
