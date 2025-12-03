<?php

declare(strict_types=1);

namespace App\Routing\Domain\Repository;

use App\Routing\Domain\Model\Route;

/**
 * Interface du repository pour la persistance des trajets.
 */
interface RouteRepositoryInterface
{
    /**
     * Persiste un trajet.
     */
    public function save(Route $route): void;

    /**
     * Trouve un trajet par son identifiant.
     */
    public function findById(string $id): ?Route;

    /**
     * Retourne tous les trajets.
     * @return Route[]
     */
    public function findAll(): array;
}
