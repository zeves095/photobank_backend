<?php

namespace App\Console\Mock;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\CatalogueNode;
use App\Entity\CatalogueNodeItem;

class MockCatalogueNodeItemsCommand extends Command
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager){
      $this->entityManager = $entityManager;
      parent::__construct();
    }

    protected function configure()
    {
        $this
            ->setName('app:mock:catalogue-item')
            ->setDescription('Create mock data for catalogue items (for testing)')
            ->addArgument(
                'count',
                InputArgument::OPTIONAL,
                'Count of catalogue-items per catalogue node'
            )
            ->addOption(
                'random',
                null,
                InputOption::VALUE_NONE,
                'create random value of item count per catalogue node'
            );
    }

    
    
    protected function execute(InputInterface $input, OutputInterface $output)
    {

        $count = $input->getArgument('count')??1;
        $random = $input->getOption('random')??false;

        $catalogue_repository = $this->entityManager->getRepository(CatalogueNode::class);
        
        $last_item = $this->entityManager->getRepository(CatalogueNodeItem::class)->findBy([],['id'=>'DESC'],1);

        if(!$last_item){
            $i = 1;
        }else{
            $i = $last_item[0]->getId();
        }
        
        foreach($catalogue_repository->findAll() as $catalogue_node)
        {

            $output->writeln('Подготовка товаров для категории: ' . $catalogue_node->getName()); 
            
            $cnt = $random ? random_int(1, $count) : $count;

            while($cnt-- > 0)
            {
                $catalogue_node_item = new CatalogueNodeItem();
                $catalogue_node_item->setName('Товар ' . $i);
                $itemCode = str_pad($i, 11, "0", STR_PAD_LEFT);
                $catalogue_node_item->setItemCode($itemCode);
                $catalogue_node_item->setNode($catalogue_node);
                
                $output->writeln('Подготовлен товар: ' . $catalogue_node_item->getName()); 
                
                $this->entityManager->persist($catalogue_node_item);
                $this->entityManager->flush();

                $output->writeln('Сохранено');
                $i++;
            }
        }

        
        $output->writeln('Заверщено'); 
    }
}
