<?php
/**
  * Создает пресет для ресурса по id ресурса и пресета
  */
namespace App\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use App\Service\ImageProcessorService;
/**
  * Создает пресет для ресурса по id ресурса и пресета
  */
class ProcessResourceCommand extends Command
{
    /**
     * Сервис для работы с изображениями
     */
    private $imageProcessor;
    /**
  * Сервис-контейнер Symfony
  */
private $container;

    /**
     * Конструктор класса
     * @param ImageProcessorService $imageProcessor Сервис для работы с изображениями
     * @param ContainerInterface    $container      Сервис-контейнер Symfony
     */
    public function __construct(ImageProcessorService $imageProcessor, ContainerInterface $container){
      $this->imageProcessor = $imageProcessor;
      $this->container = $container;
      parent::__construct();
    }

    /**
     * Конфигуратор консольной команды
     */
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

    /**
     * Вызывается при выполнении консольной команды
     * @param  InputInterface  $input  Входные данные, параметры
     * @param  OutputInterface $output Ответ в консоли
     */
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

    /**
     * Создает пресет изображения в сервисе обработки изображений
     * @return string Ответ для вывода в консоль
     */
    private function processImage(){
      $text = "Calling image processor for resource with id ".$resource." with preset ".$preset."\n";
      $response = $this->imageProcessor->processPreset($resource, $preset);
      $text .= $response;
      return $text;
    }
}
