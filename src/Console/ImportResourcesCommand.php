<?php
/**
  * Команда для bulk-импорта ресурсов.
  */
namespace App\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Service\ImportResourceService;
/**
  * Команда для bulk-импорта ресурсов.
  */
class ImportResourcesCommand extends Command
{
  /**
* Сервис для импорта ресурсов
*/
    private $importService;
    /**
  * Сервис-контейнер Symfony
  */
private $container;
/**
  * Конструктор класса
  *
  * @param ImportResourceService $importService Скрипт для bulk-импорта ресурсов из файловой системы.
  * @param ContainerInterface $container Для получения конфигурации, в частности пути к дампу тестовой базы и бэкапу файлов
  *
  */
    public function __construct(ImportResourceService $importService, ContainerInterface $container){
      $this->importService = $importService;
      $this->container = $container;
      parent::__construct();
    }
    /**
     * Конфигуратор консольной команды
     */
    protected function configure()
    {
        $this
            ->setName('app:resource:import')
            ->setDescription('Import resources')
        ;
    }
    /**
     * Вызывается при выполнении консольной команды
     * @param  InputInterface  $input  Входные данные, параметры
     * @param  OutputInterface $output Ответ в консоли
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
      $result = $this->importService->import();
      $output->writeln("Running...");
    }

}
