<?php
namespace App\Message;

class LinkDeletedMessage
{
  public $linkId;
  public $user;

  public function __construct($linkId, $user)
  {
      $this->linkId = $linkId;
      $this->user = $user;
  }
}
