<?php

declare(strict_types=1);

namespace App\Analytics\Domain\Model;

use App\Shared\Domain\AnalyticCode;
use App\Shared\Domain\Distance;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

/**
 * Entity représentant un enregistrement de trajet pour les statistiques.
 * Utilisé pour agréger les distances par code analytique.
 */
#[ORM\Entity]
#[ORM\Table(name: 'route_records')]
#[ORM\Index(columns: ['created_at'], name: 'idx_route_records_created_at')]
#[ORM\Index(columns: ['analytic_code'], name: 'idx_route_records_analytic_code')]
class RouteRecord
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\Column(name: 'analytic_code', type: 'string', length: 50)]
    private string $analyticCode;

    #[ORM\Column(name: 'distance_km', type: 'float')]
    private float $distanceKm;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
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
