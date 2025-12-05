<?php

declare(strict_types=1);

namespace App\Auth\Infrastructure\Persistence;

use App\Auth\Domain\Model\User;
use App\Auth\Domain\Repository\UserRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

/**
 * @implements UserProviderInterface<User>
 */
class DoctrineUserRepository implements UserRepositoryInterface, UserProviderInterface, PasswordUpgraderInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    public function save(User $user): void
    {
        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    public function findByUsername(string $username): ?User
    {
        return $this->entityManager
            ->getRepository(User::class)
            ->findOneBy(['username' => $username]);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->entityManager
            ->getRepository(User::class)
            ->findOneBy(['email' => $email]);
    }

    public function existsByUsername(string $username): bool
    {
        return $this->findByUsername($username) !== null;
    }

    public function existsByEmail(string $email): bool
    {
        return $this->findByEmail($email) !== null;
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        $user = $this->findByUsername($identifier);

        if ($user === null) {
            throw new UserNotFoundException(sprintf('User "%s" not found.', $identifier));
        }

        return $user;
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Invalid user class "%s".', get_class($user)));
        }

        $refreshedUser = $this->findByUsername($user->getUserIdentifier());

        if ($refreshedUser === null) {
            throw new UserNotFoundException(sprintf('User "%s" not found.', $user->getUserIdentifier()));
        }

        return $refreshedUser;
    }

    public function supportsClass(string $class): bool
    {
        return $class === User::class || is_subclass_of($class, User::class);
    }

    public function upgradePassword(PasswordAuthenticatedUserInterface $user, string $newHashedPassword): void
    {
        // This method is called when a password needs to be upgraded (rehashed)
        // For now, we don't implement password upgrades
    }
}
