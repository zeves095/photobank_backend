<?php

namespace App\Tests\Controller;

use App\Tests\Controller\BaseTest;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class SecurityControllerTest extends BaseTest
{
  public function testLogin()
  {
    $client = $this->createAnnonymousClient();
    $crawler = $client->request('GET', '/login');
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());
  }

}
