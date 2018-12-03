<?php

namespace App\Service\Search;

use App\Entity\Search\ItemQueryObject;
use App\Entity\Search\ResourceQueryObject;
use Symfony\Component\HttpFoundation\Request;

class SearchQueryBuilder {

  public function makeItemQuery(Request $request){
    $query = $request->query;
    $queryObject = new ItemQueryObject();
    $fields = array_keys($queryObject->getFields());
    foreach($query as $key=>$value){
      $key = str_replace("item_search_","",$key);
      if($key == "code"){
        preg_match_all("/[0-9]{1,11}/", $value, $value);
        $value = $value[0];
      }
      if(in_array($key, $fields)){
        $queryObject->setField($key, $value);
      }
    }
    return $queryObject;
  }

  public function makeResourceQuery(Request $request){
    $query = $request->query;
    $queryObject = new ResourceQueryObject();
    $fields = array_keys($queryObject->getFields());
    $item_query = $this->makeItemQuery($request);
    $queryObject->setField('item_query', $item_query);
    foreach($query as $key=>$value){
      $key = str_replace("resource_search_","",$key);
      if(in_array($key, $fields)){
        $queryObject->setField($key, $value);
      }
    }
    return $queryObject;
  }

}
