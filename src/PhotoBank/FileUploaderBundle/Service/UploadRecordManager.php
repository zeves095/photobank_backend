<?php

namespace App\PhotoBank\FileUploaderBundle\Service;
use Symfony\Component\Filesystem\Filesystem;
use Doctrine\ORM\EntityManagerInterface;
use App\PhotoBank\FileUploaderBundle\Entity\Upload;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class UploadRecordManager
{

  private $entityManager;
  private $token;

  public function __construct(EntityManagerInterface $entityManager,TokenStorageInterface $token){
    $this->entityManager = $entityManager;
    $this->token = $token;
  }

  public function insert($uploads){
    for($i = 0; $i<sizeof($uploads); $i++ ){
      $upload = new Upload();
      $upload->setUsername($this->token->getToken()->getUser()->getUsername());
      $upload->setCompleted(false);
      $upload->setFileHash($uploads[$i]['filehash']);
      $upload->setFilename($uploads[$i]['filename']);
      $upload->setItemId($uploads[$i]['itemid']);
      $upload->setTotalChunks($uploads[$i]['totalchuks']);
      $upload->setCompletedChunks(0);

      if(sizeof($this->entityManager
      ->getRepository(Upload::class)
      ->findBy([
        'username' => $upload->getUsername(),
        'file_hash' => $upload->getFileHash(),
        'item_id' => $upload->getItemId()
      ]))==0){
        $this->entityManager->persist($upload);
        $this->entityManager->flush($upload);
      }
    }
  }

  public function update($event){
    $uploads = $this->entityManager
    ->getRepository(Upload::class)
    ->findBy(
      ['username' => $event->getParams()['username'],
      'filename' => $event->getParams()['filename'],
      'item_id' => $event->getParams()['itemId']],
      ['id' => 'DESC']
    );
    //$upload = $uploads[0];
    foreach($uploads as $upload){
      $completed = $upload->getCompletedChunks();
      $upload->setCompletedChunks($completed+1);
      if($upload->getTotalChunks()==$completed+1){
        $upload->setCompleted(true);
      }
      $this->entityManager->persist($upload);
      $this->entityManager->flush($upload);
    }
  }

  public function get(){
    $uploadArr = array();
    $uploads = $this->entityManager
    ->getRepository(Upload::class)
    ->findBy(
      ['username' => $this->token->getToken()->getUser()->getUsername(),
      'completed' => false],
      ['id' => 'ASC']
    );
    foreach($uploads as $upload){
      $uploadArr[] = array($upload->getItemId(),$upload->getFileName(),$upload->getFileHash());
    }
    return $uploadArr;
  }
}