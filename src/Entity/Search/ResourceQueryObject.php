<?php

namespace App\Entity\Search;

use App\Entity\Search\SearchQueryInterface;

class ResourceQueryObject implements SearchQueryInterface{

  private $_searchFields = [
    "item_query"=>null,
    "id"=>"",
    "preset"=>"",
    "type"=>"",
  ];

  private $_entityType = "App\Entity\Resource";

  public function getType(){
    return $this->_entityType;
  }

  public function getFields(){
    return $this->_searchFields;
  }

  public function setFields($fields){
    if(sizeof(array_intersect($this->_searchFields, $fields)) == sizeof($this->_searchFields)){
      $this->_searchFields = $fields;
    }
  }

  public function getField($key){
    if(!array_key_exists($key,$this->_searchFields)){return false;}
    return $this->_searchFields[$key];
  }

  public function setField($key, $value){
    if(!array_key_exists($key,$this->_searchFields)){return false;}
    $this->_searchFields[$key] = $value;
  }

}