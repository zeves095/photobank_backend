<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Link;
use App\Entity\Resource;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ContainerInterface;
use \Imagine\Imagick\Imagine;
use \Imagine\Image\Box;
use \Imagine\Image\ImageInterface;
use \Symfony\Component\HttpKernel\Exception\HttpException;

class LinkService{

  private $entityManager;
  private $container;
  private $fileSystem;

  public function __construct(EntityManagerInterface $entityManager, ContainerInterface $container, Filesystem $fileSystem)
  {
    $this->entityManager = $entityManager;
    $this->container = $container;
    $this->fileSystem = $fileSystem;
  }

  public function createLink($params)
  {
    $link = new Link();

    $createdOn = date_create();

    $user_id = $params['created_by']->getId();
    $hash = $this->_generateHash($user_id, date_format($createdOn, 'U'), rand());
    $external_url = $this->container->getParameter('link_url_prefix').'/'.$hash.".jpg";

    $expires = $params['expires_by']==""?NULL:date_create_from_format("Y-m-d", $params['expires_by']);
    //date_create_from_format('Y-m-d', $params['expires_by']);


    $link->setAccess($params['access'])
    ->setTarget($params['target'])
    ->setExpiresBy($expires)
    ->setComment($params['comment'])
    ->setMaxRequests($params['max_requests'])
    ->setCreatedBy($params['created_by'])
    ->setExternalUrl($external_url)
    ->setCreatedOn($createdOn)
    ->setActive(true)
    ->setReady(false)
    ->setDoneRequests(0)
    ->setHash($hash)
    ->setSrcId($params['resource'])
    ->setSymLink(true)
    ;

    $this->entityManager->persist($link);
    $this->entityManager->flush();

    return $link;
  }

  public function updateLink($params)
  {
    $link = $this->entityManager->getRepository(Link::class)->findOneBy([
      'id'=>$params['id']
    ]);
    if(array_search('path', array_keys($params)) !== false && $params['path'] !== ''){$link->setPath($params['path']);}
    if(array_search('size_px', array_keys($params)) !== false && $params['size_px'] !== ''){$link->setSizePx($params['size_px']);}
    if(array_search('size_bytes', array_keys($params)) !== false && $params['size_bytes'] !== ''){$link->setSizeBytes($params['size_bytes']);}
    if(array_search('max_requests', array_keys($params)) !== false && $params['max_requests'] !== ''){$link->setMaxRequests($params['max_requests']);}
    if(array_search('symlink', array_keys($params)) !== false && $params['symlink'] !== ''){$link->setSymLink($params['symlink']);}
    if(array_search('expires_by', array_keys($params)) !== false && $params['expires_by'] !== ''){$link->setExpiresBy($params['expires_by']);}
    if(array_search('target', array_keys($params)) !== false && $params['target'] !== ''){$link->setTarget($params['target']);}
    if(array_search('access', array_keys($params)) !== false && $params['access'] !== ''){$link->setAccess($params['access']);}
    if(array_search('comment', array_keys($params)) !== false && $params['comment'] !== ''){$link->setComment($params['comment']);}
    $link->setUpdatedOn(date_create());
    $this->entityManager->flush();
  }

  public function userIsOwner($link_id, $user_id)
  {
    $repo = $this->entityManager->getRepository(Link::class);
    $link = $repo->findOneBy([
      "id"=>$link_id
    ]);
    if($link->getCreatedBy()->getId() === $user_id){
      return true;
    }
    return false;
  }

  private function _generateHash()
  {
    $src_string = implode('', func_get_args());
    return md5($src_string);
  }

  public function getImageData($hash, $request, $user)
  {
    $link = $this->entityManager->getRepository(Link::class)->findOneBy([
      'hash'=>$hash
    ]);
    $user_id = $user->getId();
    $created_by = $link->getCreatedBy()->getId();
    if($created_by!=$user_id && !$this->_checkAccess($link, $request)){
      throw new HttpException(403);
    }
    if($created_by!=$user_id && (!$this->_countRequests($link) || !$this->_isNotExpired($link)))
    {
      throw new HttpException(410);
    }

    $path = $this->container->getParameter('local_file_dir').$link->getPath();
    $image = file_get_contents($path);
    $filename = $link->getHash().'.jpg';
    return [
        'filename'=>$filename,
        'content'=>$image
    ];
  }

  private function _isNotExpired($link)
  {
    $currentDate = date_create();
    $expiresBy = $link->getExpiresBy();
    if($expiresBy == NULL){
      return true;
    }
    if($currentDate>=$expiresBy){
      return false;
    }
    return true;
  }

  private function _checkAccess($link, $request)
  {
    $access = $link->getAccess();
    if($access == NULL){
      return true;
    }
    preg_match('/\b(?:\d{1,3}\.){3}\d{1,3}\b/', $access, $ip_addresses);
    if(in_array($request->getClientIp(), $ip_addresses)){
        return true;
    }
    return false;
  }

  private function _countRequests($link)
  {
    $doneRequests = $link->getDoneRequests();
    $maxRequests = $link->getMaxRequests();
    if($maxRequests== NULL){
      return true;
    }
    if($doneRequests>=$maxRequests){return false;}
    $link->setDoneRequests($doneRequests+1);
    $this->entityManager->flush();
    return true;
  }

  public function fetchAllForUser($user)
  {
    $links = $this->entityManager->getRepository(Link::class)->findBy([
      'created_by'=>$user->getId()
    ]);
    return $links;
  }

  public function fetchAllWithExtraFields($user)
  {
    $links = $this->entityManager->getRepository(Link::class)->fetchWithResourceAndItemInfo($user->getId());
    return $links;
  }

  public function deleteLink($link, $user)
  {
    $link = $this->entityManager->getRepository(Link::class)->findOneBy([
      'id'=>$link
    ]);
    if($link == null){return false;}
    if($link->getCreatedBy()->getId() !== $user){return false;}
    if($link->getSymlink() == 0){
      if(preg_match('/\.jpg$/',$link->getPath())){
        $this->fileSystem->remove($link->getPath());
      }else{
        throw new HttpException(500);
      }
    }
    $this->entityManager->remove($link);
    $this->entityManager->flush();
    return true;
  }

  public function getUrls($ids){
    if(!is_array($ids)){
      $ids = explode(",", $ids);
    }
    $repo = $this->entityManager->getRepository(Link::class);
    $urls = array();
    foreach($ids as $id){
      $link = $repo->findOneBy([
        'id'=>$id
      ]);
      array_push($urls, 'https://photobank.domfarfora.ru'.$link->getExternalUrl());
    }
    $urls = implode($urls, "\n");
    return $urls;
  }

  public function validateForm($data){
    if(isset($data['resource'])){
      $resourceIds = explode(',',$data['resource']);
    }else{
        return [false, 'Необходимо указать ресурс'];
    }
    $sizeIsSet = isset($data['size']['width']) && isset($data['size']['height']);
    if($sizeIsSet){
      $sizeWithinBounds = ($data['size']['width']>=32&&$data['size']['height']>=32&&$data['size']['width']<=4096&&$data['size']['height']<=2160);
      $ratioOk = $sizeWithinBounds&&($data['size']['width']/$data['size']['height'] <= 2.3 && $data['size']['width']/$data['size']['height'] >= 1);
      if(!$ratioOk){
        return [false, "Неверное соотношение высоты/ширины"];
      }
    }elseif(isset($data['size']['width'])||isset($data['size']['height'])){
      return [false, "Указано только одно из значений ширина/высота"];
    }
    return [true, ""];
  }

}
