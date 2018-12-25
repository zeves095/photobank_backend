<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class UploadControllerTest extends WebTestCase
{

  public function testIndex()
  {
    $client = $this->createAuthenticatedClient();
    $crawler = $client->request('GET', '/upload');
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());

    $config = json_decode($crawler->filter("#photobank-wrapper")->first()->attr("data-config"));
    $configVars = [
      "upload_directory", "upload_target_url", "existing_uploads_url", "unfinished_uploads_url",
      "commit_upload_url", "remove_upload_url", "resource_url", "item_url", "item_search_url",
      "get_nodes_url", "get_items_url", "max_main_resources", "max_additional_resources", "presets", "upload_url"];
    foreach($configVars as $var){
      $this->assertObjectHasAttribute($var, $config);
    }
    $client = $this->createAnnonymousClient();
    $crawler = $client->request('GET', '/upload');
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
