<?php

declare(strict_types=1);

namespace App\Routing\Domain\Model;

use App\Shared\Domain\AnalyticCode;
use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;
use DateTimeImmutable;
use Symfony\Component\Uid\Uuid;

/**
 * Entity représentant un trajet calculé.
 * Contient les informations du trajet : départ, arrivée, chemin, distance et code analytique.
 */
class Route
{
    private string $id;
    private string $fromStationId;
    private string $toStationId;
    private string $analyticCode;
    private float $distanceKm;
    /** @var string[] */
    private array $path;
    /** @var float[] */
    private array $segmentDistances;
    private DateTimeImmutable $createdAt;

    /**
     * @param string[] $path
     * @param float[] $segmentDistances
     */
    private function __construct(
        string $id,
        StationId $from,
        StationId $to,
        AnalyticCode $analyticCode,
        Distance $distance,
        array $path,
        array $segmentDistances,
        DateTimeImmutable $createdAt
    ) {
        $this->id = $id;
        $this->fromStationId = $from->value();
        $this->toStationId = $to->value();
        $this->analyticCode = $analyticCode->value();
        $this->distanceKm = $distance->value();
        $this->path = $path;
        $this->segmentDistances = $segmentDistances;
        $this->createdAt = $createdAt;
    }

    public static function create(
        StationId $from,
        StationId $to,
        AnalyticCode $analyticCode,
        Path $calculatedPath
    ): self {
        return new self(
            Uuid::v4()->toRfc4122(),
            $from,
            $to,
            $analyticCode,
            $calculatedPath->totalDistance(),
            $calculatedPath->stationIds(),
            $calculatedPath->segmentDistances(),
            new DateTimeImmutable()
        );
    }

    public function id(): string
    {
        return $this->id;
    }

    public function fromStationId(): StationId
    {
        return StationId::fromString($this->fromStationId);
    }

    public function toStationId(): StationId
    {
        return StationId::fromString($this->toStationId);
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

    /**
     * @return string[]
     */
    public function path(): array
    {
        return $this->path;
    }

    /**
     * @return float[]
     */
    public function segmentDistances(): array
    {
        return $this->segmentDistances;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * Convertit l'entité en tableau pour la sérialisation JSON.
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'fromStationId' => $this->fromStationId,
            'toStationId' => $this->toStationId,
            'analyticCode' => $this->analyticCode,
            'distanceKm' => $this->distanceKm,
            'path' => $this->path,
            'segmentDistances' => $this->segmentDistances,
            'createdAt' => $this->createdAt->format(DateTimeImmutable::ATOM),
        ];
    }
}
