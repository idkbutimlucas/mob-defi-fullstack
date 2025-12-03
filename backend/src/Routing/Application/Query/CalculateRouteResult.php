<?php

declare(strict_types=1);

namespace App\Routing\Application\Query;

/**
 * Résultat du calcul d'itinéraire.
 */
final readonly class CalculateRouteResult
{
    /**
     * @param string[] $stations     Liste des codes de stations
     * @param string[] $stationNames Liste des noms de stations
     */
    public function __construct(
        public array $stations,
        public array $stationNames,
        public float $totalDistance,
        public int $segmentCount
    ) {
    }
}
