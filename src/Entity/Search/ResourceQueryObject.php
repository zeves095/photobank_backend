<?php
/**
  * Объект поиска сущностей типа "Resource"
  */
namespace App\Entity\Search;

use App\Entity\Search\SearchQueryInterface;
/**
  * Объект поиска сущностей типа "Resource"
  */
class ResourceQueryObject implements SearchQueryInterface{
  /**
    * Поля для поиска
    */
  private $_searchFields = [
    "item_query"=>null,
    "id"=>"",
    "preset"=>"",
    "type"=>"",
  ];

  /**
    * Название класса, по которому проводится поиск
    */
  private $_entityType = "App\Entity\Resource";

  /**
    * Метод для получения класса искомого объекта
    *
    * @return string название класса
    */
  public function getType(){
    return $this->_entityType;
  }

  /**
    * Метод для полчения полей поиска
    *
    * @return string[] поля объекта
    */
  public function getFields(){
    return $this->_searchFields;
  }

  /**
    * Метод для установки полей
    *
    * @param mixed[] $fields Массив значений [ключ=>значение]
    */
  public function setFields($fields){
    if(sizeof(array_intersect($this->_searchFields, $fields)) == sizeof($this->_searchFields)){
      $this->_searchFields = $fields;
    }
  }

  /**
    * Метод для получения одного поля по его ключу
    *
    * @param string $key Ключ поля, которое необходимо получить
    *
    * @return string Значение поля объекта
    */
  public function getField($key){
    if(!array_key_exists($key,$this->_searchFields)){return false;}
    return $this->_searchFields[$key];
  }

  /**
    * Метод для установки одного поля по ключу
    *
    * @param string $key Ключ для установки поля
    * @param string $value Значение для установки поля
    */
  public function setField($key, $value){
    if(!array_key_exists($key,$this->_searchFields)){return false;}
    $this->_searchFields[$key] = $value;
  }

}
