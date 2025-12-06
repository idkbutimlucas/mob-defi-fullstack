<?php

declare(strict_types=1);

namespace App\Tests\Functional\Controller;

use PHPUnit\Framework\Attributes\Test;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class RouteControllerTest extends WebTestCase
{
    #[Test]
    public function it_calculates_route_between_two_stations(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'MX',
                'toStationId' => 'CGE',
                'analyticCode' => 'TEST-001',
            ])
        );

        $this->assertResponseStatusCodeSame(201);
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $response = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('id', $response);
        $this->assertEquals('MX', $response['fromStationId']);
        $this->assertEquals('CGE', $response['toStationId']);
        $this->assertEquals('TEST-001', $response['analyticCode']);
        $this->assertArrayHasKey('distanceKm', $response);
        $this->assertArrayHasKey('path', $response);
        $this->assertArrayHasKey('createdAt', $response);
        $this->assertContains('MX', $response['path']);
        $this->assertContains('CGE', $response['path']);
    }

    #[Test]
    public function it_returns_422_when_station_not_found(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'UNKNOWN',
                'toStationId' => 'CGE',
                'analyticCode' => 'TEST-001',
            ])
        );

        $this->assertResponseStatusCodeSame(422);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $response);
    }

    #[Test]
    public function it_returns_400_when_missing_required_fields(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'MX',
                // Missing toStationId and analyticCode
            ])
        );

        $this->assertResponseStatusCodeSame(400);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $response);
    }

    #[Test]
    public function it_returns_400_when_invalid_json(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            'invalid json'
        );

        $this->assertResponseStatusCodeSame(400);
    }

    #[Test]
    public function it_calculates_multi_station_route(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'MX',
                'toStationId' => 'ZW',
                'analyticCode' => 'PASSENGER',
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        $response = json_decode($client->getResponse()->getContent(), true);

        $this->assertGreaterThanOrEqual(2, count($response['path']), 'Path should contain at least 2 stations');
        $this->assertEquals('MX', $response['path'][0]);
        $this->assertEquals('ZW', $response['path'][count($response['path']) - 1]);
        $this->assertGreaterThan(0, $response['distanceKm']);
    }

    #[Test]
    public function it_returns_422_when_same_from_and_to_station(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'MX',
                'toStationId' => 'MX',
                'analyticCode' => 'TEST-001',
            ])
        );

        $this->assertResponseStatusCodeSame(422);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $response);
    }

    #[Test]
    public function it_returns_segment_distances_in_response(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'MX',
                'toStationId' => 'ZW',
                'analyticCode' => 'TEST-SEGMENTS',
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        $response = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('segmentDistances', $response);
        $this->assertIsArray($response['segmentDistances']);
        // Number of segments should be path length - 1
        $this->assertCount(count($response['path']) - 1, $response['segmentDistances']);
    }

    #[Test]
    public function it_returns_422_when_to_station_not_found(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'MX',
                'toStationId' => 'NOTEXIST',
                'analyticCode' => 'TEST-001',
            ])
        );

        $this->assertResponseStatusCodeSame(422);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $response);
        $this->assertStringContainsString('NOTEXIST', $response['message']);
    }

    #[Test]
    public function it_returns_400_when_empty_analytic_code(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/routes',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'fromStationId' => 'MX',
                'toStationId' => 'CGE',
                'analyticCode' => '',
            ])
        );

        $this->assertResponseStatusCodeSame(400);
    }
}
