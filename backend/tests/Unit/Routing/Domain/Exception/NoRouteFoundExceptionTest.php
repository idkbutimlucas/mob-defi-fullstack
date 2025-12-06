<?php

declare(strict_types=1);

namespace App\Tests\Unit\Routing\Domain\Exception;

use App\Routing\Domain\Exception\NoRouteFoundException;
use App\Shared\Domain\StationId;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class NoRouteFoundExceptionTest extends TestCase
{
    #[Test]
    public function it_creates_exception_with_station_ids(): void
    {
        $from = StationId::fromString('START');
        $to = StationId::fromString('END');

        $exception = NoRouteFoundException::between($from, $to);

        $this->assertInstanceOf(NoRouteFoundException::class, $exception);
        $this->assertEquals('START', $exception->getFromStationId());
        $this->assertEquals('END', $exception->getToStationId());
    }

    #[Test]
    public function it_contains_station_ids_in_message(): void
    {
        $from = StationId::fromString('ORIGIN');
        $to = StationId::fromString('DEST');

        $exception = NoRouteFoundException::between($from, $to);

        $this->assertStringContainsString('ORIGIN', $exception->getMessage());
        $this->assertStringContainsString('DEST', $exception->getMessage());
        $this->assertStringContainsString('No route found', $exception->getMessage());
    }

    #[Test]
    public function it_is_a_domain_exception(): void
    {
        $from = StationId::fromString('A');
        $to = StationId::fromString('B');

        $exception = NoRouteFoundException::between($from, $to);

        $this->assertInstanceOf(\DomainException::class, $exception);
    }

    #[Test]
    public function it_preserves_station_ids(): void
    {
        $from = StationId::fromString('MX');
        $to = StationId::fromString('ZW');

        $exception = NoRouteFoundException::between($from, $to);

        $this->assertSame('MX', $exception->getFromStationId());
        $this->assertSame('ZW', $exception->getToStationId());
    }
}
