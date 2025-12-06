<?php

declare(strict_types=1);

namespace App\Tests\Unit\Routing\Domain\Exception;

use App\Routing\Domain\Exception\StationNotFoundException;
use App\Shared\Domain\StationId;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class StationNotFoundExceptionTest extends TestCase
{
    #[Test]
    public function it_creates_exception_with_station_id(): void
    {
        $stationId = StationId::fromString('UNKNOWN');

        $exception = StationNotFoundException::withId($stationId);

        $this->assertInstanceOf(StationNotFoundException::class, $exception);
        $this->assertEquals('UNKNOWN', $exception->getStationId());
    }

    #[Test]
    public function it_contains_station_id_in_message(): void
    {
        $stationId = StationId::fromString('TEST123');

        $exception = StationNotFoundException::withId($stationId);

        $this->assertStringContainsString('TEST123', $exception->getMessage());
        $this->assertStringContainsString('not found', $exception->getMessage());
    }

    #[Test]
    public function it_is_a_domain_exception(): void
    {
        $stationId = StationId::fromString('XYZ');

        $exception = StationNotFoundException::withId($stationId);

        $this->assertInstanceOf(\DomainException::class, $exception);
    }
}
