<?php

namespace App\PhotoBank\FileUploaderBundle\Service;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ContainerInterface;

class UploadReceiver
{
  protected $requestStack;
  protected $ContainerInterface;
  protected $fileSystem;

  public function __construct(ContainerInterface $container, Filesystem $fileSystem)
  {
      $this->container = $container;
      $this->fileSystem = $fileSystem;
      $this->response = array(
        'completed' => false,
        'chunk_written' => false,
        'path' => '',
        'chunkPath' => '',
        'filename' => '',
        'filesize' => ''
      );
  }

  public function testChunks($uploadParams){
    $this->uploadParams = $uploadParams;
    if(null == $uploadParams['resumablevars']['resumableIdentifier'] && trim($uploadParams['resumablevars']['resumableIdentifier'])!=''){
      $uploadParams['resumablevars']["resumableIdentifier"] = '';
    }
    if(null == $uploadParams['resumablevars']['resumableFilename'] && trim($uploadParams['resumablevars']['resumableFilename'])!=''){
      $uploadParams['resumablevars']["resumableFilename"] = '';
    }
    if(null == $uploadParams['resumablevars']['resumableChunkNumber'] && trim($uploadParams['resumablevars']['resumableChunkNumber'])!=''){
      $uploadParams['resumablevars']["resumableChunkNumber"] = '';
    }
    if (file_exists($uploadParams['tempchunkdir'].'/'.$uploadParams['filename'].$uploadParams['partstring'])) {
      if($total_files_on_server_size >= $this->uploadParams['resumablevars']['resumableTotalSize']){
        $this->compileFile();
      }
      return true;
    } else {
      return false;
    }
  }

  public function uploadChunks($uploadParams){
    $this->uploadParams = $uploadParams;
    if (!empty($uploadParams['files'])) foreach ($uploadParams['files'] as $file) {
      if ($file->getError() != 0) {
        continue;
      }
      if(null!=$uploadParams['resumablevars']['resumableIdentifier'] && trim($uploadParams['resumablevars']['resumableIdentifier'])!=''){
        //$uploadParams['tempchunkdir'] = $this->tempDir.$uploadParams['resumablevars']['resumableIdentifier'];
      }
      $dest_file = $uploadParams['filename'].$uploadParams['partstring'];
      if (!is_dir($uploadParams['tempchunkdir'])) {
        $this->fileSystem->mkdir($uploadParams['tempchunkdir'], 0777, true);
      }
      if ($file->move($uploadParams['tempchunkdir'], $dest_file)) {
        $this->response['chunk_written'] = true;
        $this->response['src_filename'] = $uploadParams['resumablevars']['resumableFilename'];
        $this->response['chunkPath'] = $uploadParams['tempchunkdir'];
        $this->response['path'] = $uploadParams['tempchunkdir'].'/'.$uploadParams['filename'];
        $this->response['filename'] = $uploadParams['filename'];
        $this->response['filesize'] = $uploadParams['resumablevars']['resumableTotalSize'];
        $this->processUploadedChunk();
      }
    }
    return $this->response;
  }

  protected function processUploadedChunk() {
    $total_files_on_server_size = 0;
    $temp_total = 0;
    foreach(scandir($this->uploadParams['tempchunkdir']) as $file) {
      $temp_total = $total_files_on_server_size;
      $tempfilesize = filesize($this->uploadParams['tempchunkdir'].'/'.$file);
      $total_files_on_server_size = $temp_total + $tempfilesize;
    }
    if ($total_files_on_server_size >= $this->uploadParams['resumablevars']['resumableTotalSize']) {
      $this->compileFile();
    }
  }

  protected function compileFile(){
    $filepath = $this->uploadParams['tempchunkdir'].'/'.$this->uploadParams['filename'];
    $this->fileSystem->dumpFile($filepath,'');
    for ($i=1; $i<=$this->uploadParams['resumablevars']['resumableTotalChunks']; $i++) {
      $this->fileSystem->appendToFile($filepath,file_get_contents($this->uploadParams['tempchunkdir'].'/'.$this->uploadParams['filename'].'.part'.$i));
    }
    $this->response['completed'] = true;
    return $this->response;
  }

  public function validateUpload($uploadParams){
    $allowedFiletypes = explode(',',$this->container->getParameter('fileuploader.allowedfiletypes'));
    if(in_array(strtolower($uploadParams['extension']), $allowedFiletypes)){
      return true;
    }
    return false;
  }

}
