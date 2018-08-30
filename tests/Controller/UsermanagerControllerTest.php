<?php

namespace App\Tests\Controller;

use App\Tests\Controller\BaseTest;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class UsermanagerControllerTest extends BaseTest
{

  public function testIndex()
  {
    $client = $this->createAdminClient();
    $crawler = $client->request('GET', '/usermanager/');
    $response = $client->getResponse();

    $this->assertEquals(200, $response->getStatusCode());

    $client = $this->createAuthenticatedClient();
    $crawler = $client->request('GET', '/usermanager');
    $response = $client->getResponse();
    $this->assertEquals(403, $response->getStatusCode());

    $client = $this->createWriterClient();
    $crawler = $client->request('GET', '/usermanager');
    $response = $client->getResponse();
    $this->assertEquals(403, $response->getStatusCode());

    $client = $this->createAnnonymousClient();
    $crawler = $client->request('GET', '/usermanager');
    $response = $client->getResponse();
    $this->assertEquals(302, $response->getStatusCode());

  }

  public function testGetUsers()
  {
    $client = $this->createAdminClient();
    $crawler = $client->request('GET', '/usermanager/get');
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());
    $responseJson = json_decode($response->getContent());
    $this->assertTrue(is_array($responseJson));

    $client = $this->createAuthenticatedClient();
    $crawler = $client->request('GET', '/usermanager/get');
    $response = $client->getResponse();
    $this->assertEquals(403, $response->getStatusCode());

    $client = $this->createWriterClient();
    $crawler = $client->request('GET', '/usermanager/get');
    $response = $client->getResponse();
    $this->assertEquals(403, $response->getStatusCode());

    $client = $this->createAnnonymousClient();
    $crawler = $client->request('GET', '/usermanager/get');
    $response = $client->getResponse();
    $this->assertEquals(302, $response->getStatusCode());
  }

  public function testSetUser(){
    $client = $this->createAdminClient();

    $userUpdateData = json_encode([
      'name'=>"namefortest",
      'password'=>"passfortest",
      'email'=>"email@for.test",
      'active'=>"0",
      'id'=>$this->sampleData->users[0],
      'role'=>2
    ]);

    $illegalUserUpdateData = json_encode([
      'name'=>"namefortest",
      'password'=>"passfortest",
      'email'=>"email@for.test",
      'active'=>"0",
      'id'=>$this->sampleData->users[0],
      'role'=>0
    ]);

    $newUserData = json_encode([
      'name'=>"namefortest".(max($this->sampleData->users)+1),
      'password'=>"passfortest",
      'email'=>"email".(max($this->sampleData->users)+1)."@for.test",
      'active'=>"1",
      'id'=>max($this->sampleData->users)+1,
      'role'=>2
    ]);

    $crawler = $client->request('GET', '/usermanager/get');
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $baseUserCount = sizeof($responseJson);

    $crawler = $client->request('POST', '/usermanager/set', array(), array(), array('CONTENT_TYPE' => 'application/json'), $userUpdateData);
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    //var_dump($crawler->filter('h1.exception-message')->text());
    //var_dump($response->getContent());
    $this->assertEquals(200, $response->getStatusCode());

    $crawler = $client->request('POST', '/usermanager/set', array(), array(), array('CONTENT_TYPE' => 'application/json'), $illegalUserUpdateData);
    $response = $client->getResponse();
    $this->assertEquals(400, $response->getStatusCode());

    $crawler = $client->request('POST', '/usermanager/set', array(), array(), array('CONTENT_TYPE' => 'application/json'), $newUserData);
    $response = $client->getResponse();
    //var_dump($crawler->filter('h1.exception-message')->text());
    $this->assertEquals(200, $response->getStatusCode());

    $crawler = $client->request('GET', '/usermanager/get');
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals($baseUserCount+1, sizeof($responseJson));

    $crawler = $client->request('POST', '/usermanager/set/1902348102894', array(), array(), array('CONTENT_TYPE' => 'application/json'), $userUpdateData);
    $response = $client->getResponse();
    $this->assertEquals(404, $response->getStatusCode());

    $client = $this->createAuthenticatedClient();
    $crawler = $client->request('POST', '/usermanager/set', array(), array(), array('CONTENT_TYPE' => 'application/json'), $userUpdateData);
    $response = $client->getResponse();
    $this->assertEquals(403, $response->getStatusCode());

    $client = $this->createAnnonymousClient();
    $crawler = $client->request('POST', '/usermanager/set', array(), array(), array('CONTENT_TYPE' => 'application/json'), $userUpdateData);
    $response = $client->getResponse();
    $this->assertEquals(302, $response->getStatusCode());
  }


}
