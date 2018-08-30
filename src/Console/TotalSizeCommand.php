<?php

namespace App\Console;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Filesystem\Filesystem;
use App\Service\ResourceService;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Resource;

class TotalSizeCommand extends Command
{
    private $resourceService;
    private $container;
    private $entityManager;
    private $fileSystem;

    public function __construct(ContainerInterface $container, EntityManagerInterface $entityManager, ResourceService $resourceService, Filesystem $fileSystem){
      $this->container = $container;
      $this->entityManager = $entityManager;
      $this->resourceService = $resourceService;
      $this->fileSystem = $fileSystem;
      parent::__construct();
    }

    protected function configure()
    {
        $this
            ->setName('app:resource:totalsize')
            ->setDescription('Get summary size of resources')
            ->addArgument(
                'date_end',
                InputArgument::OPTIONAL,
                'Date or now is ommited'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
      set_time_limit(0);
      if(!$dateEnd = $input->getArgument('date_end')) $dateEnd = 'NOW()';
      $resourceBytes = $this->_getResourceSize($dateEnd);
      $linkBytes = $this->_getLinkSize($dateEnd);	
      $resourceResult = $this->_format($resourceBytes + $linkBytes);	
      $output->writeln($resourceResult);
      

    }

    protected function _getLinkSize($dateEnd)
    {
        $sql = "SELECT SUM(size_bytes) as total_size FROM link WHERE symlink = 0 AND created_on  <= :dateEnd";
        $params = [];
        $params['dateEnd'] = $dateEnd;
        $stmt = $this->entityManager->getConnection()->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetchAll(\PDO::FETCH_COLUMN);
        return $result[0];
    } 
    protected function _getResourceSize($dateEnd)
    {
	$sql = "SELECT SUM(size_bytes) as total_size FROM resource WHERE created_on  <= :dateEnd";
	$params = [];
	$params['dateEnd'] = $dateEnd;
	$stmt = $this->entityManager->getConnection()->prepare($sql);
	$stmt->execute($params);
	$result = $stmt->fetchAll(\PDO::FETCH_COLUMN);
	return $result[0];
    }

    protected function _format($bytes)
    {
	$items = ['byte','Kb','Mb','Gb','Tb'];

        for($i = 0; $i < count($items);$i++){
              if($bytes/1024 < 1) break;
              $bytes /= 1024;
        }

	return number_format($bytes,2,'.','') . $items[$i];
    }


}
