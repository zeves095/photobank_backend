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

/**
  * Проводит подготовку тестовой файловой системы и базы данных для проведения тестов
  */
class PrepareTestsCommand extends Command
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
            ->setName('app:tests:prepare')
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

      $dumpPath = $this->container->getParameter("test_dump_path");
      $dbDumpPath = $this->container->getParameter("test_db_dump_path");
      $fsDumpPath = $this->container->getParameter("test_fs_dump_path");
      $fsTargetPath = $this->container->getParameter("test_fs_target_path");
      $phpunitConfigPath = $this->container->getParameter("test_phpunit_config_path");
      $prodDbUrl = $this->container->getParameter("test_production_db_url");

      $crawler = new Crawler(file_get_contents($phpunitConfigPath));
      $dbLink = $crawler->filter("[name='DATABASE_URL']")->attr('value');

      $connection = DriverManager::getConnection(['url'=>$dbLink]);
      $output->writeln("Database connection established");

      $dbConfig = Setup::createAnnotationMetadataConfiguration(array(__DIR__."/src"), true);

      $entityManager = EntityManager::create($connection, $dbConfig);
      $schemaTool = new SchemaTool($entityManager);

      $dropsql = $schemaTool->dropDatabase();

      $output->writeln("Database dropped");

      $importsql = file($dbDumpPath);

      $templine = '';
      foreach ($importsql as $line)
      {
        // Skip it if it's a comment
        if (substr($line, 0, 2) == '--' || $line == '')
        continue;

        // Add this line to the current segment
        $templine .= $line;
        // If it has a semicolon at the end, it's the end of the query
        if (substr(trim($line), -1, 1) == ';')
        {
          // Perform the query
          $stmt = $connection->prepare($templine);
          $stmt->execute() or print('Error performing query \'<strong>' . $templine . '\': ' . mysql_error() . '<br /><br />');
          // Reset temp variable to empty
          $templine = '';
        }
      }

      $connection->close();
      $connection = null;

      $output->writeln("Database import complete");

      $this->fileSystem->remove($fsTargetPath);

      $output->writeln("Target directory cleared");

      $this->fileSystem->mirror($fsDumpPath, $fsTargetPath);

      $output->writeln("Mock files written to target directory");

      $sample = $this->testService->getDataSample();

      $this->fileSystem->dumpFile($dumpPath."datasample.txt", json_encode($sample));

      $output->writeln("Data sample created");

    }

}
