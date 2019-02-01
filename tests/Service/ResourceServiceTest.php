<?php
namespace App\Tests\Service;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Service\ResourceService;
use App\Entity\Resource;
use App\Entity\CatalogueNodeItem;

class ResourceServiceTest extends WebTestCase
{

  public function setUp()
  {
      self::bootKernel();
      $container = self::$container;

      $this->entityManager = self::$container->get('doctrine.orm.default_entity_manager');
      $this->translator = self::$container->get('translator.default');
      $this->fileSystem = self::$container->get('filesystem');
      $this->serviceContainer = self::$container->get('service_container');
      $this->messageBus = self::$container->get('debug.traced.messenger.bus.default');

      $correctItem = $this->entityManager->getRepository(CatalogueNodeItem::class)->findOneBy([]);
      $correctResource = $this->entityManager->getRepository(Resource::class)->findOneBy([]);

      $this->correctItem = [
        'id'=>$correctItem->getId(),
      ];
      $this->correctResource = [
        'id'=>$correctResource->getId(),
        'priority'=>$correctResource->getPriority(),
        'type'=>$correctResource->getType(),
      ];
      $this->correctItemWithResource = [
        'id'=>$correctResource->getItem()->getId(),
      ];
  }

  public function getService(){
    $entityManager = $this->entityManager;
    $translator = $this->translator;
    $fileSystem = $this->fileSystem;
    $container = $this->serviceContainer;
    $messageBus = $this->messageBus;
    $service = new ResourceService($entityManager,$translator,$fileSystem,$container,$messageBus);
    return $service;
  }

  public function testGeneratePath()
  {
    $resourceService = $this->getService();

    $correctCode = "12345678910";
    $tooLongCode = "1234567891012345678910";
    $nonNumericCode = "asdasdasdasd";

    $result = $resourceService->generatePath($correctCode);
    $this->assertEquals($result,"12/34/56/78/91/0/");
    $result = $resourceService->generatePath($tooLongCode);
    $this->assertEquals($result,"12/34/56/78/91/01/23/45/67/89/10/");
    $result = $resourceService->generatePath($nonNumericCode);
    $this->assertEquals($result,"as/da/sd/as/da/sd/");
    $result = $resourceService->generatePath("");
    $this->assertEquals($result,"/");
    $result = $resourceService->generatePath(NULL);
    $this->assertEquals($result,"/");
    $this->expectException(\ArgumentCountError::class);
    $result = $resourceService->generatePath();
  }

  /**
   * @dataProvider provideResourceParameters
   */
  public function testProcessCompletedUpload($resourceParameters)
  {
    $resourceService = $this->getService();
    $params = $resourceParameters['params'];
    $params['path'] = ($params['path']!==NULL)?self::$container->getParameter('test_mock_dir').$params['path']:NULL;
    if($resourceParameters['throws_exception'] === false){
      $params['item_id'] = $this->correctItem['id'];
      $resourceService->processCompletedUpload($params);
      $createdResource = $this->entityManager->getRepository(Resource::class)->findOneBy([
        'item'=>$params['item_id']
      ]);
      $this->assertEquals($createdResource->getExtension(), $params['extension']);
      //$this->assertEquals($createdResource->getPath(), $resourceService->generatePath().$params['path']);
      $this->assertEquals($createdResource->getType(), $params['type']);
      $this->assertEquals($createdResource->getUsername(), $params['username']);
      $this->assertEquals($createdResource->getFilename(), $params['filename']);
      $this->assertEquals($createdResource->getSrcFilename(), $params['src_filename']);
    }else{
      $this->expectException($resourceParameters['exception_class']);
      $resourceService->processCompletedUpload($params);
    }
  }

  public function testPatchResoruce()
  {

    $resourceService = $this->getService();

    $patchData = [
      'priority'=>2,
      'type'=>2,
      '1c'=>true,
      'deleted'=>false,
      'default'=>true,
    ];

    $mockResource = $this->entityManager->getRepository(Resource::class)->findOneBy(['id'=>$this->correctResource['id']]);
    $response = $resourceService->patchResource($mockResource, $patchData);
    $mockResourceUpdated = $this->entityManager->getRepository(Resource::class)->findOneBy(['id'=>$this->correctResource['id']]);
    $this->assertTrue($response);
    $this->assertEquals($mockResourceUpdated->getPriority(),$patchData['priority']);
    $this->assertEquals($mockResourceUpdated->getType(),$patchData['type']);
    $this->assertEquals($mockResourceUpdated->getIs1c(),$patchData['1c']);
    $this->assertEquals($mockResourceUpdated->getIsDeleted(),$patchData['deleted']);
    $this->assertEquals($mockResourceUpdated->getIsDefault(),$patchData['default']);

  }

  public function testGetUniqueIdentifier()
  {
    $resourceService = $this->getService();
    $mockFile = "asdasdasdasdasdasdasdasdasd";
    $mockItemId = "00000000000";
    $mockFileSize = "100500";
    $result = $resourceService->getUniqueIdentifier($mockFile,$mockItemId,$mockFileSize);
    $this->assertEquals($result,"b87ae7513871a389ae6fcc9665ce3d99");
  }

  public function testGetResourceInfo()
  {
    $resourceService = $this->getService();
    $resource = $this->entityManager->getRepository(Resource::class)->findOneBy(['id'=>$this->correctResource['id']]);
    $result = $resourceService->getResourceInfo($this->correctResource['id']);
    $this->assertEquals($resource->getPath(), $result['path']);
    $this->assertEquals($resource->getSizePx(), $result['size_px']);
    $this->assertEquals($resource->getSizeBytes(), $result['size_bytes']);
  }

  public function testGetByItemAndPriority()
  {
    $resourceService = $this->getService();

    $priority = $this->correctResource['type'] == 1?1:$this->correctResource['priority']+1;

    $result = $resourceService->getByItemAndPriority($this->correctItemWithResource['id'], $priority);
    $this->assertEquals($result->getId(), $this->correctResource['id']);

  }

  public function provideResourceParameters()
  {
    return [
      [
        [
          'params'=>[
          'item_id' => "",
          'extension' => 'jpg',
          'path' => 'img/testimg.jpg',
          'type' => '1',
          'username' => 'username',
          'filesize' => '100',
          'preset' => '0',
          'chunkPath' => 'test/path/to/chunk/',
          'filename' => 'filename.jpg',
          'src_filename' => 'src_filename.jpg',
          'gid' => 99999999,
          'autogenerated' => false
        ],
        'throws_exception'=>false,
        'exception_class'=>""
        ]
      ],
      [
        [
          'params'=>[
          'item_id' => '99999999999',
          'extension' => 'jpg',
          'path' => 'img/testimg.jpg',
          'type' => '1',
          'username' => 'username',
          'filesize' => '100',
          'preset' => '0',
          'chunkPath' => 'test/path/to/chunk/',
          'filename' => 'filename.jpg',
          'src_filename' => 'src_filename.jpg',
          'gid' => 99999999,
          'autogenerated' => false
        ],
        'throws_exception'=>true,
        'exception_class'=>\App\Exception\ItemNotFoundException::class
        ]
      ],
      [
        [
          'params'=>[
          'item_id' => NULL,
          'extension' => NULL,
          'path' => NULL,
          'type' => NULL,
          'username' => NULL,
          'filesize' => NULL,
          'preset' => NULL,
          'chunkPath' => NULL,
          'filename' => NULL,
          'src_filename' => NULL,
          'gid' => NULL,
          'autogenerated' => NULL
        ],
        'throws_exception'=>true,
        'exception_class'=>\Symfony\Component\Filesystem\Exception\FileNotFoundException::class
        ]
      ]
    ];
  }
}
