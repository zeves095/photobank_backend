<?php
namespace App\Exception;

use Symfony\Component\Security\Core\Exception\AccountStatusException;

class DeadMountException extends RuntimeException
{
    public function getMessageKey()
    {
        return  "Target filesystem unresponsive";
    }
}
