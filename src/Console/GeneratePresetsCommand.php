<?php

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

class GeneratePresetsCommand extends Command
{
    private $resourceService;
    private $container;
    private $entityManager;

    public function __construct(ContainerInterface $container, EntityManagerInterface $entityManager, ResourceService $resourceService){
      $this->container = $container;
      $this->entityManager = $entityManager;
      $this->resourceService = $resourceService;
      parent::__construct();
    }

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
