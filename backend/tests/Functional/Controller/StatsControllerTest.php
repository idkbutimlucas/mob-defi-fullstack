<?php

declare(strict_types=1);

namespace App\Tests\Functional\Controller;

use App\Analytics\Infrastructure\Persistence\InMemoryRouteRecordRepository;
use PHPUnit\Framework\Attributes\Test;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class StatsControllerTest extends WebTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        InMemoryRouteRecordRepository::clear();
    }

    #[Test]
    public function it_returns_empty_list_when_no_routes(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/v1/stats/distances');

        $this->assertResponseStatusCodeSame(200);
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $response = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('items', $response);
        $this->assertIsArray($response['items']);
        $this->assertEquals('none', $response['groupBy']);
    }

    #[Test]
    public function it_returns_aggregated_distances_after_creating_routes(): void
    {
        $client = static::createClient();

        // Create first route
        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'MX',
                'toStationId' => 'CGE',
                'analyticCode' => 'PASSENGER',
            ])
        );
        $this->assertResponseStatusCodeSame(201);

        // Create second route with same analytic code
        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'CGE',
                'toStationId' => 'MX',
                'analyticCode' => 'PASSENGER',
            ])
        );
        $this->assertResponseStatusCodeSame(201);

        // Get stats
        $client->request('GET', '/api/v1/stats/distances');

        $this->assertResponseStatusCodeSame(200);

        $response = json_decode($client->getResponse()->getContent(), true);

        $this->assertNotEmpty($response['items']);

        // Find PASSENGER aggregate
        $passengerAggregate = null;
        foreach ($response['items'] as $item) {
            if ($item['analyticCode'] === 'PASSENGER') {
                $passengerAggregate = $item;
                break;
            }
        }

        $this->assertNotNull($passengerAggregate);
        $this->assertGreaterThan(0, $passengerAggregate['totalDistanceKm']);
    }

    #[Test]
    public function it_filters_by_date_range(): void
    {
        $client = static::createClient();

        $client->request(
            'GET',
            '/api/v1/stats/distances',
            ['from' => '2025-01-01', 'to' => '2025-12-31']
        );

        $this->assertResponseStatusCodeSame(200);

        $response = json_decode($client->getResponse()->getContent(), true);

        $this->assertEquals('2025-01-01', $response['from']);
        $this->assertEquals('2025-12-31', $response['to']);
    }

    #[Test]
    public function it_returns_400_when_from_is_after_to(): void
    {
        $client = static::createClient();

        $client->request(
            'GET',
            '/api/v1/stats/distances',
            ['from' => '2025-12-31', 'to' => '2025-01-01']
        );

        $this->assertResponseStatusCodeSame(400);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $response);
    }

    #[Test]
    public function it_supports_group_by_parameter(): void
    {
        $client = static::createClient();

        foreach (['day', 'month', 'year', 'none'] as $groupBy) {
            $client->request(
                'GET',
                '/api/v1/stats/distances',
                ['groupBy' => $groupBy]
            );

            $this->assertResponseStatusCodeSame(200, "Failed for groupBy=$groupBy");

            $response = json_decode($client->getResponse()->getContent(), true);
            $this->assertEquals($groupBy, $response['groupBy']);
        }
    }

    #[Test]
    public function it_returns_400_for_invalid_group_by(): void
    {
        $client = static::createClient();

        $client->request(
            'GET',
            '/api/v1/stats/distances',
            ['groupBy' => 'invalid']
        );

        $this->assertResponseStatusCodeSame(400);
    }
}
