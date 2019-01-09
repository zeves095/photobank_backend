<?php
/**
  * Создает все необходимые пресеты для ресурса по типу
  */
namespace App\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Service\ResourceService;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Resource;
/**
  * Создает все необходимые пресеты для ресурса по типу
  */
class GeneratePresetsCommand extends Command
{
  /**
   * Сервис для работы с сущностями типа Resource
   */
    private $resourceService;
    /**
  * Сервис-контейнер Symfony
  */
private $container;
    /**
  * Инструмент работы с сущностями Doctrine ORM
  */
private $entityManager;
/**
  * Конструктор класса
  *
  * @param ContainerInterface $container Для получения конфигурации, в частности пути к дампу тестовой базы и бэкапу файлов
  * @param EntityManagerInterface $entityManager Инструмент работы с сущностями Doctrine ORM
  * @param ResourceService $resourceService Сервис для работы с сущностями типа Resource
  *
  */
    public function __construct(ContainerInterface $container, EntityManagerInterface $entityManager, ResourceService $resourceService){
      $this->container = $container;
      $this->entityManager = $entityManager;
      $this->resourceService = $resourceService;
      parent::__construct();
    }
    /**
     * Конфигуратор консольной команды
     */
    protected function configure()
    {
        $this
            ->setName('app:resource:generate-presets')
            ->setDescription('Generate presets for all resources')
            ->addArgument(
                'parent',
                InputArgument::OPTIONAL,
                'Node ID generation scope'
            )
            ->addArgument(
                'nested',
                InputArgument::OPTIONAL,
                '1 to process resources in nested nodes, 0 to limit to current node only'
            )
        ;
    }
    /**
     * Вызывается при выполнении консольной команды
     * @param  InputInterface  $input  Входные данные, параметры
     * @param  OutputInterface $output Ответ в консоли
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
      set_time_limit(0);

      $repo = $this->entityManager->getRepository(Resource::class);
      if($input->getArgument('parent') ==  null){
        $res = $repo->findAll();
      }elseif($input->getArgument('nested') == 1){
        $res = $repo->getNestedResourcesByParent($input->getArgument('parent'));
      }else{
        $res = $repo->findBy([
            'item'=>$input->getArgument('parent')
        ]);
      }


      foreach($res as $r){
        $this->resourceService->dispatchPresetMessages($r->getId(), $r->getType());
      }

      $output->writeln("Done");
    }

}
