<?php
namespace App\Message;

class LinkCreatedMessage
{
  public $linkId;
  public $linkHash;
  public $resource;
  public $custom_size;
  public $username;

  public function __construct($linkId, $linkHash, $username, $resource, $custom_size)
  {
      $this->resource = $resource;
      $this->custom_size = $custom_size;
      $this->linkId = $linkId;
      $this->linkHash = $linkHash;
      $this->username = $username;
  }
}
