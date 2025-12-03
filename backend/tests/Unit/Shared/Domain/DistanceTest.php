<?php

declare(strict_types=1);

namespace App\Tests\Unit\Shared\Domain;

use App\Shared\Domain\Distance;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class DistanceTest extends TestCase
{
    #[Test]
    public function it_can_be_created_from_kilometers(): void
    {
        $distance = Distance::fromKilometers(10.5);

        $this->assertEquals(10.5, $distance->value());
    }

    #[Test]
    public function it_can_be_zero(): void
    {
        $distance = Distance::zero();

        $this->assertEquals(0.0, $distance->value());
    }

    #[Test]
    public function it_cannot_be_negative(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Distance cannot be negative');

        Distance::fromKilometers(-1.0);
    }

    #[Test]
    public function it_can_add_two_distances(): void
    {
        $d1 = Distance::fromKilometers(10.5);
        $d2 = Distance::fromKilometers(5.5);

        $result = $d1->add($d2);

        $this->assertEquals(16.0, $result->value());
    }

    #[Test]
    public function it_can_compare_greater_than(): void
    {
        $d1 = Distance::fromKilometers(10.0);
        $d2 = Distance::fromKilometers(5.0);

        $this->assertTrue($d1->isGreaterThan($d2));
        $this->assertFalse($d2->isGreaterThan($d1));
    }

    #[Test]
    public function it_can_compare_less_than(): void
    {
        $d1 = Distance::fromKilometers(5.0);
        $d2 = Distance::fromKilometers(10.0);

        $this->assertTrue($d1->isLessThan($d2));
        $this->assertFalse($d2->isLessThan($d1));
    }

    #[Test]
    public function it_can_check_equality(): void
    {
        $d1 = Distance::fromKilometers(10.0);
        $d2 = Distance::fromKilometers(10.0);
        $d3 = Distance::fromKilometers(10.0001);

        $this->assertTrue($d1->equals($d2));
        $this->assertTrue($d1->equals($d3)); // Within tolerance
    }

    #[Test]
    public function it_can_be_converted_to_string(): void
    {
        $distance = Distance::fromKilometers(10.5);

        $this->assertEquals('10.50 km', (string) $distance);
    }
}
