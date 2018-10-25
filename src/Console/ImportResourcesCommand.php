<?php

namespace App\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use App\Service\ImportResourceService;

class ImportResourcesCommand extends Command
{
    private $importService;
    private $container;

    public function __construct(ImportResourceService $importService, ContainerInterface $container){
      $this->importService = $importService;
      $this->container = $container;
      parent::__construct();
    }

    protected function configure()
    {
        $this
            ->setName('app:resource:import')
            ->setDescription('Import resources')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
      $result = $this->importService->import();
      $output->writeln("Running...");
    }

}
