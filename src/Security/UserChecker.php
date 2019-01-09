<?php
/**
 * Выполняет проверку на предмет того, можно ли авторизовать пользователя
 */
namespace App\Security;

use App\Exception\AccountBlockedException;
use App\Entity\Security\User as AppUser;
// use App\Exception\AccountExpiredException;
use Symfony\Component\Security\Core\Exception\AccountExpiredException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
/**
 * Выполняет проверку на предмет того, можно ли авторизовать пользователя
 */
class UserChecker implements UserCheckerInterface
{
    /**
     * Выполняет проверку до факта аутентификации
     * @param  UserInterface $user Пользователь, для которого выполняется проверка
     */
    public function checkPreAuth(UserInterface $user)
    {
        if (!$user instanceof AppUser) {
            return;
        }

        if (!$user->getIsActive()) {
            throw new AccountBlockedException('account is blocked');
        }
    }

    /**
     * Выполняет проверку после факта аутентификации
     * @param  UserInterface $user Пользователь, для которого выполняется проверка
     */
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
