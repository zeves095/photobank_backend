<?php

namespace App\Service\Search;

use App\Entity\Search\ItemQueryObject;
use Symfony\Component\HttpFoundation\Request;

class SearchQueryBuilder {

  public function makeItemQuery(Request $request){
    $query = $request->query;
    $queryObject = new ItemQueryObject();
    foreach($query as $key=>$value){
      if($key == "code"){
        preg_match_all("/[0-9]{1,11}/", $value, $value);
        $value = $value[0];
      }
      $queryObject->setField($key, $value);
    }
    return $queryObject;
  }

}
