<?php

declare(strict_types=1);

namespace App\Routing\Infrastructure\Http;

use App\Analytics\Domain\Model\RouteRecord;
use App\Analytics\Domain\Repository\RouteRecordRepositoryInterface;
use App\Routing\Application\Query\CalculateRouteHandler;
use App\Routing\Application\Query\CalculateRouteQuery;
use App\Routing\Domain\Exception\NoRouteFoundException;
use App\Routing\Domain\Exception\StationNotFoundException;
use App\Shared\Domain\AnalyticCode;
use App\Shared\Domain\Distance;
use DateTimeImmutable;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;

#[Route('/api/v1')]
final class RouteController
{
    public function __construct(
        private readonly CalculateRouteHandler $calculateRouteHandler,
        private readonly RouteRecordRepositoryInterface $routeRecordRepository
    ) {
    }

    #[Route('/routes', name: 'api_routes_create', methods: ['POST'])]
    public function createRoute(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new JsonResponse(
                ['message' => 'Invalid JSON'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $validationError = $this->validateRequest($data);
        if ($validationError !== null) {
            return new JsonResponse(
                ['message' => $validationError],
                Response::HTTP_BAD_REQUEST
            );
        }

        try {
            $result = $this->calculateRouteHandler->handle(
                new CalculateRouteQuery(
                    $data['fromStationId'],
                    $data['toStationId']
                )
            );

            $id = Uuid::v4()->toRfc4122();
            $createdAt = new DateTimeImmutable();

            // Save route record for statistics
            $routeRecord = RouteRecord::create(
                $id,
                AnalyticCode::fromString($data['analyticCode']),
                Distance::fromKilometers($result->totalDistance),
                $createdAt
            );
            $this->routeRecordRepository->save($routeRecord);

            return new JsonResponse([
                'id' => $id,
                'fromStationId' => $data['fromStationId'],
                'toStationId' => $data['toStationId'],
                'analyticCode' => $data['analyticCode'],
                'distanceKm' => $result->totalDistance,
                'path' => $result->stations,
                'createdAt' => $createdAt->format(\DateTimeInterface::ATOM),
            ], Response::HTTP_CREATED);
        } catch (StationNotFoundException $e) {
            return new JsonResponse(
                ['message' => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        } catch (NoRouteFoundException $e) {
            return new JsonResponse(
                ['message' => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }
    }

    /**
     * @param array<string, mixed>|null $data
     */
    private function validateRequest(?array $data): ?string
    {
        if ($data === null) {
            return 'Invalid request body';
        }

        $requiredFields = ['fromStationId', 'toStationId', 'analyticCode'];
        $missingFields = [];

        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                $missingFields[] = $field;
            }
        }

        if (!empty($missingFields)) {
            return 'Missing required fields: ' . implode(', ', $missingFields);
        }

        return null;
    }
}
