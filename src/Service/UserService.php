<?php

namespace App\Service;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Security\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Service\UserService;
use Symfony\Component\DependencyInjection\ContainerInterface;

class UserService{

  private $entityManager;
  private $container;

  public function __construct(
      EntityManagerInterface $entityManager,
      ContainerInterface $container)
  {
    $this->entityManager = $entityManager;
    $this->container = $container;
  }

  public function getUsers(){

    $roles = $this->_getRoles();

    $users = $this->entityManager->getRepository(User::class)->findAll();
    $responseArr = [];

    for($i = 0; $i<sizeof($users); $i++){
      $user = [];
      $user["id"] = $users[$i]->getId();
      $user["name"] = $users[$i]->getUsername();
      $user["email"] = $users[$i]->getEmail();
      $user["active"] = $users[$i]->getIsActive();
      $user["password"] = $users[$i]->getPassword();
      $user["role"] = $roles[$users[$i]->getPermissions()];
      $responseArr[] = $user;
    }

    return $responseArr;
  }

  public function setUser($user){
    $existing = $this->entityManager->getRepository(User::class)->findOneBy(["id"=>$user["id"]]);
    if($existing){
      $this->_updateUser($user, $existing);
    } else{
      $this->_createUser($user);
    }
  }

  private function _createUser($user){
    $roles = $this->_getRoles();
    $newUser = new User();
    $newUser->setUsername($user["name"]);
    $newUser->setPassword($user["password"]);
    $newUser->setEmail($user["email"]);
    $newUser->setIsActive($user["active"]);
    $newUser->setPermissions(array_keys($roles)[$user["role"]]);
    $this->entityManager->persist($newUser);
    $this->entityManager->flush();
  }

  private function _updateUser($user, $existing){
    $roles = $this->_getRoles();
    $existing->setUsername($user["name"]);
    $existing->setPassword($user["password"]);
    $existing->setEmail($user["email"]);
    $existing->setIsActive($user["active"]);
    $existing->setPermissions(array_keys($roles)[$user["role"]]);
    $this->entityManager->flush();
  }

  private function _getRoles(){
    $rolesParam = $this->container->getParameter("user_roles");
    $roles = [];
    foreach($rolesParam as $role){
      $roles[$role["name"]] = $role["id"];
    }
    return $roles;
  }

}
