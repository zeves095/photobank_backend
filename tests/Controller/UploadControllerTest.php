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

    $config = json_decode($crawler->filter("#photobank-root")->first()->attr("data-config"));
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

}
