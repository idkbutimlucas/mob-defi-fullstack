<?php

declare(strict_types=1);

namespace App\Analytics\Domain\Model;

use App\Shared\Domain\AnalyticCode;
use App\Shared\Domain\Distance;
use DateTimeImmutable;

/**
 * Entity représentant un enregistrement de trajet pour les statistiques.
 * Utilisé pour agréger les distances par code analytique.
 */
class RouteRecord
{
    private string $id;
    private string $analyticCode;
    private float $distanceKm;
    private DateTimeImmutable $createdAt;

    private function __construct(
        string $id,
        AnalyticCode $analyticCode,
        Distance $distance,
        DateTimeImmutable $createdAt
    ) {
        $this->id = $id;
        $this->analyticCode = $analyticCode->value();
        $this->distanceKm = $distance->value();
        $this->createdAt = $createdAt;
    }

    public static function create(
        string $id,
        AnalyticCode $analyticCode,
        Distance $distance,
        DateTimeImmutable $createdAt
    ): self {
        return new self($id, $analyticCode, $distance, $createdAt);
    }

    public function id(): string
    {
        return $this->id;
    }

    public function analyticCode(): AnalyticCode
    {
        return AnalyticCode::fromString($this->analyticCode);
    }

    public function distance(): Distance
    {
        return Distance::fromKilometers($this->distanceKm);
    }

    public function distanceKm(): float
    {
        return $this->distanceKm;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }
}
