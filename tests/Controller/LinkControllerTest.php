<?php

namespace App\Tests\Controller;

use App\Tests\Controller\BaseTest;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class LinkControllerTest extends BaseTest
{

  public function testValidateForm()
  {
    $noResourceFormData = [
      'resource'=>'',
      'size'=>[
        'width'=>300,
        'height'=>300
      ]
    ];

    $validNonCustomFormData = [
      'resource'=>123, 124
    ];

    $validCustomFormData = [
      'resource'=>123, 124,
      'size'=>[
        'width'=>300,
        'height'=>300
      ]
    ];

    $customTooSmallFormData = [
      'resource'=>123, 124,
      'size'=>[
        'width'=>32,
        'height'=>10
      ]
    ];

    $customIncompleteFormData = [
      'resource'=>123, 124,
      'size'=>[
        'width'=>32
      ]
    ];

    $customBadRatioFormData = [
      'resource'=>123, 124,
      'size'=>[
        'width'=>1000,
        'height'=>2000
      ]
    ];

    $client = $this->createAuthenticatedClient();
    $crawler = $client->request('POST', '/api/links/validateform/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($validNonCustomFormData));
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertObjectHasAttribute('error',$responseJson);
    $this->assertEquals($responseJson->error, null);

    $crawler = $client->request('POST', '/api/links/validateform/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($validCustomFormData));
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertObjectHasAttribute('error',$responseJson);
    $this->assertEquals($responseJson->error, null);

    $crawler = $client->request('POST', '/api/links/validateform/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($customTooSmallFormData));
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(400, $response->getStatusCode());
    $this->assertObjectHasAttribute('error',$responseJson);

    $crawler = $client->request('POST', '/api/links/validateform/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($customIncompleteFormData));
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(400, $response->getStatusCode());
    $this->assertObjectHasAttribute('error',$responseJson);

    $crawler = $client->request('POST', '/api/links/validateform/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($customBadRatioFormData));
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(400, $response->getStatusCode());
    $this->assertObjectHasAttribute('error',$responseJson);

    $crawler = $client->request('POST', '/api/links/validateform/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($noResourceFormData));
    //var_dump(["",$crawler->filter("h1.exception-message")->first()->text()]);
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(400, $response->getStatusCode());
    $this->assertObjectHasAttribute('error',$responseJson);

    $client = $this->createAnnonymousClient();
    $crawler = $client->request('POST', '/api/links/validateform/', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($validNonCustomFormData));
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(302, $response->getStatusCode());

  }

  public function testGetTxt()
  {
    $mockText = ["links"=>$this->sampleData->links];
    $client = $this->createAuthenticatedClient();
    $crawler = $client->request('POST', '/api/links/txt/', $mockText);
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertTrue($response->headers->contains(
        'Content-Type',
        'binary/octet-stream'
    ));

    $crawler = $client->request('POST', '/api/links/txt/', []);
    $response = $client->getResponse();
    $this->assertEquals(400, $response->getStatusCode());

    $client = $this->createAnnonymousClient();
    $crawler = $client->request('POST', '/api/links/txt/', $mockText);
    $response = $client->getResponse();
    $this->assertEquals(302, $response->getStatusCode());
  }

  public function testFetchAll()
  {
    $client = $this->createRealAdmin();
    $crawler = $client->request('GET', '/api/links/fetchall');
    //var_dump($crawler->filter('h1.exception-message')->text());
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());
    $this->assertTrue(is_array(json_decode($response->getContent())));

    $client = $this->createAnnonymousClient();
    $crawler = $client->request('GET', '/api/links/fetchall');
    $response = $client->getResponse();
    $this->assertEquals(302, $response->getStatusCode());
  }

  public function testLinkCreate()
  {
    $nonCustomLinkData = [
      "resource"=>implode(',', $this->sampleData->resources),
      "size"=>[]
    ];

    $customLinkData = [
      "resource"=>implode(',', $this->sampleData->resources),
      "size"=>["width"=>"100","height"=>"100"],
      "target"=>"sample_group"
    ];

    $invalidLinkData = [
      "resource"=>"",
      "size"=>["width"=>"100","height"=>"100"],
      "target"=>"sample_group"
    ];

    $client = $this->createRealAdmin();

    $crawler = $client->request('GET', '/api/links/fetchall');
    $response = $client->getResponse();
    $baseLinkCount = sizeof(json_decode($response->getContent()));

    $crawler = $client->request('POST', '/api/links/submit', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($nonCustomLinkData));
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());

    $crawler = $client->request('GET', '/api/links/fetchall');
    $response = $client->getResponse();
    $baseLinkCount = $baseLinkCount+sizeof($this->sampleData->resources);
    $this->assertEquals($baseLinkCount, sizeof(json_decode($response->getContent())));

    $crawler = $client->request('POST', '/api/links/submit', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($customLinkData));
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());

    $crawler = $client->request('GET', '/api/links/fetchall');
    $response = $client->getResponse();
    $baseLinkCount = $baseLinkCount+sizeof($this->sampleData->resources);
    $this->assertEquals($baseLinkCount, sizeof(json_decode($response->getContent())));

    $crawler = $client->request('POST', '/api/links/submit', array(), array(), array('CONTENT_TYPE' => 'application/json'),json_encode($invalidLinkData));
    $response = $client->getResponse();
    //var_dump($crawler->filter('h1.exception-message')->text());
    $this->assertEquals(400, $response->getStatusCode());

  }

  public function testLinkDelete()
  {
    $client = $this->createRealAdmin();

    $crawler = $client->request('GET', '/api/links/fetchall');
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());
    $links = json_decode($response->getContent());

    $crawler = $client->request('GET', '/api/links/delete/'.$links[0]->link_id);
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());

  }

}
