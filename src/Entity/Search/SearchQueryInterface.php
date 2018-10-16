<?php

namespace App\Entity\Search;

interface SearchQueryInterface{

  public function getFields();
  public function setFields($fields);
  public function getField($key);
  public function setField($key,$vlaue);

}
