<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

use App\Entity\Security\User;

class BaseTest extends WebTestCase
{
    public $sampleData;
    public $admin;

    public function setUp()
    {
        self::bootKernel();

        $container = self::$container;

        $this->sampleData = json_decode(file_get_contents(self::$kernel->getContainer()->getParameter('test_dump_path')."datasample.txt"));
        $this->admin = self::$kernel->getContainer()->get('doctrine')->getRepository('App:Security\User')->findOneByUsername($this->sampleData->admin->name);
    }

    public function createAuthenticatedClient()
    {
        return $this->login('user', 'ROLE_USER');
    }

    public function createWriterClient()
    {
        return $this->login('writer', 'ROLE_WRITER');
    }

    public function createAdminClient()
    {
        return $this->login('admin', 'ROLE_ADMIN');
    }

    public function createAnnonymousClient()
    {
        return static::createClient(array(), array());
    }

    public function createRealAdmin(){
        return $this->login($this->admin, 'ROLE_ADMIN');
    }

    public function testNoWarning(){
      $this->assertTrue(true);
    }

    private function login($name, $role, $pass=null)
    {

      $client = static::createClient();

      $session = $client->getContainer()->get('session');
      $firewall = 'main';

      $token = new UsernamePasswordToken($name, $pass, $firewall, [$role]);
      $session->set('_security_'.$firewall, serialize($token));
      $session->save();

      $cookie = new Cookie($session->getName(), $session->getId());
      $client->getCookieJar()->set($cookie);

      return $client;
    }

}
