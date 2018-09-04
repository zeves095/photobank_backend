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
      );
      $this->destinationDir = "uploads/test/";
      $this->tempDir = "uploads/test/temp/";
      $this->fileSystem = new Filesystem();
  }

  public function testChunks(){
    try{return $this->handleChunkTest();}catch(Exception $e){
      //TODO handle exceptions
    }
  }

  public function uploadChunks(){
    try{return $this->handleChunkUpload();}catch(Exception $e){
      //TODO handle exceptions
    }
  }

  protected function handleChunkTest(){
    if ($this->request->getMethod() === 'GET') {
      if(null == $this->request->query->get('resumableIdentifier') && trim($this->request->query->get('resumableIdentifier'))!=''){
        $this->resumableVars["resumableIdentifier"] = '';
      }
      $temp_dir = $this->tempDir.$this->request->query->get('resumableIdentifier');
      if(null == $this->request->query->get('resumableFilename') && trim($this->request->query->get('resumableFilename'))!=''){
        $this->resumableVars["resumableFilename"] = '';
      }
      if(null == $this->request->query->get('resumableChunkNumber') && trim($this->request->query->get('resumableChunkNumber'))!=''){
        $this->resumableVars["resumableChunkNumber"] = '';
      }
      $chunk_file = $temp_dir.'/'.$this->resumableVars['resumableFilename'].'.part'.$this->resumableVars['resumableChunkNumber'];
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
        //TODO log maybe
        continue;
      }
      if(null!=$this->request->request->get('resumableIdentifier') && trim($this->request->request->get('resumableIdentifier'))!=''){
        $temp_dir = $this->tempDir.$this->request->request->get('resumableIdentifier');
      }
      //$dest_dir = $temp_dir.'/'.$this->request->request->get('resumableFilename').'.part'.$this->request->request->get('resumableChunkNumber');
      $dest_file = $this->request->request->get('resumableFilename').'.part'.$this->request->request->get('resumableChunkNumber');
      if (!is_dir($temp_dir)) {
        $this->fileSystem->mkdir($temp_dir, 0777, true);
      }
      if (!$file->move($temp_dir, $dest_file)) {

        //TODO log maybe
      } else {
        $this->createFileFromChunks($temp_dir, $this->request->request->get('resumableFilename'),$this->request->request->get('resumableChunkSize'), $this->request->request->get('resumableTotalSize'),$this->request->request->get('resumableTotalChunks'));
      }
    }
    return true;
  }

  protected function createFileFromChunks($temp_dir, $fileName, $chunkSize, $totalSize, $total_files) {
    $total_files_on_server_size = 0;
    $temp_total = 0;
    foreach(scandir($temp_dir) as $file) {
      $temp_total = $total_files_on_server_size;
      $tempfilesize = filesize($temp_dir.'/'.$file);
      $total_files_on_server_size = $temp_total + $tempfilesize;
    }
    if ($total_files_on_server_size >= $totalSize) {
      if (($fp = fopen($this->destinationDir.$fileName, 'w')) !== false) {
        for ($i=1; $i<=$total_files; $i++) {
          fwrite($fp, file_get_contents($temp_dir.'/'.$fileName.'.part'.$i));
        }
        fclose($fp);
      } else {
        return false;
      }
    }
  }
}
