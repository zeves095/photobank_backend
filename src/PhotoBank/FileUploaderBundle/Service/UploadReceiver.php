<?php

namespace App\PhotoBank\FileUploaderBundle\Service;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Filesystem\Filesystem;

class UploadReceiver
{
  protected $requestStack;

  public function __construct(RequestStack $requestStack)
  {
      $this->requestStack = $requestStack;
      $this->request = $this->requestStack->getCurrentRequest();
      $this->resumableVars = array(
        "resumableIdentifier"=>$this->request->query->get('resumableIdentifier'),
        "resumableFilename"=>$this->request->query->get('resumableFilename'),
        "resumableChunkNumber"=>$this->request->query->get('resumableChunkNumber'),
        "resumableChunkSize"=>$this->request->query->get('resumableChunkSize'),
        "resumableTotalSize"=>$this->request->query->get('resumableTotalSize'),
        "resumableTotalChunks"=>$this->request->query->get('resumableTotalChunks'),
      );
      $this->fileSystem = new Filesystem();
      $this->response = array(
        'completed' => false,
        'path' => '',
        'chunkPath' => '',
        'filename' => '',
      );
  }

  public function testChunks($uploadParams){
    $this->getOpts($uploadParams);
    return $this->handleChunkTest();
  }

  public function uploadChunks($uploadParams){
    $this->getOpts($uploadParams);
    return $this->handleChunkUpload();
  }

  private function getOpts($uploadParams){
    $this->itemId = $this->request->query->get('itemId');

    $splitId = array();
    for($i=0; $i<=strlen($this->itemId)/2; $i++){
      $splitId[] = substr($this->itemId, $i*2, 2);
    }
    $this->splitIdPath = implode('/',$splitId)."/";
    $this->destinationDir = $uploadParams['destination_dir'].$this->splitIdPath;
    $this->tempDir = $uploadParams['temp_dir'];

    $this->username = $uploadParams['username'];

    $filenameArr = explode(".",$this->resumableVars['resumableFilename']);
    $extension = sizeof($filenameArr)>1?end($filenameArr):"";
    $this->filename = $this->resumableVars['resumableIdentifier'].".".$extension;

    $this->partstring = '.part'.$this->resumableVars['resumableChunkNumber'];
    $this->tempChunkDir = $this->tempDir.$this->username.'/'.$this->resumableVars['resumableIdentifier'];
  }

  protected function handleChunkTest(){

    if ($this->request->getMethod() === 'GET') {

      if(null == $this->resumableVars['resumableIdentifier'] && trim($this->resumableVars['resumableIdentifier'])!=''){
        $this->resumableVars["resumableIdentifier"] = '';
      }
      //$this->tempChunkDir = $this->tempDir.$this->resumableVars['resumableIdentifier'];
      if(null == $this->resumableVars['resumableFilename'] && trim($this->resumableVars['resumableFilename'])!=''){
        $this->resumableVars["resumableFilename"] = '';
      }
      if(null == $this->resumableVars['resumableChunkNumber'] && trim($this->resumableVars['resumableChunkNumber'])!=''){
        $this->resumableVars["resumableChunkNumber"] = '';
      }

      $chunk_file = $this->tempChunkDir.'/'.$this->filename.$this->partstring;

      if (file_exists($chunk_file)) {
        return true;
        header("HTTP/1.0 200 Ok");
      } else {
        return false;
        header("HTTP/1.0 404 Not Found");
      }
    }
  }

  public function handleChunkUpload(){
    $fileArray = $this->request->files;
    if (!empty($fileArray)) foreach ($fileArray as $file) {
      if ($file->getError() != 0) {
        continue;
      }
      if(null!=$this->resumableVars['resumableIdentifier'] && trim($this->resumableVars['resumableIdentifier'])!=''){
        //$this->tempChunkDir = $this->tempDir.$this->resumableVars['resumableIdentifier'];
      }
      $dest_file = $this->filename.$this->partstring;
      if (!is_dir($this->tempChunkDir)) {
        $this->fileSystem->mkdir($this->tempChunkDir, 0777, true);
      }
      if ($file->move($this->tempChunkDir, $dest_file)) {
        $this->createFileFromChunks($this->tempChunkDir, $this->filename, $this->resumableVars['resumableChunkSize'], $this->resumableVars['resumableTotalSize'],$this->resumableVars['resumableTotalChunks']);
      }
    }
    return $this->response;
  }

  protected function createFileFromChunks($tempChunkDir, $fileName, $chunkSize, $totalSize, $total_files) {
    $total_files_on_server_size = 0;
    $temp_total = 0;
    foreach(scandir($tempChunkDir) as $file) {
      $temp_total = $total_files_on_server_size;
      $tempfilesize = filesize($tempChunkDir.'/'.$file);
      $total_files_on_server_size = $temp_total + $tempfilesize;
    }
    if ($total_files_on_server_size >= $totalSize) {
      $filepath = $this->destinationDir.$fileName;
      $this->fileSystem->mkdir($this->destinationDir);
      $this->fileSystem->dumpFile($filepath,'');
      for ($i=1; $i<=$total_files; $i++) {
        $this->fileSystem->appendToFile($filepath,file_get_contents($tempChunkDir.'/'.$fileName.'.part'.$i));
      }
      $this->response['completed'] = true;
      $this->response['chunkPath'] = $this->tempChunkDir;
      $this->response['path'] = $this->destinationDir.$fileName;
      $this->response['filename'] = $this->filename;
      $this->response['src_filename'] = $this->resumableVars['resumableFilename'];
      return $this->response;
    }
  }
}
