<?php
/**
  * Сервис для обертки стандартного компонента Filesystem, который вернет ошибку, в случае если обнаружит, что произошла ошибка при монтировании конечной директории для загрузок
  */
namespace App\Service;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Exception\DeadMountException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
  * Сервис для обертки стандартного компонента Filesystem, который вернет ошибку, в случае если обнаружит, что произошла ошибка при монтировании конечной директории для загрузок
  */
class FilesystemDecorator extends Filesystem {
  /**
  * Сервис работы с файловой системой Symfony
  */
protected $fileSystem;

  /**
    * Конструктор класса
    *
    * @param Filesystem $fileSystem Для проверки файловой системы на наличие проверочного файла
    * @param Container $container Для получения пути до конечной директории загрузок
    *
    */
  public function __construct(Filesystem $fileSystem, ContainerInterface $container)
  {
    $this->fileSystem = $fileSystem;
    $this->container = $container;
  }

  /**
    * Декорирует вызов метода базового класса проверкой на наличие проверочного файла в системе
    *
    * @param string $target соотвествует агрументу метода базового класса
    * @param string $content соотвествует агрументу метода базового класса
    *
    */
  public function dumpFile($target, $content)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->dumpFile($target, $content);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  /**
    * Декорирует вызов метода базового класса проверкой на наличие проверочного файла в системе
    *
    * @param string $source соотвествует агрументу метода базового класса
    * @param string $target соотвествует агрументу метода базового класса
    * @param bool $overwriteNewerFiles соотвествует агрументу метода базового класса
    *
    */
  public function copy($source, $target, $overwriteNewerFiles = false)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->copy($source, $target, $overwriteNewerFiles);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  /**
    * Декорирует вызов метода базового класса проверкой на наличие проверочного файла в системе
    *
    * @param string $target соотвествует агрументу метода базового класса
    *
    */
  public function remove($target)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->remove($target);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  /**
    * Декорирует вызов метода базового класса проверкой на наличие проверочного файла в системе
    *
    * @param string $target соотвествует агрументу метода базового класса
    * @param string $content соотвествует агрументу метода базового класса
    *
    */
  public function appendToFile($target, $content)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->appendToFile($target, $content);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  /**
    * Декорирует вызов метода базового класса проверкой на наличие проверочного файла в системе
    *
    * @param string $dir соотвествует агрументу метода базового класса
    * @param int $mode соотвествует агрументу метода базового класса
    *
    */
  public function mkdir($dir, $mode = 0777)
  {
    if(!$this->checkMount()){throw new DeadMountException();}
    $this->fileSystem->mkdir($dir);
    if(!$this->checkMount()){throw new DeadMountException();}
  }

  /**
   * Возвращает оригинальный сервис
   */
  public function getUndecorated()
  {
    return $this->fileSystem;
  }

  /**
    * Проверяет файловую систему на наличие проверочного файла
    *
    * @return bool true в случае если файл найден, false если нет
    *
    */
  private function checkMount()
  {
    $livemount = $this->container->getParameter('upload_directory')."/livemount";
    if(!$this->fileSystem->exists($livemount)){
      return false;
    }
    return true;
  }

}
