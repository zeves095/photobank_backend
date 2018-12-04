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

  public function __construct(EntityManagerInterface $entityManager, ContainerInterface $container, Filesystem $fileSystem){
    $this->entityManager = $entityManager;
    $this->container = $container;
    $this->fileSystem = $fileSystem;
  }

  public function createLink($params)
  {
    $link = new Link();

    $createdOn = date_create();

    $user_id = $params['created_by']->getId();
    $hash = $this->_generateHash($user_id, date_format($createdOn, 'U'));
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
    ;

    $this->entityManager->persist($link);
    $this->entityManager->flush();

    return $link;
  }

  public function updateLink($params){
    $link = $this->entityManager->getRepository(Link::class)->findOneBy([
      'id'=>$params['id']
    ]);
    $link->setPath($params['path'])
    ->setSizePx($params['size_px'])
    ->setSizeBytes($params['size_bytes']);
    $this->entityManager->flush();
  }

  private function _generateHash()
  {
    $src_string = implode('', func_get_args());
    return md5($src_string);
  }

  public function getImageData($hash, $request)
  {
    $link = $this->entityManager->getRepository(Link::class)->findOneBy([
      'hash'=>$hash
    ]);

    if(!$this->_checkAccess($link, $request)){
      throw new HttpException(403);
    }
    if(!$this->_countRequests($link) || !$this->_isNotExpired($link))
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

  private function _checkAccess($link, $request){
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

  private function _countRequests($link){
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

  public function fetchAllForUser($user){
    $links = $this->entityManager->getRepository(Link::class)->findBy([
      'created_by'=>$user->getId()
    ]);
    return $links;
  }


}
