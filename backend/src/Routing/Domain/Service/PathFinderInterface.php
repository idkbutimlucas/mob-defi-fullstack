<?php

declare(strict_types=1);

namespace App\Routing\Domain\Service;

use App\Routing\Domain\Exception\NoRouteFoundException;
use App\Routing\Domain\Model\Network;
use App\Routing\Domain\Model\Path;
use App\Shared\Domain\StationId;

/**
 * Interface du service de recherche de chemin.
 * L'implémentation doit trouver le chemin le plus court entre deux stations.
 */
interface PathFinderInterface
{
    /**
     * Trouve le chemin le plus court entre deux stations dans le réseau.
     *
     * @throws NoRouteFoundException si aucun chemin n'existe entre les deux stations
     */
    public function findPath(Network $network, StationId $from, StationId $to): Path;
}
