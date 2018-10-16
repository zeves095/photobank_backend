<?php

namespace App\Service\Search;

use App\Entity\Search\ItemQueryObject;
use Symfony\Component\HttpFoundation\Request;

class SearchQueryBuilder {

  public function makeItemQuery(Request $request){
    $query = $request->query;
    $queryObject = new ItemQueryObject();
    foreach($query as $key=>$value){
      $queryObject->setField($key, $value);
    }
    return $queryObject;
  }

}
