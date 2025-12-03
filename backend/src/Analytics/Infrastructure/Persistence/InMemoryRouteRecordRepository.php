<?php

declare(strict_types=1);

namespace App\Analytics\Infrastructure\Persistence;

use App\Analytics\Domain\Model\DistanceAggregate;
use App\Analytics\Domain\Model\Period;
use App\Analytics\Domain\Model\RouteRecord;
use App\Analytics\Domain\Repository\RouteRecordRepositoryInterface;
use App\Shared\Domain\AnalyticCode;
use App\Shared\Domain\Distance;

/**
 * In-memory implementation of RouteRecordRepository.
 * Used for testing and development.
 * Uses static storage to persist data across multiple kernel boots in tests.
 */
final class InMemoryRouteRecordRepository implements RouteRecordRepositoryInterface
{
    /** @var RouteRecord[] */
    private static array $records = [];

    public function save(RouteRecord $record): void
    {
        self::$records[$record->id()] = $record;
    }

    /**
     * @return DistanceAggregate[]
     */
    public function getAggregatedDistances(Period $period, string $groupBy = 'none'): array
    {
        $filteredRecords = array_filter(
            self::$records,
            fn(RouteRecord $record) => $period->contains($record->createdAt())
        );

        if ($groupBy === 'none') {
            return $this->aggregateByCode($filteredRecords, $period);
        }

        return $this->aggregateByCodeAndGroup($filteredRecords, $period, $groupBy);
    }

    /**
     * @param RouteRecord[] $records
     * @return DistanceAggregate[]
     */
    private function aggregateByCode(array $records, Period $period): array
    {
        $totals = [];

        foreach ($records as $record) {
            $code = $record->analyticCode()->value();
            if (!isset($totals[$code])) {
                $totals[$code] = 0.0;
            }
            $totals[$code] += $record->distanceKm();
        }

        $result = [];
        foreach ($totals as $code => $total) {
            $result[] = DistanceAggregate::create(
                AnalyticCode::fromString($code),
                Distance::fromKilometers($total),
                $period->from(),
                $period->to()
            );
        }

        return $result;
    }

    /**
     * @param RouteRecord[] $records
     * @return DistanceAggregate[]
     */
    private function aggregateByCodeAndGroup(array $records, Period $period, string $groupBy): array
    {
        $totals = [];

        foreach ($records as $record) {
            $code = $record->analyticCode()->value();
            $group = $this->getGroupKey($record->createdAt(), $groupBy);
            $key = $code . '|' . $group;

            if (!isset($totals[$key])) {
                $totals[$key] = ['code' => $code, 'group' => $group, 'total' => 0.0];
            }
            $totals[$key]['total'] += $record->distanceKm();
        }

        $result = [];
        foreach ($totals as $data) {
            $result[] = DistanceAggregate::create(
                AnalyticCode::fromString($data['code']),
                Distance::fromKilometers($data['total']),
                $period->from(),
                $period->to(),
                $data['group']
            );
        }

        return $result;
    }

    private function getGroupKey(\DateTimeImmutable $date, string $groupBy): string
    {
        return match ($groupBy) {
            'day' => $date->format('Y-m-d'),
            'month' => $date->format('Y-m'),
            'year' => $date->format('Y'),
            default => '',
        };
    }

    public static function clear(): void
    {
        self::$records = [];
    }

    public function count(): int
    {
        return count(self::$records);
    }
}
