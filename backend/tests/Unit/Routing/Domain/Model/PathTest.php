<?php

declare(strict_types=1);

namespace App\Tests\Unit\Routing\Domain\Model;

use App\Routing\Domain\Model\Path;
use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class PathTest extends TestCase
{
    #[Test]
    public function it_creates_path_with_two_stations(): void
    {
        $stations = [
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
        ];
        $distance = Distance::fromKilometers(5.0);

        $path = Path::create($stations, $distance);

        $this->assertCount(2, $path->stations());
        $this->assertEquals(5.0, $path->totalDistance()->value());
    }

    #[Test]
    public function it_throws_exception_when_less_than_two_stations(): void
    {
        $stations = [StationId::fromString('MX')];
        $distance = Distance::fromKilometers(0);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('A path must contain at least 2 stations');

        Path::create($stations, $distance);
    }

    #[Test]
    public function it_throws_exception_when_empty_stations(): void
    {
        $distance = Distance::fromKilometers(0);

        $this->expectException(InvalidArgumentException::class);

        Path::create([], $distance);
    }

    #[Test]
    public function it_returns_station_ids_as_strings(): void
    {
        $stations = [
            StationId::fromString('MX'),
            StationId::fromString('CAUX'),
            StationId::fromString('CGE'),
        ];
        $distance = Distance::fromKilometers(10.0);

        $path = Path::create($stations, $distance);

        $this->assertEquals(['MX', 'CAUX', 'CGE'], $path->stationIds());
    }

    #[Test]
    public function it_returns_start_station(): void
    {
        $stations = [
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
        ];
        $distance = Distance::fromKilometers(5.0);

        $path = Path::create($stations, $distance);

        $this->assertEquals('MX', $path->start()->value());
    }

    #[Test]
    public function it_returns_end_station(): void
    {
        $stations = [
            StationId::fromString('MX'),
            StationId::fromString('CAUX'),
            StationId::fromString('CGE'),
        ];
        $distance = Distance::fromKilometers(10.0);

        $path = Path::create($stations, $distance);

        $this->assertEquals('CGE', $path->end()->value());
    }

    #[Test]
    public function it_returns_station_count(): void
    {
        $stations = [
            StationId::fromString('MX'),
            StationId::fromString('CAUX'),
            StationId::fromString('CGE'),
        ];
        $distance = Distance::fromKilometers(10.0);

        $path = Path::create($stations, $distance);

        $this->assertEquals(3, $path->stationCount());
    }

    #[Test]
    public function it_returns_segment_count(): void
    {
        $stations = [
            StationId::fromString('MX'),
            StationId::fromString('CAUX'),
            StationId::fromString('CGE'),
        ];
        $distance = Distance::fromKilometers(10.0);

        $path = Path::create($stations, $distance);

        $this->assertEquals(2, $path->segmentCount());
    }

    #[Test]
    public function it_stores_segment_distances(): void
    {
        $stations = [
            StationId::fromString('MX'),
            StationId::fromString('CAUX'),
            StationId::fromString('CGE'),
        ];
        $distance = Distance::fromKilometers(10.0);
        $segmentDistances = [4.0, 6.0];

        $path = Path::create($stations, $distance, $segmentDistances);

        $this->assertEquals([4.0, 6.0], $path->segmentDistances());
    }

    #[Test]
    public function it_returns_empty_segment_distances_by_default(): void
    {
        $stations = [
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
        ];
        $distance = Distance::fromKilometers(5.0);

        $path = Path::create($stations, $distance);

        $this->assertEquals([], $path->segmentDistances());
    }
}
