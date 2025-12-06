<?php

declare(strict_types=1);

namespace App\Tests\Unit\Analytics\Domain\Model;

use App\Analytics\Domain\Model\Period;
use DateTimeImmutable;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class PeriodTest extends TestCase
{
    #[Test]
    public function it_creates_period_with_valid_dates(): void
    {
        $from = new DateTimeImmutable('2024-01-01');
        $to = new DateTimeImmutable('2024-12-31');

        $period = Period::create($from, $to);

        $this->assertEquals($from, $period->from());
        $this->assertEquals($to, $period->to());
    }

    #[Test]
    public function it_throws_exception_when_from_is_after_to(): void
    {
        $from = new DateTimeImmutable('2024-12-31');
        $to = new DateTimeImmutable('2024-01-01');

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Period start date cannot be after end date');

        Period::create($from, $to);
    }

    #[Test]
    public function it_creates_unbounded_period(): void
    {
        $period = Period::all();

        $this->assertNull($period->from());
        $this->assertNull($period->to());
        $this->assertTrue($period->isUnbounded());
    }

    #[Test]
    public function it_creates_period_from_date_strings(): void
    {
        $period = Period::fromDateStrings('2024-01-01', '2024-12-31');

        $this->assertEquals('2024-01-01', $period->from()->format('Y-m-d'));
        $this->assertEquals('2024-12-31', $period->to()->format('Y-m-d'));
    }

    #[Test]
    public function it_creates_period_with_null_strings(): void
    {
        $period = Period::fromDateStrings(null, null);

        $this->assertNull($period->from());
        $this->assertNull($period->to());
    }

    #[Test]
    public function it_creates_period_with_only_from(): void
    {
        $period = Period::fromDateStrings('2024-01-01', null);

        $this->assertNotNull($period->from());
        $this->assertNull($period->to());
    }

    #[Test]
    public function it_creates_period_with_only_to(): void
    {
        $period = Period::fromDateStrings(null, '2024-12-31');

        $this->assertNull($period->from());
        $this->assertNotNull($period->to());
    }

    #[Test]
    public function it_checks_if_date_is_contained_in_bounded_period(): void
    {
        $period = Period::create(
            new DateTimeImmutable('2024-01-01'),
            new DateTimeImmutable('2024-12-31')
        );

        $this->assertTrue($period->contains(new DateTimeImmutable('2024-06-15')));
        $this->assertTrue($period->contains(new DateTimeImmutable('2024-01-01')));
        $this->assertTrue($period->contains(new DateTimeImmutable('2024-12-31')));
    }

    #[Test]
    public function it_returns_false_for_date_before_period(): void
    {
        $period = Period::create(
            new DateTimeImmutable('2024-01-01'),
            new DateTimeImmutable('2024-12-31')
        );

        $this->assertFalse($period->contains(new DateTimeImmutable('2023-12-31')));
    }

    #[Test]
    public function it_returns_false_for_date_after_period(): void
    {
        $period = Period::create(
            new DateTimeImmutable('2024-01-01'),
            new DateTimeImmutable('2024-12-31')
        );

        $this->assertFalse($period->contains(new DateTimeImmutable('2025-01-01')));
    }

    #[Test]
    public function it_contains_any_date_when_unbounded(): void
    {
        $period = Period::all();

        $this->assertTrue($period->contains(new DateTimeImmutable('2020-01-01')));
        $this->assertTrue($period->contains(new DateTimeImmutable('2030-12-31')));
    }

    #[Test]
    public function it_checks_if_period_is_unbounded(): void
    {
        $bounded = Period::create(
            new DateTimeImmutable('2024-01-01'),
            new DateTimeImmutable('2024-12-31')
        );

        $unbounded = Period::all();

        $this->assertFalse($bounded->isUnbounded());
        $this->assertTrue($unbounded->isUnbounded());
    }

    #[Test]
    public function it_allows_same_from_and_to_date(): void
    {
        $date = new DateTimeImmutable('2024-06-15');
        $period = Period::create($date, $date);

        $this->assertEquals($date, $period->from());
        $this->assertEquals($date, $period->to());
        $this->assertTrue($period->contains($date));
    }
}
