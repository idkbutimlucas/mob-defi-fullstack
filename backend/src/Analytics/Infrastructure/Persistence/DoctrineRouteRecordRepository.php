<?php

declare(strict_types=1);

namespace App\Analytics\Infrastructure\Persistence;

use App\Analytics\Domain\Model\DistanceAggregate;
use App\Analytics\Domain\Model\Period;
use App\Analytics\Domain\Model\RouteRecord;
use App\Analytics\Domain\Repository\RouteRecordRepositoryInterface;
use App\Shared\Domain\AnalyticCode;
use App\Shared\Domain\Distance;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Doctrine implementation of RouteRecordRepository.
 * Persists route records to PostgreSQL database.
 */
final class DoctrineRouteRecordRepository implements RouteRecordRepositoryInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    public function save(RouteRecord $record): void
    {
        $this->entityManager->persist($record);
        $this->entityManager->flush();
    }

    /**
     * @return DistanceAggregate[]
     */
    public function getAggregatedDistances(Period $period, string $groupBy = 'none'): array
    {
        $conn = $this->entityManager->getConnection();

        $groupSelect = '';
        $groupByClause = '';

        if ($groupBy !== 'none') {
            $format = match ($groupBy) {
                'day' => 'YYYY-MM-DD',
                'month' => 'YYYY-MM',
                'year' => 'YYYY',
                default => null,
            };

            if ($format !== null) {
                $groupSelect = ", TO_CHAR(created_at, '$format') as group_key";
                $groupByClause = ", TO_CHAR(created_at, '$format')";
            }
        }

        $sql = "SELECT analytic_code, SUM(distance_km) as total_distance $groupSelect
                FROM route_records
                WHERE 1=1";

        $params = [];

        if ($period->from() !== null) {
            $sql .= ' AND created_at >= :from_date';
            $params['from_date'] = $period->from()->format('Y-m-d H:i:s');
        }

        if ($period->to() !== null) {
            $sql .= ' AND created_at <= :to_date';
            $params['to_date'] = $period->to()->format('Y-m-d 23:59:59');
        }

        $sql .= " GROUP BY analytic_code $groupByClause";

        $results = $conn->executeQuery($sql, $params)->fetchAllAssociative();

        $aggregates = [];
        foreach ($results as $row) {
            $aggregates[] = DistanceAggregate::create(
                AnalyticCode::fromString($row['analytic_code']),
                Distance::fromKilometers((float) $row['total_distance']),
                $period->from(),
                $period->to(),
                $row['group_key'] ?? null
            );
        }

        return $aggregates;
    }
}
