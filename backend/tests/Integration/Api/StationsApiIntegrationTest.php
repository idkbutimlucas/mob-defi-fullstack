<?php

declare(strict_types=1);

namespace App\Tests\Integration\Api;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Integration tests for the Stations API endpoint.
 */
class StationsApiIntegrationTest extends WebTestCase
{
    public function testItReturnsListOfStations(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/stations');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertIsArray($data);
        $this->assertNotEmpty($data);
    }

    public function testItReturnsStationsWithRequiredFields(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/stations');

        $data = json_decode($client->getResponse()->getContent(), true);

        foreach ($data as $station) {
            $this->assertArrayHasKey('id', $station);
            $this->assertArrayHasKey('shortName', $station);
            $this->assertArrayHasKey('longName', $station);
        }
    }

    public function testItContainsKnownStations(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/stations');

        $data = json_decode($client->getResponse()->getContent(), true);
        $stationIds = array_column($data, 'id');

        // Verify known MOB stations exist
        $this->assertContains('MX', $stationIds, 'Montreux should be in stations list');
        $this->assertContains('ZW', $stationIds, 'Zweisimmen should be in stations list');
    }
}
