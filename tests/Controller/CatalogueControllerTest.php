<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class CatalogueControllerTest extends WebTestCase
{

    protected $nodeFields = ['id', 'name', 'parent', 'children'];
    protected $itemFields = ['id','name','itemCode','node'];
    protected $resourceFields = ['chunkPath','comment','created_on','filename','gid','id','is1c','isDefault','isDeleted','item','path','preset','priority','size_bytes','size_px','src_filename','type','username'];

    protected $resourceIds =  [
      111100,111102,111104,111106,111112,111148,111172,111299,
      111301,111303,111305,111307,111309,111311,111313,111315,
      111317,111319,111321,111323,111325,111327,111329,111331,
      111333,111335,111337,111780,111782,111784,111786,111849,
      111865,111873,111903,111907,111913,111915,111924,111926,
      111938,111940,111941,111994,111996,111998,112000,112002,
      112004,112006,112008,112010,112026,112072,112074,112078,
      112080,112083,112084,112086,112088,112101,112102,112104,
      112116,112156,112162,112180,112375,112553,112554,112556,
      112557,112559,112561,112562,112580,112582,112584,112586,
      112588,112590,112592,112594,112596,112598,112600,112606,
      112607,112609,112611,112612,112614,112616,112622,112624,
      112626,112628,112630,112632];

    public function testNodeGet()
    {
        $client = $this->createAuthenticatedClient();
        $crawler = $client->request('GET', '/catalogue/node/00000000000');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->nodeFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/00000000000');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testNodesGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/nodes/00000000000');
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

        $crawler = $client->request('GET', '/catalogue/nodes/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/nodes/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/nodes/00000000000');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testItemGetByCode()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/00000000016');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->itemFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/00000000016');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testItemGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/00000000016');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->itemFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/00000000016');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testItemsGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/items/00000059739');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $firstResult = $responseJson[0];
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertGreaterThan(0, sizeof($responseJson));
        foreach($this->itemFields as $field){
          $this->assertObjectHasAttribute($field,$firstResult);
        }

        $crawler = $client->request('GET', '/catalogue/node/items/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/items');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/items/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/items/00000059739');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testItemSearch()
    {
      $client = $this->createAuthenticatedClient();
      $params = '?item_search_code=1&item_search_name=%D0%9A%D1%80%D1%83%D0%B6%D0%BA%D0%B0&item_search_parent_name=&item_search_search_nested=1';
      $crawler = $client->request('GET', '/catalogue/search/items'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertGreaterThan(0, sizeof($responseJson));
      $firstResult = $responseJson[0];
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertGreaterThan(0, sizeof($responseJson));
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

      $params = '?item_search_code=00010583897%2C00010583901%2C00010584192%2C00010584192%2C00010584193%2C00010584193%2C00010584197%2C00010584197%2C00010584198%2C00010584198%2C00010584199%2C00010584199%2C00010584202%2C00010584202%2C00010593663%2C00010595352%2C00010595353%2C00010595354%2C00010600462%2C00010600462%2C00010600464%2C00010600464%2C00010605749%2C00010605749%2C00010605778%2C00010605778%2C00010607638%2C00010607638%2C00010607685%2C00010607685%2C00010607746%2C00010607746%2C00010607748%2C00010607748%2C00010607753%2C00010607753%2C00010611711%2C00010611712%2C00010611713%2C00010611716%2C00010611720%2C00010611721%2C00010611722%2C00010611742%2C00010611744%2C00010611751%2C00010611752%2C00010611759%2C00010611769%2C00010611773%2C00010611775%2C00010613117%2C00010613131%2C00010613364%2C00010613364%2C00010618179%2C00010618179%2C00010618180%2C00010618180%2C00010619641%2C00010619662%2C00010620795%2C00010620795%2C00010620795%2C00010620795%2C00010620795%2C00010620795%2C00010620795%2C00010620875%2C00010625364%2C00010625364%2C00010625364%2C00010625364%2C00010625364%2C00010625364%2C00010625364%2C00010625365%2C00010625365%2C00010625365%2C00010625365%2C00010625365%2C00010625365%2C00010625365%2C00010627756%2C00010627757%2C00010627758%2C00010627759%2C00010627760%2C00010627762%2C00010627763%2C00010627767%2C00010627768%2C00010627769%2C00010627770%2C00010627771%2C00010627772%2C00010627773%2C00010627797%2C00010627798%2C00010627799%2C00010627800%2C00010627801%2C00010627805%2C00010627807%2C00010627931';
      $crawler = $client->request('GET', '/catalogue/search/items'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertGreaterThan(20, sizeof($responseJson));

      $client = $this->createAnnonymousClient();
      $crawler = $client->request('GET', '/catalogue/search/items'.$params);
      $response = $client->getResponse();
      $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceSearch(){

      $client = $this->createAuthenticatedClient();
      $params = '?item_search_name=%D0%9A%D1%80%D1%83%D0%B6%D0%BA%D0%B0&item_search_search_nested=true';
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

      $params = '?item_search_name=thishouldneverbeanitemname';
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

      $params = '?item_search_code=00010583897%2C00010583901%2C00010584192%2C00010584192%2C00010584193%2C00010584193%2C00010584197%2C00010584197%2C00010584198%2C00010584198%2C00010584199%2C00010584199%2C00010584202%2C00010584202%2C00010593663%2C00010595352%2C00010595353%2C00010595354%2C00010600462%2C00010600462%2C00010600464%2C00010600464%2C00010605749%2C00010605749%2C00010605778%2C00010605778%2C00010607638%2C00010607638%2C00010607685%2C00010607685%2C00010607746%2C00010607746%2C00010607748%2C00010607748%2C00010607753%2C00010607753%2C00010611711%2C00010611712%2C00010611713%2C00010611716%2C00010611720%2C00010611721%2C00010611722%2C00010611742%2C00010611744%2C00010611751%2C00010611752%2C00010611759%2C00010611769%2C00010611773%2C00010611775%2C00010613117%2C00010613131%2C00010613364%2C00010613364%2C00010618179%2C00010618179%2C00010618180%2C00010618180%2C00010619641%2C00010619662%2C00010620795%2C00010620795%2C00010620795%2C00010620795%2C00010620795%2C00010620795%2C00010620795%2C00010620875%2C00010625364%2C00010625364%2C00010625364%2C00010625364%2C00010625364%2C00010625364%2C00010625364%2C00010625365%2C00010625365%2C00010625365%2C00010625365%2C00010625365%2C00010625365%2C00010625365%2C00010627756%2C00010627757%2C00010627758%2C00010627759%2C00010627760%2C00010627762%2C00010627763%2C00010627767%2C00010627768%2C00010627769%2C00010627770%2C00010627771%2C00010627772%2C00010627773%2C00010627797%2C00010627798%2C00010627799%2C00010627800%2C00010627801%2C00010627805%2C00010627807%2C00010627931';
      $crawler = $client->request('GET', '/catalogue/search/resources'.$params);
      $response = $client->getResponse();
      $responseJson = json_decode($response->getContent());
      $this->assertEquals(200, $response->getStatusCode());
      $this->assertGreaterThan(20, sizeof($responseJson));

      $client = $this->createAnnonymousClient();
      $crawler = $client->request('GET', '/catalogue/search/resources'.$params);
      $response = $client->getResponse();
      $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/222673');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/resource/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/222673');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceFullGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/full/222673');
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

        $crawler = $client->request('GET', '/catalogue/node/item/resource/full/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/full');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/full/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/full/222673');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourcesGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resources/00000000496');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $firstResult = $responseJson[0];
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertGreaterThan(0, sizeof($responseJson));
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$firstResult);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/resources/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resources');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resources/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resources/00000000496');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceRawGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/1189.jpg');
        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertTrue($response->headers->contains('Content-Type','image/jpeg'));

        $crawler = $client->request('GET', '/catalogue/node/item/resource/11111111111.jpg');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/.jpg');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/asdasd.jpg');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/1189.jpg');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourcePresetGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/1189/1');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/resource/1189/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEmpty((array)json_decode($response->getContent()));

        $crawler = $client->request('GET', '/catalogue/node/item/resource/1181/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/1189/1189/1189');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/1189/1');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceThumbnailGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/1189');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/11111111111');
        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEmpty((array)json_decode($response->getContent()));

        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/1189/1189');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/catalogue/node/item/resource/thumbnail/1189');
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceThumbnailsGet()
    {
        $client = $this->createAuthenticatedClient();

        $crawler = $client->request('POST', '/catalogue/node/item/resource/thumbnails/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode(['resources'=>$this->resourceIds]));
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $firstResult = $responseJson[0];

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals(sizeof($responseJson), sizeof($this->resourceIds));
        $this->assertObjectHasAttribute('id',$firstResult);
        $this->assertObjectHasAttribute('thumb_id',$firstResult);

        $crawler = $client->request('POST', '/catalogue/node/item/resource/thumbnails/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode(['resources'=>[]]));
        $response = $client->getResponse();
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEmpty((array)json_decode($response->getContent()));

        $crawler = $client->request('POST', '/catalogue/node/item/resource/thumbnails/1189', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode(['resources'=>$this->resourceIds]));
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
          'id'=>"107804",
          'priority'=>"2",
          'type'=>"2",
        ];

        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/107804', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
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

        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/107804', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }
        $this->assertEquals(1, json_decode($response->getContent())->type);

        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/107804', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode([]));
        $response = $client->getResponse();
        $this->assertEquals(400, $response->getStatusCode());
        $this->assertEmpty((array)json_decode($response->getContent()));

        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/1902348102894', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAuthenticatedClient();
        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/107804', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
        $response = $client->getResponse();
        $this->assertEquals(403, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('PATCH', '/catalogue/node/item/resource/107804', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($resourceUpdateData));
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

    private function createAuthenticatedClient()
    {
        return static::createClient(array(), array(
          'PHP_AUTH_USER' => 'user',
          'PHP_AUTH_PW'   => 'password',
        ));
    }

    private function createWriterClient()
    {
        return static::createClient(array(), array(
          'PHP_AUTH_USER' => 'writer',
          'PHP_AUTH_PW'   => 'password',
        ));
    }

    private function createAnnonymousClient()
    {
        return static::createClient(array(), array());
    }

}
