<?php

declare(strict_types=1);

namespace App\Auth\Domain\Repository;

use App\Auth\Domain\Model\User;

interface UserRepositoryInterface
{
    public function save(User $user): void;

    public function findByUsername(string $username): ?User;

    public function findByEmail(string $email): ?User;

    public function existsByUsername(string $username): bool;

    public function existsByEmail(string $email): bool;
}
