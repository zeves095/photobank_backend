<?php
/**
 * Сервис для генерации объекта поиска
 */
namespace App\Service\Search;

use App\Entity\Search\ItemQueryObject;
use App\Entity\Search\ResourceQueryObject;
use Symfony\Component\HttpFoundation\Request;
/**
 * Сервис для генерации объекта поиска
 */
class SearchQueryBuilder {

  /**
   * Создает объект поиска товаров каталога
   * @param  Request $request Объект текущего http-запроса
   * @return ItemQueryObject Полученный объект поиска
   */
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
      if($key == "article"){
        $value = str_replace(' ','', $value);
        $value = explode(",", $value);
      }
      if(in_array($key, $fields)){
        $queryObject->setField($key, $value);
      }
    }
    return $queryObject;
  }
  /**
   * Создает объект поиска ресурсов
   * @param  Request $request Объект текущего http-запроса
   * @return ResourceQueryObject Полученный объект поиска
   */
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
