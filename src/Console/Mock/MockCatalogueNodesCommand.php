<?php
/**
 * Генерирует простые fixtures для проверки работы с разделами каталога без актуальных данных
 *
 * @deprecated
 */
namespace App\Console\Mock;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use Doctrine\ORM\EntityManagerInterface;

use App\Entity\CatalogueNode;
/**
 * Генерирует простые fixtures для проверки работы с разделами каталога без актуальных данных
 *
 * @deprecated
 */
class MockCatalogueNodesCommand extends Command
{
    /**
  * Инструмент работы с сущностями Doctrine ORM
  */
private $entityManager;
/**
  * Конструктор класса
  *
* @param EntityManagerInterface $entityManager Инструмент работы с сущностями Doctrine ORM
  *
  */
    public function __construct(EntityManagerInterface $entityManager){
      $this->entityManager = $entityManager;
      parent::__construct();
    }
    /**
     * Конфигуратор консольной команды
     */
    protected function configure()
    {
        $this
            ->setName('app:mock:catalogue')
            ->setDescription('Create mock data for catalogue (for testing)')
            ->addArgument(
                'count',
                InputArgument::OPTIONAL,
                'Count of nodes per level'
            )
            ->addArgument(
                'deep',
                InputArgument::OPTIONAL,
                'Deep of catalogue hierarchy'
            )
            ->addArgument(
                'flush_level',
                InputArgument::OPTIONAL,
                'Level to flush data'
            )
            ->addOption(
                'force',
                null,
                InputOption::VALUE_NONE,
                'create root node if not exists (else it\'s throw exception)'
            );
    }


    /**
     * Вызывается при выполнении консольной команды
     * @param  InputInterface  $input  Входные данные, параметры
     * @param  OutputInterface $output Ответ в консоли
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {

        $count = $input->getArgument('count')??1;
        $deep = $input->getArgument('deep')??1;
        $flush_level = $input->getArgument('flush_level')??1;
            $flush_level = $deep - $flush_level + 1;
            $flush_level = $flush_level > 0 ? $flush_level : 1;
        $force = $input->getOption('force')??false;
        $name_prefix = 'Раздел ';

        $catalogue_repository = $this->entityManager->getRepository(CatalogueNode::class);

        $metadata = $this->entityManager->getClassMetaData(CatalogueNode::class);

        if(!$root_catalogue_node = $catalogue_repository->find(1))
        {
            if(!$force) throw new \Exception('Нет каталога с id=1. Вы можете использовать флаг --force чтобы принудительно создать его');
            $root_catalogue_node = new CatalogueNode();
            $root_catalogue_node->setName('Каталог');

            $this->createEntity($this->entityManager, $root_catalogue_node,1);
        }

        $this->_getNextLevel($root_catalogue_node, $deep, $count, $name_prefix, $flush_level, $output);

        $output->writeln('Заверщено');
    }


    private function _getNextLevel($parent, int $deep = 1, int $count = 5, $name_prefix = 'Раздел ', $flush_level = 1, OutputInterface $output = null)
    {
        $deep--;
        for($i = 1; $i <= $count; $i++)
        {
            $catalogue_node = new CatalogueNode();
            $catalogue_name = $name_prefix . $i;
            $catalogue_node->setName($catalogue_name);
            $catalogue_node->setParent($parent);

            $this->entityManager->persist($catalogue_node);
            if($output) $output->writeln('Добавлен раздел: ' . $catalogue_node->getName());

            if($deep > 0)
            {
                $this->_getNextLevel($catalogue_node, $deep, $count, $catalogue_name . '-', $flush_level, $output);
            }

            if($deep + 1 == $flush_level)
            {
                $this->entityManager->flush();
                if($output) $output->writeln('Сохранено');
            }
        }
    }

    /**
     *  http://qaru.site/questions/70489/explicitly-set-id-with-doctrine-when-using-auto-strategy
     */
    /**
     * Создает сущность раздела каталога
     * @param  EntityManagerInterface $em     Инструмент для работы с сущностями Doctrine ORM
     * @param  CatalogueNode          $entity Сущность для сохранения
     * @param  int                    $id     Идентификатор для нового ресурса
     */
    private function createEntity(EntityManagerInterface $em, $entity, $id = null)
    {
        $className = get_class($entity);
        if ($id) {
            $idRef = new \ReflectionProperty($className, "id");
            $idRef->setAccessible(true);
            $idRef->setValue($entity, $id);

            $metadata = $em->getClassMetadata($className);
            /** @var \Doctrine\ORM\Mapping\ClassMetadataInfo $metadata */
            $generator = $metadata->idGenerator;
            $generatorType = $metadata->generatorType;

            $metadata->setIdGenerator(new \Doctrine\ORM\Id\AssignedGenerator());
            $metadata->setIdGeneratorType(\Doctrine\ORM\Mapping\ClassMetadata::GENERATOR_TYPE_NONE);

            $unitOfWork = $em->getUnitOfWork();
            $persistersRef = new \ReflectionProperty($unitOfWork, "persisters");
            $persistersRef->setAccessible(true);
            $persisters = $persistersRef->getValue($unitOfWork);
            unset($persisters[$className]);
            $persistersRef->setValue($unitOfWork, $persisters);

            $em->persist($entity);
            $em->flush();

            $idRef->setAccessible(false);
            $metadata->setIdGenerator($generator);
            $metadata->setIdGeneratorType($generatorType);

            $persisters = $persistersRef->getValue($unitOfWork);
            unset($persisters[$className]);
            $persistersRef->setValue($unitOfWork, $persisters);
            $persistersRef->setAccessible(false);
        } else {
            $em->persist($entity);
            $em->flush();
        }
    }
}
