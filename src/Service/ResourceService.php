<?php

namespace App\Service;

class ResourceService{

  public function generatePath($itemId){
    $splitId = array();
    for($i=0; $i<=strlen($itemId)/2; $i++){
      $splitId[] = substr($itemId, $i*2, 2);
    }
    $splitIdPath = implode('/',$splitId)."/";

    return $splitIdPath;
  }


}
