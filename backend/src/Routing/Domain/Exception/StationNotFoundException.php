<?php

declare(strict_types=1);

namespace App\Routing\Domain\Exception;

use App\Shared\Domain\StationId;
use DomainException;

/**
 * Exception levée lorsqu'une station n'est pas trouvée dans le réseau.
 */
final class StationNotFoundException extends DomainException
{
    private function __construct(
        string $message,
        private readonly string $stationId
    ) {
        parent::__construct($message);
    }

    public static function withId(StationId $stationId): self
    {
        return new self(
            sprintf('Station with id "%s" not found in the network', $stationId->value()),
            $stationId->value()
        );
    }

    public function getStationId(): string
    {
        return $this->stationId;
    }
}
