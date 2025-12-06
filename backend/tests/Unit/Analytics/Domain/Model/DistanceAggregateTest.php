<?php

declare(strict_types=1);

namespace App\Tests\Unit\Analytics\Domain\Model;

use App\Analytics\Domain\Model\DistanceAggregate;
use App\Shared\Domain\AnalyticCode;
use App\Shared\Domain\Distance;
use DateTimeImmutable;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class DistanceAggregateTest extends TestCase
{
    #[Test]
    public function it_creates_aggregate_with_all_fields(): void
    {
        $analyticCode = AnalyticCode::fromString('PASSENGER');
        $distance = Distance::fromKilometers(100.5);
        $periodStart = new DateTimeImmutable('2024-01-01');
        $periodEnd = new DateTimeImmutable('2024-01-31');
        $group = '2024-01';

        $aggregate = DistanceAggregate::create(
            $analyticCode,
            $distance,
            $periodStart,
            $periodEnd,
            $group
        );

        $this->assertEquals('PASSENGER', $aggregate->analyticCode()->value());
        $this->assertEquals(100.5, $aggregate->totalDistance()->value());
        $this->assertEquals($periodStart, $aggregate->periodStart());
        $this->assertEquals($periodEnd, $aggregate->periodEnd());
        $this->assertEquals('2024-01', $aggregate->group());
    }

    #[Test]
    public function it_creates_aggregate_with_minimal_fields(): void
    {
        $analyticCode = AnalyticCode::fromString('FREIGHT');
        $distance = Distance::fromKilometers(50.0);

        $aggregate = DistanceAggregate::create($analyticCode, $distance);

        $this->assertEquals('FREIGHT', $aggregate->analyticCode()->value());
        $this->assertEquals(50.0, $aggregate->totalDistance()->value());
        $this->assertNull($aggregate->periodStart());
        $this->assertNull($aggregate->periodEnd());
        $this->assertNull($aggregate->group());
    }

    #[Test]
    public function it_converts_to_array_with_all_fields(): void
    {
        $aggregate = DistanceAggregate::create(
            AnalyticCode::fromString('MAINT'),
            Distance::fromKilometers(75.25),
            new DateTimeImmutable('2024-06-01'),
            new DateTimeImmutable('2024-06-30'),
            '2024-06'
        );

        $array = $aggregate->toArray();

        $this->assertEquals('MAINT', $array['analyticCode']);
        $this->assertEquals(75.25, $array['totalDistanceKm']);
        $this->assertEquals('2024-06-01', $array['periodStart']);
        $this->assertEquals('2024-06-30', $array['periodEnd']);
        $this->assertEquals('2024-06', $array['group']);
    }

    #[Test]
    public function it_converts_to_array_without_optional_fields(): void
    {
        $aggregate = DistanceAggregate::create(
            AnalyticCode::fromString('TEST'),
            Distance::fromKilometers(25.0)
        );

        $array = $aggregate->toArray();

        $this->assertEquals('TEST', $array['analyticCode']);
        $this->assertEquals(25.0, $array['totalDistanceKm']);
        $this->assertArrayNotHasKey('periodStart', $array);
        $this->assertArrayNotHasKey('periodEnd', $array);
        $this->assertArrayNotHasKey('group', $array);
    }

    #[Test]
    public function it_converts_to_array_with_only_period_start(): void
    {
        $aggregate = DistanceAggregate::create(
            AnalyticCode::fromString('TEST'),
            Distance::fromKilometers(30.0),
            new DateTimeImmutable('2024-01-01'),
            null,
            null
        );

        $array = $aggregate->toArray();

        $this->assertArrayHasKey('periodStart', $array);
        $this->assertArrayNotHasKey('periodEnd', $array);
        $this->assertArrayNotHasKey('group', $array);
    }

    #[Test]
    public function it_converts_to_array_with_only_period_end(): void
    {
        $aggregate = DistanceAggregate::create(
            AnalyticCode::fromString('TEST'),
            Distance::fromKilometers(30.0),
            null,
            new DateTimeImmutable('2024-12-31'),
            null
        );

        $array = $aggregate->toArray();

        $this->assertArrayNotHasKey('periodStart', $array);
        $this->assertArrayHasKey('periodEnd', $array);
        $this->assertArrayNotHasKey('group', $array);
    }

    #[Test]
    public function it_converts_to_array_with_only_group(): void
    {
        $aggregate = DistanceAggregate::create(
            AnalyticCode::fromString('TEST'),
            Distance::fromKilometers(30.0),
            null,
            null,
            '2024'
        );

        $array = $aggregate->toArray();

        $this->assertArrayNotHasKey('periodStart', $array);
        $this->assertArrayNotHasKey('periodEnd', $array);
        $this->assertArrayHasKey('group', $array);
        $this->assertEquals('2024', $array['group']);
    }
}
