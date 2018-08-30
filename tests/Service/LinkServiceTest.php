<?php
namespace App\Tests\Service;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Service\ResourceService;
use App\Service\ImageProcessorService;
use App\Service\LinkService;
use App\Entity\Resource;
use App\Entity\Link;
use App\Entity\Security\User;
use App\Entity\CatalogueNodeItem;
use Symfony\Component\HttpFoundation\Request;

class LinkServiceTest extends WebTestCase
{

  public function setUp()
  {
      self::bootKernel();
      $container = self::$container;

      $this->entityManager = self::$container->get('doctrine.orm.default_entity_manager');
      $this->serviceContainer = self::$container->get('service_container');
      $this->fileSystem = self::$container->get('filesystem');

      $correctLink = $this->entityManager->getRepository(Link::class)->findOneBy([]);
      $correctResource = $this->entityManager->getRepository(Resource::class)->findOneBy([]);
      $this->correctResource = [
        'id'=>$correctResource->getId(),
        'priority'=>$correctResource->getPriority(),
        'type'=>$correctResource->getType(),
        'path'=>$correctResource->getPath()
      ];
      $this->correctLink = [
        'object'=>$correctLink,
        'id'=>$correctLink->getId(),
        'user'=>$correctLink->getCreatedBy(),
        'hash'=>$correctLink->getHash()
      ];
  }

  public function getService()
  {
    $entityManager = $this->entityManager;
    $serviceContainer = $this->serviceContainer;
    $fileSystem = $this->fileSystem;
    $service = new LinkService($entityManager,$serviceContainer,$fileSystem);
    return $service;
  }

  public function testCreateLink()
  {

    $linkService = $this->getService();

    try{
      $mockUser = new User();
      $mockUser->setUsername("phpunit_test_user")
      ->setPassword("s00pers3cr3t")
      ->setEmail("not@an.email")
      ->setPermissions("ROLE_USER")
      ->setIsActive(true);
      $this->entityManager->persist($mockUser);
      $this->entityManager->flush($mockUser);
    }catch(\Doctrine\DBAL\Exception\UniqueConstraintViolationException $e){
      $this->assertTrue(false,"Может быть, ты забыл запустить app:tests:prepare? Документация в /docs");
    }

    $mockParams = [
      'access' => null,
      'target' => "group",
      'expires_by' => null,
      'comment' => null,
      'max_requests' => null,
      'created_by' => $mockUser,
      'resource' => $this->correctResource['id'],
    ];

    $linkService->createLink($mockParams);
    $createdLink = $this->entityManager->getRepository(Link::class)->findOneBy(["created_by"=>$mockUser]);
    $this->assertInstanceOf(Link::class, $createdLink);
    $this->assertEquals($createdLink->getSrcId(), $this->correctResource['id']);

  }

  public function testUpdateLink()
  {
    $linkService = $this->getService();

    $mockParams = [
      'id'=>$this->correctLink['id'],
      'path'=>$this->correctResource['path'],
      'size_px'=>'100/100',
      'size_bytes'=>'100',
      'symlink'=>true,
      'target'=>'taaargeeeet',
    ];

    $linkService->updateLink($mockParams);
    $updatedLink = $this->entityManager->getRepository(Link::class)->findOneBy(['id'=>$this->correctLink['id']]);
    $this->assertEquals($mockParams['id'],$updatedLink->getId());
    $this->assertEquals($mockParams['path'],$updatedLink->getPath());
    $this->assertEquals($mockParams['size_px'],$updatedLink->getSizePx());
    $this->assertEquals($mockParams['size_bytes'],$updatedLink->getSizeBytes());
    $this->assertEquals($mockParams['symlink'],$updatedLink->getSymlink());
    $this->assertEquals($mockParams['target'],$updatedLink->getTarget());
  }

  public function testUserIsOwner()
  {
    $linkService = $this->getService();

    $response = $linkService->userIsOwner($this->correctLink['id'],$this->correctLink['user']->getId());
    $this->assertTrue($response);
  }

  public function testGetImageData()
  {
    $linkService = $this->getService();
    $request = new Request();
    $response = $linkService->getImageData($this->correctLink['hash'], $request, new User());
    $this->assertArrayHasKey('filename', $response);
    $this->assertArrayHasKey('content', $response);
  }

  public function testFetchAllForUser()
  {
    $linkService = $this->getService();
    $response = $linkService->fetchAllForUser($this->correctLink['user']);
    $this->assertInstanceOf(Link::class, $response[0]);
    $this->assertEquals($response[0]->getCreatedBy()->getUsername(), $this->correctLink['user']->getUsername());
  }

  public function testFetchAllWithExtraFields()
  {
    $linkService = $this->getService();
    $response = $linkService->fetchAllWithExtraFields($this->correctLink['user']);
    $this->assertArrayHasKey('link_id',$response[0]);
    $this->assertArrayHasKey('resource_id',$response[0]);
    $this->assertArrayHasKey('item_id',$response[0]);
    $this->assertArrayHasKey('item_name',$response[0]);
    $firstResult = $this->entityManager->getRepository(Link::class)->findOneBy(["id"=>$response[0]['link_id']]);
    $this->assertEquals($firstResult->getCreatedBy()->getUsername(), $this->correctLink['user']->getUsername());
  }

  public function testGetUrls()
  {
    $linkService = $this->getService();
    $links = $this->correctLink['id'].", ".$this->correctLink['id'];
    $response = $linkService->getUrls($links);
    $this->assertEquals(sizeof(explode("\n",$response)),2);
  }

  //Валидация формы происходит на фронте, тест пока не нужен
  // public function testValidateForm()
  // {
  //   $linkService = $this->getService();
  //
  //
  //   $linkService->validateForm();
  // }
  //
    public function testDeleteLink()
    {
      $linkService = $this->getService();

      $linkService->deleteLink($this->correctLink['object'], $this->correctLink['user']->getId());
      $deletedLink = $this->entityManager->getRepository(Link::class)->findOneBy(['id'=>$this->correctLink['id']]);
      $this->assertEquals(NULL,$deletedLink);
    }

}
