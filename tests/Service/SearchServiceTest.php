<?php
namespace App\Tests\Service;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Service\Search\SearchService;
use App\Service\Search\SearchQueryBuilder;
use App\Entity\CatalogueNodeItem;
use App\Entity\Resource;
use App\Entity\Saerch\ItemQueryObject;
use App\Entity\Saerch\ResourceQueryObject;
use Symfony\Component\HttpFoundation\Request;

class SearchServiceTest extends WebTestCase
{

  public function setUp()
  {
      self::bootKernel();
      $container = self::$container;

      $this->entityManager = self::$container->get('doctrine.orm.default_entity_manager');
      $this->queryBuilder = self::$container->get('App\Service\Search\SearchQueryBuilder');

      $correctItem = $this->entityManager->getRepository(CatalogueNodeItem::class)->findOneBy([]);
      $correctResource = $this->entityManager->getRepository(Resource::class)->findOneBy([]);

      $this->correctItem = [
        'id'=>$correctItem->getId(),
        'name'=>$correctItem->getName(),
        'parent'=>$correctItem->getNode()->getName(),
      ];
      $this->correctResource = [
        'id'=>$correctResource->getId(),
        'priority'=>$correctResource->getPriority(),
        'type'=>$correctResource->getType(),
      ];
      $this->correctItemWithResource = [
        'id'=>$correctResource->getItem()->getId(),
        'name'=>$correctResource->getItem()->getName(),
        'parent'=>$correctResource->getItem()->getNode()->getName(),
      ];
  }

  public function getService()
  {
    $entityManager = $this->entityManager;
    $service = new SearchService($entityManager);
    return $service;
  }

  public function testSearchItems(){
    $searchService = $this->getService();
    $queryParams = [
      'item_search_name'=>$this->correctItem['name'],
      'item_search_code'=>$this->correctItem['id'],
      'item_search_parent_name'=>$this->correctItem['parent'],
      'item_search_search_nested'=>'0',
      'item_search_article'=>''
    ];
    $request = new Request($queryParams);
    $queryObject = $this->queryBuilder->makeItemQuery($request);
    $results = $searchService->search($queryObject);
    $this->assertGreaterThanOrEqual(1,sizeof($results));
    $this->assertEquals($queryParams['item_search_name'],$results[0]->getName());
    $this->assertEquals($queryParams['item_search_code'],$results[0]->getId());
    $this->assertEquals($queryParams['item_search_parent_name'],$results[0]->getNode()->getName());
  }

  public function testSearchResources(){
    $searchService = $this->getService();
    $queryParams = [
      'item_search_name'=>$this->correctItemWithResource['name'],
      'item_search_code'=>$this->correctItemWithResource['id'],
      'item_search_parent_name'=>$this->correctItemWithResource['parent'],
      'item_search_search_nested'=>'0',
      'item_search_article'=>'',
      'resource_search_id'=>$this->correctResource['id'],
      'resource_search_type'=>$this->correctResource['type'],
    ];
    $request = new Request($queryParams);
    $queryObject = $this->queryBuilder->makeResourceQuery($request);
    $results = $searchService->search($queryObject);
    $this->assertGreaterThanOrEqual(1,sizeof($results));
    $this->assertEquals($queryParams['resource_search_id'],$results[0]->getId());
    $this->assertEquals($queryParams['item_search_code'],$results[0]->getItem()->getId());
  }

}
