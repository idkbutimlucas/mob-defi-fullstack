<?php

declare(strict_types=1);

namespace App\Tests\Unit\Routing\Domain\Model;

use App\Routing\Domain\Model\Segment;
use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class SegmentTest extends TestCase
{
    #[Test]
    public function it_creates_segment_with_valid_data(): void
    {
        $from = StationId::fromString('MX');
        $to = StationId::fromString('CGE');
        $distance = Distance::fromKilometers(5.0);

        $segment = Segment::create($from, $to, $distance);

        $this->assertEquals('MX', $segment->from()->value());
        $this->assertEquals('CGE', $segment->to()->value());
        $this->assertEquals(5.0, $segment->distance()->value());
    }

    #[Test]
    public function it_checks_if_connects_station(): void
    {
        $from = StationId::fromString('MX');
        $to = StationId::fromString('CGE');
        $distance = Distance::fromKilometers(5.0);

        $segment = Segment::create($from, $to, $distance);

        $this->assertTrue($segment->connectsStation(StationId::fromString('MX')));
        $this->assertTrue($segment->connectsStation(StationId::fromString('CGE')));
        $this->assertFalse($segment->connectsStation(StationId::fromString('ZW')));
    }

    #[Test]
    public function it_returns_other_end_from_start(): void
    {
        $from = StationId::fromString('MX');
        $to = StationId::fromString('CGE');
        $distance = Distance::fromKilometers(5.0);

        $segment = Segment::create($from, $to, $distance);

        $otherEnd = $segment->getOtherEnd(StationId::fromString('MX'));
        $this->assertNotNull($otherEnd);
        $this->assertEquals('CGE', $otherEnd->value());
    }

    #[Test]
    public function it_returns_other_end_from_end(): void
    {
        $from = StationId::fromString('MX');
        $to = StationId::fromString('CGE');
        $distance = Distance::fromKilometers(5.0);

        $segment = Segment::create($from, $to, $distance);

        $otherEnd = $segment->getOtherEnd(StationId::fromString('CGE'));
        $this->assertNotNull($otherEnd);
        $this->assertEquals('MX', $otherEnd->value());
    }

    #[Test]
    public function it_returns_null_when_station_not_in_segment(): void
    {
        $from = StationId::fromString('MX');
        $to = StationId::fromString('CGE');
        $distance = Distance::fromKilometers(5.0);

        $segment = Segment::create($from, $to, $distance);

        $otherEnd = $segment->getOtherEnd(StationId::fromString('ZW'));
        $this->assertNull($otherEnd);
    }

    #[Test]
    public function it_checks_equality_same_direction(): void
    {
        $segment1 = Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(5.0)
        );

        $segment2 = Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(5.0)
        );

        $this->assertTrue($segment1->equals($segment2));
    }

    #[Test]
    public function it_checks_equality_reverse_direction(): void
    {
        $segment1 = Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(5.0)
        );

        $segment2 = Segment::create(
            StationId::fromString('CGE'),
            StationId::fromString('MX'),
            Distance::fromKilometers(5.0)
        );

        $this->assertTrue($segment1->equals($segment2));
    }

    #[Test]
    public function it_returns_false_for_different_distance(): void
    {
        $segment1 = Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(5.0)
        );

        $segment2 = Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(10.0)
        );

        $this->assertFalse($segment1->equals($segment2));
    }

    #[Test]
    public function it_returns_false_for_different_stations(): void
    {
        $segment1 = Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(5.0)
        );

        $segment2 = Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('ZW'),
            Distance::fromKilometers(5.0)
        );

        $this->assertFalse($segment1->equals($segment2));
    }
}
