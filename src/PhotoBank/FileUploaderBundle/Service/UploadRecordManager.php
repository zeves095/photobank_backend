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

  public function insert($upload){
    $file = new Upload();
    $file->setUsername($this->token->getToken()->getUser()->getUsername());
    $file->setCompleted(false);
    $file->setFileHash($upload['filehash']);
    $file->setFilename($upload['filename']);
    $file->setItemId($upload['itemid']);
    $file->setTotalChunks($upload['totalchuks']);
    $file->setCompletedChunks(0);
    if(sizeof($this->entityManager
    ->getRepository(Upload::class)
    ->findBy([
      'username' => $file->getUsername(),
      'file_hash' => $file->getFileHash(),
      'item_id' => $file->getItemId()
    ]))==0){
      $this->entityManager->persist($file);
      $this->entityManager->flush($file);
    }
  }

  public function remove($upload){
    $toBeDeleted = $this->entityManager
    ->getRepository(Upload::class)
    ->findBy([
      'username' => $this->token->getToken()->getUser()->getUsername(),
      'file_hash' => $upload['filehash'],
      'item_id' => $upload['itemid']
    ]);
    for($i = 0; $i<sizeof($toBeDeleted); $i++ ){
      $this->entityManager->remove($toBeDeleted[$i]);
      $this->entityManager->flush();
    }
  }

  public function update($username, $filename, $itemId){
    $uploads = $this->entityManager
    ->getRepository(Upload::class)
    ->findBy(
      ['username' => $username,
      'filename' => $filename,
      'item_id' => $itemId],
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
