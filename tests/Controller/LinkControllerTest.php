<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

class LinkControllerTest extends WebTestCase
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
    $mockText = ["links"=>["link1", "link2"]];
    $client = $this->createAuthenticatedClient();
    // $crawler = $client->request('POST', '/api/links/txt/', $mockText);
    // $response = $client->getResponse();
    // var_dump($response->headers);
    // $this->assertEquals(200, $response->getStatusCode());
    // $this->assertTrue($response->headers->contains(
    //     'Content-Type',
    //     'binary/octet-stream'
    // ));

    $crawler = $client->request('POST', '/api/links/txt/', []);
    $response = $client->getResponse();
    $this->assertEquals(400, $response->getStatusCode());

    $client = $this->createAnnonymousClient();
    $crawler = $client->request('POST', '/api/links/txt/', $mockText);
    $response = $client->getResponse();
    $this->assertEquals(302, $response->getStatusCode());
  }

  // public function testFetchAll()
  // {
  //   $client = $this->createAuthenticatedClient();
  //   $crawler = $client->request('GET', '/api/links/fetchall');
  //   $response = $client->getResponse();
  //   $this->assertEquals(200, $response->getStatusCode());
  //   $this->assertTrue(is_array(json_decode($response->getContent())));
  //
  //   $client = $this->createAnnonymousClient();
  //   $crawler = $client->request('GET', '/api/links/fetchall');
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
