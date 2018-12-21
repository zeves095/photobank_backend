<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class AccountControllerTest extends WebTestCase
{

  public function testIndex()
  {
    $client=$this->createAuthenticatedClient();
    $crawler = $client->request('GET', '/account/');
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());

  }

  public function testUserInfoGet()
  {
    $client=$this->createAuthenticatedClient();
    $crawler = $client->request('GET', '/account/getinfo/');
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertObjectHasAttribute('user_id',$responseJson);
    $this->assertObjectHasAttribute('user_name',$responseJson);
    $this->assertObjectHasAttribute('user_email',$responseJson);
    $this->assertObjectHasAttribute('user_active',$responseJson);
    $this->assertObjectHasAttribute('user_password',$responseJson);
    $this->assertObjectHasAttribute('user_roles',$responseJson);
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
