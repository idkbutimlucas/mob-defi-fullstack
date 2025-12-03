<?php

declare(strict_types=1);

namespace App\Routing\Application\Query;

/**
 * Query pour calculer un itinéraire entre deux stations.
 */
final readonly class CalculateRouteQuery
{
    public function __construct(
        public string $origin,
        public string $destination
    ) {
    }
}
