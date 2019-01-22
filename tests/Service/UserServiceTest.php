<?php
namespace App\Tests\Service;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Service\UserService;
use App\Entity\Security\User;
use Symfony\Component\HttpFoundation\Request;

class UserServiceTest extends WebTestCase
{

  public function setUp()
  {
      self::bootKernel();
      $container = self::$container;

      $this->entityManager = self::$container->get('doctrine.orm.default_entity_manager');
      $this->serviceContainer = self::$container->get('service_container');
  }

  public function getService()
  {
    $entityManager = $this->entityManager;
    $serviceContainer = $this->serviceContainer;
    $service = new UserService($entityManager,$serviceContainer);
    return $service;
  }

  public function testGetUsers()
  {
      $userService = $this->getService();

      $response = $userService->getUsers();
      $this->assertGreaterThan(1,sizeof($response));
      $this->assertArrayHasKey('id',$response[0]);
      $this->assertArrayHasKey('name',$response[0]);
      $this->assertArrayHasKey('email',$response[0]);
      $this->assertArrayHasKey('active',$response[0]);
      $this->assertArrayHasKey('password',$response[0]);
      $this->assertArrayHasKey('role',$response[0]);
      $superAdminReturned = false;
      foreach($response as $user){
        if($user['role']===0){
          $superAdminReturned = true;
        }
      }
      $this->assertFalse($superAdminReturned);
  }

  public function testSetUser()
  {
      $userService = $this->getService();

      $mockName="phpunit_mock_name";
      $mockEmail="phpunit_mock_email";
      $mockPassword="phpunit_mock_password";

      $response = $userService->getUsers();
      $user = $response[0];
      $user['name']=$mockName;
      $user['email']=$mockEmail;
      $user['password']=$mockPassword;
      $userService->setUser($user);
      $changedUser = $this->entityManager->getRepository(User::class)->findOneBy(['id'=>$user['id']]);
      $this->assertEquals($changedUser->getUsername(), $user['name']);
      $this->assertEquals($changedUser->getEmail(), $user['email']);
      $this->assertEquals($changedUser->getPassword(), $user['password']);
  }

}
