<?php

declare(strict_types=1);

namespace App\Analytics\Domain\Model;

use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Value Object représentant une période de temps pour le filtrage des statistiques.
 */
final readonly class Period
{
    private function __construct(
        private ?DateTimeImmutable $from,
        private ?DateTimeImmutable $to
    ) {
        if ($from !== null && $to !== null && $from > $to) {
            throw new InvalidArgumentException(
                'Period start date cannot be after end date'
            );
        }
    }

    public static function create(?DateTimeImmutable $from, ?DateTimeImmutable $to): self
    {
        return new self($from, $to);
    }

    public static function all(): self
    {
        return new self(null, null);
    }

    public static function fromDateStrings(?string $from, ?string $to): self
    {
        $fromDate = $from !== null ? new DateTimeImmutable($from) : null;
        $toDate = $to !== null ? new DateTimeImmutable($to) : null;

        return new self($fromDate, $toDate);
    }

    public function from(): ?DateTimeImmutable
    {
        return $this->from;
    }

    public function to(): ?DateTimeImmutable
    {
        return $this->to;
    }

    public function contains(DateTimeImmutable $date): bool
    {
        if ($this->from !== null && $date < $this->from) {
            return false;
        }

        if ($this->to !== null && $date > $this->to) {
            return false;
        }

        return true;
    }

    public function isUnbounded(): bool
    {
        return $this->from === null && $this->to === null;
    }
}
