<?php

namespace App\Tests\Controller;

use App\Tests\Controller\BaseTest;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class GarbageStorageControllerTest extends BaseTest
{

    protected $nodeFields = ['id', 'name', 'parent'];
    protected $resourceFields = ['chunkPath','comment','created_on','filename','gid','id','is1c','isDefault','isDeleted','item','path','preset','priority','size_bytes','size_px','src_filename','type','username'];

    public function testNodeGet()
    {

        $client = $this->createRealAdmin();
        $crawler = $client->request('GET', '/garbage/node/'.$this->sampleData->garbageNodes[0]);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->nodeFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }

        $crawler = $client->request('GET', '/garbage/node/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/garbage/node/');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/garbage/node/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/garbage/node/'.$this->sampleData->nodes[0]);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testNodesGet()
    {
        $client = $this->createRealAdmin();

        $crawler = $client->request('GET', '/garbage/nodes/'.$this->sampleData->garbageNodeWithChildren);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $firstResult = $responseJson[0];
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertGreaterThan(0, sizeof($responseJson));
        foreach($this->nodeFields as $field){
          $this->assertObjectHasAttribute($field,$firstResult);
        }

        $crawler = $client->request('GET', '/garbage/nodes');
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertGreaterThan(0, sizeof($responseJson));
        foreach($this->nodeFields as $field){
          $this->assertObjectHasAttribute($field,$firstResult);
        }

        $crawler = $client->request('GET', '/garbage/nodes/99999999999');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $crawler = $client->request('GET', '/garbage/nodes/asdasd');
        $response = $client->getResponse();
        $this->assertEquals(404, $response->getStatusCode());

        $client = $this->createAnnonymousClient();
        $crawler = $client->request('GET', '/garbage/nodes/'.$this->sampleData->garbageNodeWithChildren);
        $response = $client->getResponse();
        $this->assertEquals(302, $response->getStatusCode());
    }

    public function testResourceGet()
    {
        $client = $this->createRealAdmin();

        $crawler = $client->request('GET', '/catalogue/node/item/resource/'.$this->sampleData->garbageResource);
        $response = $client->getResponse();
        $responseJson = json_decode($response->getContent());
        $this->assertEquals(200, $response->getStatusCode());
        foreach($this->resourceFields as $field){
          $this->assertObjectHasAttribute($field,$responseJson);
        }
    }

}
