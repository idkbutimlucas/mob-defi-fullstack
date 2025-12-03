<?php

declare(strict_types=1);

namespace App\Tests\Unit\Shared\Domain;

use App\Shared\Domain\AnalyticCode;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class AnalyticCodeTest extends TestCase
{
    #[Test]
    public function it_can_be_created_from_string(): void
    {
        $code = AnalyticCode::fromString('PASSENGER');

        $this->assertEquals('PASSENGER', $code->value());
    }

    #[Test]
    public function it_cannot_be_empty(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('AnalyticCode cannot be empty');

        AnalyticCode::fromString('');
    }

    #[Test]
    public function it_cannot_be_only_whitespace(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('AnalyticCode cannot be empty');

        AnalyticCode::fromString('   ');
    }

    #[Test]
    public function it_cannot_exceed_50_characters(): void
    {
        $longCode = str_repeat('A', 51);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('AnalyticCode cannot exceed 50 characters');

        AnalyticCode::fromString($longCode);
    }

    #[Test]
    public function it_accepts_50_characters(): void
    {
        $code = str_repeat('A', 50);

        $analyticCode = AnalyticCode::fromString($code);

        $this->assertEquals($code, $analyticCode->value());
    }

    #[Test]
    public function it_can_check_equality(): void
    {
        $code1 = AnalyticCode::fromString('PASSENGER');
        $code2 = AnalyticCode::fromString('PASSENGER');
        $code3 = AnalyticCode::fromString('FREIGHT');

        $this->assertTrue($code1->equals($code2));
        $this->assertFalse($code1->equals($code3));
    }

    #[Test]
    public function it_can_be_converted_to_string(): void
    {
        $code = AnalyticCode::fromString('MAINTENANCE');

        $this->assertEquals('MAINTENANCE', (string) $code);
    }

    #[Test]
    public function it_accepts_various_formats(): void
    {
        $validCodes = ['PASSENGER', 'ANA-001', 'freight_2024', 'Test123'];

        foreach ($validCodes as $code) {
            $analyticCode = AnalyticCode::fromString($code);
            $this->assertEquals($code, $analyticCode->value());
        }
    }
}
