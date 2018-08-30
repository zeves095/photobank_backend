<?php
namespace App\Tests\Service;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Service\GarbageService;
use App\Entity\Resource;
use App\Entity\GarbageNode;

class GarbageServiceTest extends WebTestCase
{

  public function setUp()
  {
      self::bootKernel();
      $container = self::$container;

      $this->entityManager = self::$container->get('doctrine.orm.default_entity_manager');
      $this->serviceContainer = self::$container->get('service_container');

      $correctNode = $this->entityManager->getRepository(GarbageNode::class)->findOneBy([]);
      $children = $this->entityManager->getRepository(GarbageNode::class)->findBy(['parent'=>$correctNode]);
      $correctChildNode = $children[0];
      $correctOtherNode = $children[1];
      foreach($children as $child){
        if(!isset($childlessNode)&&sizeof($this->entityManager->getRepository(GarbageNode::class)->findBy(['parent'=>$child]))==0&&sizeof($this->entityManager->getRepository(Resource::class)->findBy(['garbageNode'=>$child]))==0){
          $childlessNode = $child;
          break;
        }
      }

      $this->correctNode = [
        'id'=>$correctNode->getId(),
      ];

      $this->childId = $correctChildNode->getId();

      $this->correctParams = [
        'name'=>'newName',
        'parent'=>$correctOtherNode->getId(),
      ];

      $this->errorParams = [
        'name'=>'newName',
        'parent'=>$this->childId,
      ];

      $this->removeId = $childlessNode->getId();
  }

  public function getService(){
    $entityManager = $this->entityManager;
    $container = $this->serviceContainer;
    $service = new GarbageService($entityManager,$container);
    return $service;
  }

  public function testCreateNode()
  {
    $garbageService = $this->getService();

    $result = $garbageService->createNode($this->correctNode['id'], 'name');
    $this->assertTrue($result['successful']);
  }

  public function testUpdateNode()
  {
    $garbageService = $this->getService();

    $result = $garbageService->updateNode($this->childId, $this->correctParams);
    $this->assertTrue($result['successful']);
    $result = $garbageService->updateNode($this->childId, $this->errorParams);
    $this->assertFalse($result['successful']);
  }

  public function testRemoveNode()
  {
    $garbageService = $this->getService();

    $result = $garbageService->removeNode($this->removeId);
    $this->assertTrue($result['successful']);
  }

}
