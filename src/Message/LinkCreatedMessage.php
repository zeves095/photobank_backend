<?php
namespace App\Message;

class LinkCreatedMessage
{
  public $linkId;
  public $linkHash;
  public $post;
  public $username;

  public function __construct($linkId, $linkHash, $username, $post)
  {
      $this->post = $post;
      $this->linkId = $linkId;
      $this->linkHash = $linkHash;
      $this->username = $username;
  }
}
