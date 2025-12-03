<?php

declare(strict_types=1);

namespace App\Routing\Domain\Exception;

use App\Shared\Domain\StationId;
use DomainException;

/**
 * Exception levée lorsqu'aucun chemin n'existe entre deux stations.
 */
final class NoRouteFoundException extends DomainException
{
    private function __construct(
        string $message,
        private readonly string $fromStationId,
        private readonly string $toStationId
    ) {
        parent::__construct($message);
    }

    public static function between(StationId $from, StationId $to): self
    {
        return new self(
            sprintf(
                'No route found between station "%s" and station "%s"',
                $from->value(),
                $to->value()
            ),
            $from->value(),
            $to->value()
        );
    }

    public function getFromStationId(): string
    {
        return $this->fromStationId;
    }

    public function getToStationId(): string
    {
        return $this->toStationId;
    }
}
