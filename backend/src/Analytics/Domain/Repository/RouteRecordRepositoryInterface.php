<?php

declare(strict_types=1);

namespace App\Analytics\Domain\Repository;

use App\Analytics\Domain\Model\DistanceAggregate;
use App\Analytics\Domain\Model\Period;
use App\Analytics\Domain\Model\RouteRecord;

/**
 * Interface du repository pour les enregistrements de trajets (statistiques).
 */
interface RouteRecordRepositoryInterface
{
    /**
     * Persiste un enregistrement de trajet.
     */
    public function save(RouteRecord $record): void;

    /**
     * Retourne les distances agrégées par code analytique.
     *
     * @param Period $period Période de filtrage
     * @param string $groupBy Groupement: 'none', 'day', 'month', 'year'
     * @return DistanceAggregate[]
     */
    public function getAggregatedDistances(Period $period, string $groupBy = 'none'): array;
}
