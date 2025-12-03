<?php

declare(strict_types=1);

namespace App\Analytics\Domain\Model;

use App\Shared\Domain\AnalyticCode;
use App\Shared\Domain\Distance;
use DateTimeImmutable;

/**
 * Value Object représentant une agrégation de distances par code analytique.
 */
final readonly class DistanceAggregate
{
    public function __construct(
        private AnalyticCode $analyticCode,
        private Distance $totalDistance,
        private ?DateTimeImmutable $periodStart,
        private ?DateTimeImmutable $periodEnd,
        private ?string $group
    ) {
    }

    public static function create(
        AnalyticCode $analyticCode,
        Distance $totalDistance,
        ?DateTimeImmutable $periodStart = null,
        ?DateTimeImmutable $periodEnd = null,
        ?string $group = null
    ): self {
        return new self($analyticCode, $totalDistance, $periodStart, $periodEnd, $group);
    }

    public function analyticCode(): AnalyticCode
    {
        return $this->analyticCode;
    }

    public function totalDistance(): Distance
    {
        return $this->totalDistance;
    }

    public function periodStart(): ?DateTimeImmutable
    {
        return $this->periodStart;
    }

    public function periodEnd(): ?DateTimeImmutable
    {
        return $this->periodEnd;
    }

    public function group(): ?string
    {
        return $this->group;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $result = [
            'analyticCode' => $this->analyticCode->value(),
            'totalDistanceKm' => $this->totalDistance->value(),
        ];

        if ($this->periodStart !== null) {
            $result['periodStart'] = $this->periodStart->format('Y-m-d');
        }

        if ($this->periodEnd !== null) {
            $result['periodEnd'] = $this->periodEnd->format('Y-m-d');
        }

        if ($this->group !== null) {
            $result['group'] = $this->group;
        }

        return $result;
    }
}
