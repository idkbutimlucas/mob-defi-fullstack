<?php

declare(strict_types=1);

namespace App\Analytics\Infrastructure\Http;

use App\Analytics\Domain\Model\Period;
use App\Analytics\Domain\Repository\RouteRecordRepositoryInterface;
use DateTimeImmutable;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1')]
final class StatsController
{
    public function __construct(
        private readonly RouteRecordRepositoryInterface $repository
    ) {
    }

    #[Route('/stats/distances', name: 'api_stats_distances', methods: ['GET'])]
    public function getDistances(Request $request): JsonResponse
    {
        $from = $request->query->get('from');
        $to = $request->query->get('to');
        $groupBy = $request->query->get('groupBy', 'none');

        if (!in_array($groupBy, ['none', 'day', 'month', 'year'], true)) {
            return new JsonResponse(
                ['message' => 'Invalid groupBy parameter. Must be one of: none, day, month, year'],
                Response::HTTP_BAD_REQUEST
            );
        }

        try {
            $period = Period::fromDateStrings($from, $to);
        } catch (InvalidArgumentException $e) {
            return new JsonResponse(
                ['message' => $e->getMessage()],
                Response::HTTP_BAD_REQUEST
            );
        }

        $aggregates = $this->repository->getAggregatedDistances($period, $groupBy);

        $items = array_map(
            fn($aggregate) => $aggregate->toArray(),
            $aggregates
        );

        return new JsonResponse([
            'from' => $from,
            'to' => $to,
            'groupBy' => $groupBy,
            'items' => $items,
        ]);
    }
}
