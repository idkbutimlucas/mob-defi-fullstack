<?php

declare(strict_types=1);

namespace App\Tests\Unit\Shared\Domain;

use App\Shared\Domain\StationId;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class StationIdTest extends TestCase
{
    #[Test]
    public function it_can_be_created_from_string(): void
    {
        $stationId = StationId::fromString('MX');

        $this->assertEquals('MX', $stationId->value());
    }

    #[Test]
    public function it_normalizes_to_uppercase(): void
    {
        $stationId = StationId::fromString('mx');

        $this->assertEquals('MX', $stationId->value());
    }

    #[Test]
    public function it_trims_whitespace(): void
    {
        $stationId = StationId::fromString('  MX  ');

        $this->assertEquals('MX', $stationId->value());
    }

    #[Test]
    public function it_cannot_be_empty(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('StationId cannot be empty');

        StationId::fromString('');
    }

    #[Test]
    public function it_cannot_be_only_whitespace(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('StationId cannot be empty');

        StationId::fromString('   ');
    }

    #[Test]
    public function it_must_be_alphanumeric(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('StationId must be alphanumeric');

        StationId::fromString('MX-01');
    }

    #[Test]
    public function it_cannot_exceed_10_characters(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('StationId must be alphanumeric');

        StationId::fromString('ABCDEFGHIJK');
    }

    #[Test]
    public function it_can_check_equality(): void
    {
        $id1 = StationId::fromString('MX');
        $id2 = StationId::fromString('MX');
        $id3 = StationId::fromString('ZW');

        $this->assertTrue($id1->equals($id2));
        $this->assertFalse($id1->equals($id3));
    }

    #[Test]
    public function it_can_be_converted_to_string(): void
    {
        $stationId = StationId::fromString('MX');

        $this->assertEquals('MX', (string) $stationId);
    }

    #[Test]
    public function it_accepts_valid_station_codes(): void
    {
        $validCodes = ['MX', 'ZW', 'CABY', 'AVA', 'BLON', 'STST'];

        foreach ($validCodes as $code) {
            $stationId = StationId::fromString($code);
            $this->assertEquals(strtoupper($code), $stationId->value());
        }
    }
}
