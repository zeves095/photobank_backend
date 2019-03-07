<?php

namespace App\Tests\Controller;

use App\Tests\Controller\BaseTest;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class UploadControllerTest extends BaseTest
{

  public function testIndex()
  {
    $client = $this->createAuthenticatedClient();
    $crawler = $client->request('GET', '/upload/');
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());

    $client = $this->createAnnonymousClient();
    $crawler = $client->request('GET', '/upload');
    $response = $client->getResponse();
    $this->assertEquals(302, $response->getStatusCode());

  }

}
