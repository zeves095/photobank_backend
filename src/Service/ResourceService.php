<?php

namespace App\Service;

class ResourceService{

  public function generatePath($item_code){
    $splitId = array();
    for($i=0; $i<=strlen($item_code)/2; $i++){
      $splitId[] = substr($item_code, $i*2, 2);
    }
    $splitIdPath = "/".implode('/',$splitId)."/";

    return $splitIdPath;
  }


}
