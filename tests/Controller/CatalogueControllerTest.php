<?php

namespace App\Tests\Controller;

use App\Tests\Controller\BaseTest;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class CatalogueControllerTest extends BaseTest
{

    protected $nodeFields = ['id', 'name', 'parent', 'children'];
    protected $itemFields = ['id','name','itemCode','node'];
    protected $resourceFields = ['chunkPath','comment','created_on','filename','gid','id','is1c','isDefault','isDeleted','item','path','preset','priority','size_bytes','size_px','src_filename','type','username'];

    public function testNodeGet()
    {

        $client = $this->createAuthenticatedClient();
        $crawler = $client->request('GET', '/catalogue/node/'.$this->sampleData->nodes[0]);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->nodeFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/'.$this->sampleData->nodes[0]);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testNodesGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/nodes/'.$this->sampleData->nodeWithChildren);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $firstResult = $responseJson[0];
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertGreaterThan(0, sizeof($responseJson));
        foreach($this->nodeFields as $field){
          $this->assertObjectHasAttribute($field,$firstResult);
        }

        $crawler = $client->request('GET', '/catalogue/nodes');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertGreaterThan(0, sizeof($responseJson));
        foreach($this->nodeFields as $field){
          $this->assertObjectHasAttribute($field,$firstResult);
        }

        $crawler = $client->request('GET', '/catalogue/nodes/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/nodes/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/nodes/'.$this->sampleData->nodeWithChildren);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testItemGetByCode()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/'.$this->sampleData->items[0]);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->itemFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/'.$this->sampleData->items[0]);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testItemGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/'.$this->sampleData->items[0]);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->itemFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/'.$this->sampleData->items[0]);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testItemsGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/items/'.$this->sampleData->nodeWithItems);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $firstResult = $responseJson[0];
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertGreaterThan(0, sizeof($responseJson));
        foreach($this->itemFields as $field){
          $this->assertObjectHasAttribute($field,$firstResult);
        }

        $crawler = $client->request('GET', '/catalogue/node/items/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/items');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/items/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/items/'.$this->sampleData->nodeWithItems);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testItemSearch()
    {
      $client = $this->createAuthenticatedClient();
      $params = '?item_search_code='.urlencode($this->sampleData->searchItem->id).'&item_search_name='.urlencode($this->sampleData->searchItem->name).'&item_search_parent_name='.urlencode($this->sampleData->searchItem->parent_name).'&item_search_search_nested=1';
      $crawler = $client->request('GET', '/catalogue/search/items'.$params);
      $response = $client->getResponse();
      $this->assertEquals(200, $response->getStatusCode());
      $responseJson = json_decode($response->getContent());
      $this->assertGreaterThan(0, sizeof($responseJson));
      $firstResult = $responseJson[0];
      foreach($this->itemFields as $field){
        $this->assertObjectHasAttribute($field,$firstResult);
      }

      $params = '?item_search_name=thishouldneverbeanitemname';
      $crawler = $client->request('GET', '/catalogue/search/items'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertEquals(0, sizeof($responseJson));

      $params = '';
      $crawler = $client->request('GET', '/catalogue/search/items'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertEquals(100, sizeof($responseJson));

      $params = '?item_search_code='.implode('%2C', $this->sampleData->items);
      $crawler = $client->request('GET', '/catalogue/search/items'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertEquals(sizeof($this->sampleData->items), sizeof($responseJson));

      $client = $this->createAnnonymousClient();
      $crawler = $client->request('GET', '/catalogue/search/items'.$params);
      $response = $client->getResponse();
      $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceSearch(){

      $client = $this->createAuthenticatedClient();
      //$params = '?item_search_name=%D0%9A%D1%80%D1%83%D0%B6%D0%BA%D0%B0&item_search_search_nested=true';
      $params = '?item_search_name='.urlencode($this->sampleData->searchResource->item_search_name).'&item_search_parent_name='.urlencode($this->sampleData->searchResource->item_search_parent_name).'&item_search_search_nested='.urlencode($this->sampleData->searchResource->item_search_search_nested).'&item_search_code='.urlencode($this->sampleData->searchResource->item_search_code).'&resource_search_id='.urlencode($this->sampleData->searchResource->resource_search_id).'&resource_search_preset='.urlencode($this->sampleData->searchResource->resource_search_preset).'&resource_search_type='.urlencode($this->sampleData->searchResource->resource_search_type);
      $crawler = $client->request('GET', '/catalogue/search/resources'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertGreaterThan(0, sizeof($responseJson));
      $firstResult = $responseJson[0];
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertGreaterThan(0, sizeof($responseJson));
      foreach($this->resourceFields as $field){
        $this->assertObjectHasAttribute($field,$firstResult);
      }

      $params = '?item_search_name=thisshouldneverbearesourcename';
      $crawler = $client->request('GET', '/catalogue/search/resources'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertEquals(0, sizeof($responseJson));

      $params = '';
      $crawler = $client->request('GET', '/catalogue/search/resources'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertEquals(100, sizeof($responseJson));

      $params = '?item_search_code='.implode('%2C', $this->sampleData->items);
      $crawler = $client->request('GET', '/catalogue/search/resources'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertGreaterThan(10, sizeof($responseJson));

      $client = $this->createAnnonymousClient();
      $crawler = $client->request('GET', '/catalogue/search/resources'.$params);
      $response = $client->getResponse();
      $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/'.$this->sampleData->resources[0]);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/resource/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/'.$this->sampleData->resources[0]);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceFullGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/full/'.$this->sampleData->resources[0]);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $itemRelation = $responseJson->item;
        foreach($this->itemFields as $field){
          $this->assertObjectHasAttribute($field,$itemRelation);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/resource/full/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/full');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/full/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/full/'.$this->sampleData->resources[0]);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourcesGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resources/'.$this->sampleData->itemWithResources);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $firstResult = $responseJson[0];
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertGreaterThan(0, sizeof($responseJson));
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$firstResult);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/resources/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resources');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resources/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resources/'.$this->sampleData->itemWithResources);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceRawGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/'.$this->sampleData->resources[0].'.jpg');
        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertTrue($response->headers->contains('Content-Type','image/jpeg'));

        $crawler = $client->request('GET', '/catalogue/node/item/resource/99999999999.jpg');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/.jpg');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/asdasd.jpg');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/'.$this->sampleData->resources[0].'.jpg');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourcePresetGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/'.$this->sampleData->baseResource.'/1');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/resource/'.$this->sampleData->baseResource.'/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEmpty((array)json_decode($response->getContent()));

        $crawler = $client->request('GET', '/catalogue/node/item/resource/1181/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/'.$this->sampleData->baseResource.'/'.$this->sampleData->baseResource.'/'.$this->sampleData->baseResource.'');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/'.$this->sampleData->baseResource.'/1');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceThumbnailGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/'.$this->sampleData->baseResource.'');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEmpty((array)json_decode($response->getContent()));

        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/'.$this->sampleData->baseResource.'/'.$this->sampleData->baseResource.'');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/'.$this->sampleData->baseResource.'');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceThumbnailsGet()
    {

        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('POST', '/catalogue/node/item/resource/thumbnails/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode(['resources'=>$this->sampleData->resources]));
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $firstResult = $responseJson[0];

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals(sizeof($responseJson), sizeof($this->sampleData->resources));
        $this->assertObjectHasAttribute('id',$firstResult);
        $this->assertObjectHasAttribute('thumb_id',$firstResult);

        $crawler = $client->request('POST', '/catalogue/node/item/resource/thumbnails/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode(['resources'=>[]]));
        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEmpty((array)json_decode($response->getContent()));

        $crawler = $client->request('POST', '/catalogue/node/item/resource/thumbnails/1189', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode(['resources'=>$this->sampleData->resources]));
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('POST', '/catalogue/node/item/resource/thumbnails/');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourcePatch()
    {
        $client = $this->createWriterClient();

        $resourceUpdateData = [
          'id'=>$this->sampleData->baseResource,
          'priority'=>"2",
          'type'=>"2",
        ];

        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/'.$this->sampleData->baseResource, array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }
        $this->assertEquals(2, json_decode($response->getContent())->type);

        $resourceUpdateData = [
          'id'=>"107804",
          'priority'=>"2",
          'type'=>"1",
        ];

        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/'.$this->sampleData->baseResource, array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }
        $this->assertEquals(1, json_decode($response->getContent())->type);

        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/'.$this->sampleData->baseResource, array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode([]));
        $response = $client->getResponse();
        $this->assertEquals(400, $response->getStatusCode());
        $this->assertEmpty((array)json_decode($response->getContent()));

        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/1902348102894', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAuthenticatedClient();
        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/'.$this->sampleData->baseResource, array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
        $response = $client->getResponse();
        $this->assertEquals(403, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/'.$this->sampleData->baseResource, array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());

    }

    public function testGetResourcePresets()
    {
      $client = $this->createAuthenticatedClient();

      $crawler = $client->request('GET', '/catalogue/resource/presets');
      $response = $client->getResponse();
      $this->assertEquals(200, $response->getStatusCode());
      $responseJson = json_decode($response->getContent());
      $this->assertGreaterThan(2, sizeof((array)$responseJson));

      $crawler = $client->request('GET', '/catalogue/resource/presets/1');
      $response = $client->getResponse();
      $this->assertEquals(404, $response->getStatusCode());

      $client = $this->createAnnonymousClient();
      $crawler = $client->request('GET', '/catalogue/resource/presets');
      $response = $client->getResponse();
      $this->assertEquals(302, $response->getStatusCode());
    }

    public function testGetResourceTypes()
    {
      $client = $this->createAuthenticatedClient();

      $crawler = $client->request('GET', '/catalogue/resource/types');
      $response = $client->getResponse();
      $this->assertEquals(200, $response->getStatusCode());
      $responseJson = json_decode($response->getContent());
      $this->assertGreaterThan(2, sizeof((array)$responseJson));

      $crawler = $client->request('GET', '/catalogue/resource/types/1');
      $response = $client->getResponse();
      $this->assertEquals(404, $response->getStatusCode());

      $client = $this->createAnnonymousClient();
      $crawler = $client->request('GET', '/catalogue/resource/types');
      $response = $client->getResponse();
      $this->assertEquals(302, $response->getStatusCode());
    }
    


}
