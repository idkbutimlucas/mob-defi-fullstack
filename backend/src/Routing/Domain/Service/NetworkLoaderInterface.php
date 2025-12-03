<?php

declare(strict_types=1);

namespace App\Routing\Domain\Service;

use App\Routing\Domain\Model\Network;

/**
 * Interface pour le chargement du réseau ferroviaire.
 */
interface NetworkLoaderInterface
{
    /**
     * Charge le réseau ferroviaire depuis une source de données.
     */
    public function load(): Network;
}
