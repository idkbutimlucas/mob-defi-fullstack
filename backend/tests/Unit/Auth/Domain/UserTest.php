<?php

declare(strict_types=1);

namespace App\Tests\Unit\Auth\Domain;

use App\Auth\Domain\Model\User;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class UserTest extends TestCase
{
    #[Test]
    public function it_creates_user_with_valid_data(): void
    {
        $user = User::create(
            'uuid-123',
            'testuser',
            'test@example.com',
            'hashed_password'
        );

        $this->assertEquals('uuid-123', $user->id());
        $this->assertEquals('testuser', $user->getUsername());
        $this->assertEquals('test@example.com', $user->getEmail());
        $this->assertEquals('hashed_password', $user->getPassword());
    }

    #[Test]
    public function it_returns_username_as_user_identifier(): void
    {
        $user = User::create(
            'uuid-123',
            'myusername',
            'test@example.com',
            'password'
        );

        $this->assertEquals('myusername', $user->getUserIdentifier());
    }

    #[Test]
    public function it_has_role_user_by_default(): void
    {
        $user = User::create(
            'uuid-123',
            'testuser',
            'test@example.com',
            'password'
        );

        $roles = $user->getRoles();

        $this->assertContains('ROLE_USER', $roles);
    }

    #[Test]
    public function it_has_role_api_by_default(): void
    {
        $user = User::create(
            'uuid-123',
            'testuser',
            'test@example.com',
            'password'
        );

        $roles = $user->getRoles();

        $this->assertContains('ROLE_API', $roles);
    }

    #[Test]
    public function it_returns_unique_roles(): void
    {
        $user = User::create(
            'uuid-123',
            'testuser',
            'test@example.com',
            'password'
        );

        $roles = $user->getRoles();

        $this->assertEquals(count($roles), count(array_unique($roles)));
    }

    #[Test]
    public function it_has_created_at_timestamp(): void
    {
        $before = new \DateTimeImmutable();

        $user = User::create(
            'uuid-123',
            'testuser',
            'test@example.com',
            'password'
        );

        $after = new \DateTimeImmutable();

        $this->assertGreaterThanOrEqual($before, $user->createdAt());
        $this->assertLessThanOrEqual($after, $user->createdAt());
    }

    #[Test]
    public function erase_credentials_does_nothing(): void
    {
        $user = User::create(
            'uuid-123',
            'testuser',
            'test@example.com',
            'password'
        );

        $passwordBefore = $user->getPassword();

        $user->eraseCredentials();

        $this->assertEquals($passwordBefore, $user->getPassword());
    }
}
