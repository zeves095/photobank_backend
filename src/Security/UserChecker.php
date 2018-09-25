<?php
namespace App\Security;

use App\Exception\AccountBlockedException;
use App\Entity\Security\User as AppUser;
// use App\Exception\AccountExpiredException;
use Symfony\Component\Security\Core\Exception\AccountExpiredException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user)
    {
        if (!$user instanceof AppUser) {
            return;
        }

        if (!$user->getIsActive()) {
            throw new AccountBlockedException('account is blocked');
        }
    }

    public function checkPostAuth(UserInterface $user)
    {
        if (!$user instanceof AppUser) {
            return;
        }

        if (!$user->isAccountNonExpired()) {
            throw new AccountExpiredException('account is expired');
        }
    }
}
