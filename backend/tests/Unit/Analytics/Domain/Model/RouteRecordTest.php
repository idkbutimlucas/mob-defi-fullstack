<?php

declare(strict_types=1);

namespace App\Tests\Unit\Analytics\Domain\Model;

use App\Analytics\Domain\Model\RouteRecord;
use App\Shared\Domain\AnalyticCode;
use App\Shared\Domain\Distance;
use DateTimeImmutable;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class RouteRecordTest extends TestCase
{
    #[Test]
    public function it_creates_route_record_with_valid_data(): void
    {
        $id = 'uuid-123';
        $analyticCode = AnalyticCode::fromString('PASSENGER');
        $distance = Distance::fromKilometers(25.5);
        $createdAt = new DateTimeImmutable('2024-06-15 10:30:00');

        $record = RouteRecord::create($id, $analyticCode, $distance, $createdAt);

        $this->assertEquals('uuid-123', $record->id());
        $this->assertEquals('PASSENGER', $record->analyticCode()->value());
        $this->assertEquals(25.5, $record->distance()->value());
        $this->assertEquals($createdAt, $record->createdAt());
    }

    #[Test]
    public function it_returns_distance_km_as_float(): void
    {
        $record = RouteRecord::create(
            'uuid-123',
            AnalyticCode::fromString('FREIGHT'),
            Distance::fromKilometers(100.75),
            new DateTimeImmutable()
        );

        $this->assertEquals(100.75, $record->distanceKm());
    }

    #[Test]
    public function it_returns_analytic_code_as_value_object(): void
    {
        $record = RouteRecord::create(
            'uuid-123',
            AnalyticCode::fromString('MAINT'),
            Distance::fromKilometers(50.0),
            new DateTimeImmutable()
        );

        $analyticCode = $record->analyticCode();

        $this->assertInstanceOf(AnalyticCode::class, $analyticCode);
        $this->assertEquals('MAINT', $analyticCode->value());
    }

    #[Test]
    public function it_returns_distance_as_value_object(): void
    {
        $record = RouteRecord::create(
            'uuid-123',
            AnalyticCode::fromString('TEST'),
            Distance::fromKilometers(75.25),
            new DateTimeImmutable()
        );

        $distance = $record->distance();

        $this->assertInstanceOf(Distance::class, $distance);
        $this->assertEquals(75.25, $distance->value());
    }

    #[Test]
    public function it_preserves_created_at_timestamp(): void
    {
        $createdAt = new DateTimeImmutable('2024-01-15 08:00:00');

        $record = RouteRecord::create(
            'uuid-123',
            AnalyticCode::fromString('TEST'),
            Distance::fromKilometers(10.0),
            $createdAt
        );

        $this->assertEquals('2024-01-15 08:00:00', $record->createdAt()->format('Y-m-d H:i:s'));
    }
}
