<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class SecurityControllerTest extends WebTestCase
{
  public function testLogin()
  {
    $client = $this->createAnnonymousClient();
    $crawler = $client->request('GET', '/login');
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());
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
