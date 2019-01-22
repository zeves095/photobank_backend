<?php
/**
  * Проводит подготовку тестовой файловой системы и базы данных для проведения тестов
  */

namespace App\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DomCrawler\Crawler;
use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\Tools\SchemaTool;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\Tools\Setup;
use Symfony\Component\Filesystem\Filesystem;
use App\Tests\Service\TestService;
use Symfony\Component\Process\Process;
use Symfony\Component\Console\Input\ArrayInput;

/**
  * Проводит подготовку тестовой файловой системы и базы данных для проведения тестов
  */
class RunTestsCommand extends Command
{
    /**
  * Сервис-контейнер Symfony
  */
private $container;
    /**
  * Сервис работы с файловой системой Symfony
  */
private $fileSystem;

    /**
      * Конструктор класса
      *
      * @param ContainerInterface $container Для получения конфигурации, в частности пути к дампу тестовой базы и бэкапу файлов
      * @param FileSystem $fileSystem Для удаления и записи файлов в директорию для проведения тестов, также для записи файла с выборкой для тестов
      * @param TestService $testService Для получения выборки данных для тестов
      *
      */
    public function __construct(ContainerInterface $container, Filesystem $fileSystem, TestService $testService){
      $this->fileSystem = $fileSystem;
      $this->container = $container;
      $this->testService = $testService;
      parent::__construct();
    }

    /**
     * Конфигуратор консольной команды
     */
    protected function configure()
    {
        $this
            ->setName('app:tests:run')
            ->setDescription('Prepare mock data for tests')
            ->addOption(
                'generated',
                null,
                InputOption::VALUE_NONE,
                'generation of mock data'
            )
        ;
    }

    /**
      * Исполняет команду. Сбрасывает тестовую базу, затем делает импорт тестовой базы и файловой системы, создает выборку данных для тестов.
      *
      * @param InputInterface $input Входные данные команды
      * @param OutputInterface $output Вывод данных в консоль
      *
      */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
      set_time_limit(0);

      if ($this->container->get('kernel')->getEnvironment()!=="test") {
        $output->writeln('Для тестов должно быть определено окружение test в .env !');exit();
      }

      $command = $this->getApplication()->find('app:tests:prepare');

      $arguments = [
        'command' => 'app:tests:prepare'
      ];

      $prepareInput = new ArrayInput($arguments);

      $returnCode = $command->run($prepareInput, $output);
      $phpunit = new Process(['bin/phpunit']);
      $phpunit->setTty(true);
      $phpunit->run(function ($type, $buffer) {
        if (Process::ERR === $type) {
          echo 'ERR > '.$buffer;
        } else {
          echo $buffer;
        }
      //}, ['UPLOADS_PARENT' => 'private/test']);
    });

      $e2e = new Process('yarn e2e');
      $e2e->setTty(true);
      $e2e->run(function ($type, $buffer) {
        if (Process::ERR === $type) {
          echo 'ERR > '.$buffer;
        } else {
          echo $buffer;
        }
      });

      $jest = new Process('yarn jest');
      $jest->setTty(true);
      $jest->run(function ($type, $buffer) {
        if (Process::ERR === $type) {
          echo 'ERR > '.$buffer;
        } else {
          echo $buffer;
        }
      });

    }

}
