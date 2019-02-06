<?php
/**
  * Сервис для создания, обновления, удаления и получения информации по объектам типа "User"
  */

namespace App\Service;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Security\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Service\UserService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use App\Exception\InvalidUserDataException;
/**
  * Сервис для создания, обновления, удаления и получения информации по объектам типа "User"
  */
class UserService{

  /**
  * Инструмент работы с сущностями Doctrine ORM
  */
private $entityManager;
  /**
  * Сервис-контейнер Symfony
  */
private $container;

/**
  * Конструктор класса
  *
  * @param EntityManagerInterface $entityManager Для создания и обновления сущностей в базе данных
  * @param ContainerInterface $container Для получения параметров конфигурации
  */
  public function __construct(
      EntityManagerInterface $entityManager,
      ContainerInterface $container)
  {
    $this->entityManager = $entityManager;
    $this->container = $container;
  }

  /**
    * Получает всех пользователей, кроме находящихся в группе ROLE_SUPER_ADMIN. Этих пользователей следует редактировать напрямую в базе
    *
    * @return mixed[] $responseArr Массив объектов пользователей
    *
    * TODO использовать нормализатор
    */
  public function getUsers(){

    $roles = $this->_getRoles();

    $users = $this->entityManager->getRepository(User::class)->findAll();
    $responseArr = [];

    for($i = 0; $i<sizeof($users); $i++){
      if($users[$i]->getPermissions() == "ROLE_SUPER_ADMIN"){continue;}
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


  /**
    * Обновляет существующего пользователя, либо создает нового, если пользователя с данным id нет в базе
    *
    * @param mixed[] $user Массив полей для обновления/создания пользователя. Обязателен id
    *
    */
  public function setUser($user){
    $existing = $this->entityManager->getRepository(User::class)->findOneBy(["id"=>$user["id"]]);
    if($existing){
      $this->_updateUser($user, $existing);
    } else{
      $this->_createUser($user);
    }
  }

  /**
    * Создает нового пользователя и сохраняет его в базу данных
    *
    * @param mixed[] $user Массив полей для создания пользователя. Обязателен id
    *
    */
  private function _createUser($user){
    $roles = $this->_getRoles();
    if(!in_array($user["role"], $roles) || $user["role"]==0){
      var_dump([$user,$roles]);
      throw new InvalidUserDataException("Неверные данные пользователя");
    }
    $newUser = new User();
    $newUser->setUsername($user["name"]);
    $newUser->setPassword($user["password"]);
    $newUser->setEmail($user["email"]);
    $newUser->setIsActive($user["active"]);
    $newUser->setPermissions(array_keys($roles)[$user["role"]]);
    $this->entityManager->persist($newUser);
    $this->entityManager->flush();
  }

  /**
    * Обновляет запись пользователя, если он не находится в группе ROLE_SUPER_ADMIN
    *
    * @param mixed[] $user Массив полей для обновления пользователя. Обязателен id
    * @param User $existing Объект обновляемого пользователя
    *
    */
  private function _updateUser($user, $existing){
    $roles = $this->_getRoles();
    if(!in_array($user["role"], $roles) || $user["role"]==0){
      //var_dump([$user,$roles]);
      throw new InvalidUserDataException("Неверные данные пользователя");
    }
    $existing->setUsername($user["name"]);
    $existing->setPassword($user["password"]);
    $existing->setEmail($user["email"]);
    $existing->setIsActive($user["active"]);
    $existing->setPermissions(array_keys($roles)[$user["role"]]);
    $this->entityManager->flush();
  }

  /**
    * Получет возможные роли пользователей из контейнера
    *
    * @return mixed[] $roles Массив возможных ролей пользователей
    */
  private function _getRoles(){
    $rolesParam = $this->container->getParameter("user_roles");
    $roles = [];
    foreach($rolesParam as $role){
      $roles[$role["name"]] = $role["id"];
    }
    return $roles;
  }

}
