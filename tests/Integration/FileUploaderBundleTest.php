<?php
namespace App\Tests\Integration;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use PhotoBank\FileUploaderBundle\Entity\Upload;
use App\Tests\Controller\BaseTest;

class FileUploaderBundleTest extends BaseTest
{

  public function setUp()
  {
    parent::setUp();
    $this->entityManager = self::$container->get('doctrine.orm.default_entity_manager');
  }

  public function testConfig()
  {
    $this->assertTrue(is_string(self::$container->getParameter('fileuploader.desinationdir')));
    $this->assertTrue(is_string(self::$container->getParameter('fileuploader.tempdir')));
    $this->assertTrue(is_string(self::$container->getParameter('fileuploader.targeturl')));
    $this->assertTrue(is_int(self::$container->getParameter('fileuploader.chunksize')));
    $this->assertTrue(is_int(self::$container->getParameter('fileuploader.simultaneousuploads')));
    $this->assertTrue(is_string(self::$container->getParameter('fileuploader.allowedfiletypes')));
    $this->assertTrue(is_string(self::$container->getParameter('fileuploader.uploaddirectory')));
  }

  public function testCommitEndpoint()
  {
    $client = $this->createRealAdmin();
    $params = [
      'filehash'=>'3ed80d893dd9c5582ea2dd3cab9c6c4f',
      'filename'=>'phpunit_mock_file.jpg',
      'itemid'=>'00010611386',
      'totalchuks'=>1
    ];
    $crawler = $client->request('POST', self::$container->getParameter('fileuploader.targeturl')."commit", $params);
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(200, $response->getStatusCode());
    $upload = $this->entityManager->getRepository(Upload::class)->findOneBy(['file_hash'=>$params['filehash']]);
    $this->assertEquals($upload->getFilename(),$params['filename']);
    $this->assertEquals($upload->getItemId(),$params['itemid']);
    $this->assertEquals($upload->getTotalChunks(),$params['totalchuks']);
  }

  public function testCheckChunk()
  {
    $client = $this->createRealAdmin();
    $params = [
      'resumableChunkNumber'=>'1',
      'resumableChunkSize'=>'1048576',
      'resumableCurrentChunkSize'=>'62913',
      'resumableTotalSize'=>'62913',
      'resumableType'=>'image/jpeg',
      'resumableIdentifier'=>'3ed80d893dd9c5582ea2dd3cab9c6c4f',
      'resumableFilename'=>'phpunit_mock_file.jpg',
      'resumableRelativePath'=>'phpunit_mock_file.jpg',
      'resumableTotalChunks'=>'1',
      'itemId'=>'00010611386',
      'itemCode'=>'00010611386',
    ];
    $getparams = [];
    foreach($params as $key=>$param){
      $getparams[] = $key.'='.$param;
    }
    $getparams = '?'.implode('&', $getparams);
    $crawler = $client->request('GET', self::$container->getParameter('fileuploader.targeturl').$getparams);
    $response = $client->getResponse();
    $responseJson = json_decode($response->getContent());
    $this->assertEquals(404, $response->getStatusCode());
  }

  public function testUploadChunk()
  {
    $client = $this->createRealAdmin();
    $params = [
      'resumableChunkNumber'=>'1',
      'resumableChunkSize'=>'1048576',
      'resumableCurrentChunkSize'=>'62913',
      'resumableTotalSize'=>'62913',
      'resumableType'=>'image/jpeg',
      'resumableIdentifier'=>'3ed80d893dd9c5582ea2dd3cab9c6c4f',
      'resumableFilename'=>'phpunit_mock_file.jpeg',
      'resumableRelativePath'=>'phpunit_mock_file.jpeg',
      'resumableTotalChunks'=>'1',
      'itemId'=>'00010611386',
      'itemCode'=>'00010611386',
      'file'=>b'filecontentfilecontentfilecontentfilecontentfilecontentfilecontentfilecontent'
    ];
    $getparams = [];
    foreach($params as $key=>$param){
      $getparams[] = $key.'='.$param;
    }
    $getparams = '?'.implode('&', $getparams);
    $crawler = $client->request('POST', self::$container->getParameter('fileuploader.targeturl').$getparams, $params);
    $response = $client->getResponse();
    $this->assertEquals(200, $response->getStatusCode());
  }

}
