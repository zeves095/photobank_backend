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

      $output->write("Running");

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

      $importsql = file_get_contents($dbDumpPath);
      $import = $connection->prepare($importsql);

      if ($connection instanceof \Doctrine\DBAL\Driver\PDOConnection) {
          // PDO Drivers
          try {
              $lines = 0;

              $stmt = $connection->prepare($importsql);
              assert($stmt instanceof PDOStatement);

              $stmt->execute();

              do {
                  // Required due to "MySQL has gone away!" issue
                  $stmt->fetch();
                  $stmt->closeCursor();

                  $lines++;
              } while ($stmt->nextRowset());

              $output->write(sprintf('%d statements executed!', $lines) . PHP_EOL);
          } catch (\PDOException $e) {
              $output->write('error!' . PHP_EOL);

              throw new \RuntimeException($e->getMessage(), $e->getCode(), $e);
          }
      } else {
          // Non-PDO Drivers (ie. OCI8 driver)
          $stmt = $connection->prepare($importsql);
          $rs = $stmt->execute();

          if ($rs) {
              $output->writeln('OK!' . PHP_EOL);
          } else {
              $error = $stmt->errorInfo();

              $output->write('error!' . PHP_EOL);

              throw new \RuntimeException($error[2], $error[0]);
          }

          $stmt->closeCursor();
      }

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
