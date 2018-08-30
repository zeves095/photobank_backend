<?php
/**
  * Интерфейс поискового объекта
  */
namespace App\Entity\Search;
/**
  * Интерфейс поискового объекта
  */
interface SearchQueryInterface{

  /**
   * Получает список заданных полей поискового объекта
   */
  public function getFields();
  /**
   * Задает сразу несколько полей поискового объекта через массив [поле=>значение]
   * @param mixed[] $fields Массив задаваемых полей
   */
  public function setFields($fields);
  /**
   * Получает значение одного поля объекта по его ключу
   * @param string $key Ключ поля, значение которого нужно получить
   */
  public function getField($key);
  /**
   * Получает значение одного поля
   * @param string $key Ключ поля
   * @param string $vlaue Значение, которое нужно установить
   */
  public function setField($key,$vlaue);

}
