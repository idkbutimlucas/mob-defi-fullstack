<?php

declare(strict_types=1);

namespace App\Auth\Domain\Model;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
#[ORM\UniqueConstraint(name: 'uniq_users_username', columns: ['username'])]
#[ORM\UniqueConstraint(name: 'uniq_users_email', columns: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\Column(type: 'string', length: 50, unique: true)]
    private string $username;

    #[ORM\Column(type: 'string', length: 180, unique: true)]
    private string $email;

    #[ORM\Column(type: 'string')]
    private string $password;

    /** @var array<string> */
    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    private function __construct(
        string $id,
        string $username,
        string $email,
        string $hashedPassword
    ) {
        $this->id = $id;
        $this->username = $username;
        $this->email = $email;
        $this->password = $hashedPassword;
        $this->roles = ['ROLE_API'];
        $this->createdAt = new \DateTimeImmutable();
    }

    public static function create(
        string $id,
        string $username,
        string $email,
        string $hashedPassword
    ): self {
        return new self($id, $username, $email, $hashedPassword);
    }

    public function id(): string
    {
        return $this->id;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    /** @return non-empty-string */
    public function getUserIdentifier(): string
    {
        assert($this->username !== '', 'Username cannot be empty');

        return $this->username;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    /** @return array<string> */
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function eraseCredentials(): void
    {
        // No sensitive data to erase
    }

    public function createdAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
