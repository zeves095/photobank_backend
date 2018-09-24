<?php

namespace App\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use App\Service\ImageProcessorService;

class ProcessResourceCommand extends Command
{
    private $imageProcessor;

    public function __construct(ImageProcessorService $imageProcessor){
      $this->imageProcessor = $imageProcessor;
      parent::__construct();
    }

    protected function configure()
    {
        $this
            ->setName('app:resource:process-preset')
            ->setDescription('Create a processed resource')
            ->addArgument(
                'resource',
                InputArgument::OPTIONAL,
                'Resource to be processed'
            )
            ->addArgument(
                'preset',
                InputArgument::OPTIONAL,
                'Preset for processing'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $resource = $input->getArgument('resource');
        $preset = $input->getArgument('preset');

        $text = "Calling image processor for resource with id ".$resource." with preset ".$preset;
        $output->writeln($text);
        $serviceResponse = $this->imageProcessor->process($resource, $preset);
        $output->writeln($serviceResponse);

    }
}
