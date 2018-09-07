<?php

namespace App\PhotoBank\FileUploaderBundle\Service;
use Symfony\Component\Filesystem\Filesystem;

class UploadReceiver
{
  protected $requestStack;

  public function __construct()
  {
      $this->fileSystem = new Filesystem();
      $this->response = array(
        'completed' => false,
        'path' => '',
        'chunkPath' => '',
        'filename' => '',
      );
  }

  public function testChunks($uploadParams){
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
      return true;
      header("HTTP/1.0 200 Ok");
    } else {
      return false;
      header("HTTP/1.0 404 Not Found");
    }
  }

  public function uploadChunks($uploadParams){
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
        $this->createFileFromChunks($uploadParams);
      }
    }
    return $this->response;
  }

  protected function createFileFromChunks($uploadParams) {
    $total_files_on_server_size = 0;
    $temp_total = 0;
    foreach(scandir($uploadParams['tempchunkdir']) as $file) {
      $temp_total = $total_files_on_server_size;
      $tempfilesize = filesize($uploadParams['tempchunkdir'].'/'.$file);
      $total_files_on_server_size = $temp_total + $tempfilesize;
    }
    if ($total_files_on_server_size >= $uploadParams['resumablevars']['resumableTotalSize']) {
      $filepath = $uploadParams['destinationdir'].$uploadParams['filename'];
      $this->fileSystem->mkdir($uploadParams['destinationdir']);
      $this->fileSystem->dumpFile($filepath,'');
      for ($i=1; $i<=$uploadParams['resumablevars']['resumableTotalChunks']; $i++) {
        $this->fileSystem->appendToFile($filepath,file_get_contents($uploadParams['tempchunkdir'].'/'.$uploadParams['filename'].'.part'.$i));
      }
      $this->response['completed'] = true;
      $this->response['chunkPath'] = $uploadParams['tempchunkdir'];
      $this->response['path'] = $uploadParams['destinationdir'].$uploadParams['filename'];
      $this->response['filename'] = $uploadParams['filename'];
      $this->response['src_filename'] = $uploadParams['resumablevars']['resumableFilename'];
      return $this->response;
    }
  }
}
