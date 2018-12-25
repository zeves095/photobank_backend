<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class UsermanagerControllerTest extends WebTestCase
{

  public function testIndex()
  {
    $client = $this->createAdminClient();
    $crawler = $client->request('GET', '/usermanager');
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());

    $config = json_decode($crawler->filter("#usermanager-wrapper")->first()->attr("data-config"));
    $configVars = ["user_get_url", "user_get_url"];
    foreach($configVars as $var){
      $this->assertObjectHasAttribute($var, $config);
    }

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

  // public function testGetUsers()
  // {
  //   $client = $this->createAdminClient();
  //   $crawler = $client->request('GET', '/usermanager/get');
  //   $response = $client->getResponse();
  //   $this->assertEquals(200, $response->getStatusCode());
  //   $responseJson = json_decode($response);
  //   var_dump($responseJson);
  //   $this->assertTrue(is_array($responseJson));
  //
  //   $client = $this->createAuthenticatedClient();
  //   $crawler = $client->request('GET', '/usermanager/get');
  //   $response = $client->getResponse();
  //   $this->assertEquals(403, $response->getStatusCode());
  //
  //   $client = $this->createWriterClient();
  //   $crawler = $client->request('GET', '/usermanager/get');
  //   $response = $client->getResponse();
  //   $this->assertEquals(403, $response->getStatusCode());
  //
  //   $client = $this->createAnnonymousClient();
  //   $crawler = $client->request('GET', '/usermanager/get');
  //   $response = $client->getResponse();
  //   $this->assertEquals(302, $response->getStatusCode());
  // }

  private function createAuthenticatedClient()
  {
      return static::createClient(array(), array(
        'PHP_AUTH_USER' => 'user',
        'PHP_AUTH_PW'   => 'password',
      ));
  }

  private function createAdminClient()
  {
      return static::createClient(array(), array(
        'PHP_AUTH_USER' => 'admin',
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
