<?php

namespace App\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use App\Service\ImageProcessorService;

class ProcessResourceCommand extends Command
{
    private $imageProcessor;
    private $container;

    public function __construct(ImageProcessorService $imageProcessor, ContainerInterface $container){
      $this->imageProcessor = $imageProcessor;
      $this->container = $container;
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
            ->addOption(
                'presets',
                null,
                InputOption::VALUE_NONE,
                'list of presets'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
      $result = "";
      $resource = $input->getArgument('resource');
      $preset = $input->getArgument('preset');
      $presetOpt = $input->getOption('presets');
      if($presetOpt == true){
        $result = "__________PRESETS__________\n\n";
        foreach($this->container->getParameter('presets') as $preset){
          $result .= "Preset id : ".$preset['id']." | Preset name : ".$preset['name']."\n";
        }
        $result .= "___________________________\n";
      } else {
        $result = $this->processImage($resource,$preset);
      }
      $output->writeln($result);
    }

    private function processImage(){
      $text = "Calling image processor for resource with id ".$resource." with preset ".$preset."\n";
      $response = $this->imageProcessor->processPreset($resource, $preset);
      $text .= $response;
      return $text;
    }
}
