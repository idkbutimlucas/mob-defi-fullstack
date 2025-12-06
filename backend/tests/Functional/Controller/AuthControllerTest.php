<?php

declare(strict_types=1);

namespace App\Tests\Functional\Controller;

use PHPUnit\Framework\Attributes\Test;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class AuthControllerTest extends WebTestCase
{
    #[Test]
    public function it_registers_user_successfully(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => 'testuser_' . uniqid(),
                'email' => 'test_' . uniqid() . '@example.com',
                'password' => 'password123',
            ])
        );

        $this->assertResponseStatusCodeSame(201);
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $response = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('message', $response);
        $this->assertArrayHasKey('user', $response);
        $this->assertArrayHasKey('id', $response['user']);
        $this->assertArrayHasKey('username', $response['user']);
        $this->assertArrayHasKey('email', $response['user']);
    }

    #[Test]
    public function it_returns_400_when_username_is_missing(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'test@example.com',
                'password' => 'password123',
            ])
        );

        $this->assertResponseStatusCodeSame(400);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $response);
        $this->assertArrayHasKey('username', $response['errors']);
    }

    #[Test]
    public function it_returns_400_when_email_is_invalid(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => 'testuser',
                'email' => 'invalid-email',
                'password' => 'password123',
            ])
        );

        $this->assertResponseStatusCodeSame(400);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $response);
        $this->assertArrayHasKey('email', $response['errors']);
    }

    #[Test]
    public function it_returns_400_when_password_is_too_short(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => 'testuser',
                'email' => 'test@example.com',
                'password' => '123',
            ])
        );

        $this->assertResponseStatusCodeSame(400);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $response);
        $this->assertArrayHasKey('password', $response['errors']);
    }

    #[Test]
    public function it_returns_400_when_username_is_too_short(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => 'ab',
                'email' => 'test@example.com',
                'password' => 'password123',
            ])
        );

        $this->assertResponseStatusCodeSame(400);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $response);
        $this->assertArrayHasKey('username', $response['errors']);
    }

    #[Test]
    public function it_returns_400_when_username_contains_invalid_characters(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => 'test@user!',
                'email' => 'test@example.com',
                'password' => 'password123',
            ])
        );

        $this->assertResponseStatusCodeSame(400);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $response);
        $this->assertArrayHasKey('username', $response['errors']);
    }

    #[Test]
    public function it_returns_409_when_username_already_exists(): void
    {
        $client = static::createClient();
        $username = 'duplicate_user_' . uniqid();

        // First registration
        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => $username,
                'email' => 'first_' . uniqid() . '@example.com',
                'password' => 'password123',
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        // Second registration with same username
        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => $username,
                'email' => 'second_' . uniqid() . '@example.com',
                'password' => 'password123',
            ])
        );

        $this->assertResponseStatusCodeSame(409);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $response);
        $this->assertArrayHasKey('username', $response['errors']);
    }

    #[Test]
    public function it_returns_409_when_email_already_exists(): void
    {
        $client = static::createClient();
        $email = 'duplicate_' . uniqid() . '@example.com';

        // First registration
        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => 'first_user_' . uniqid(),
                'email' => $email,
                'password' => 'password123',
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        // Second registration with same email
        $client->request(
            'POST',
            '/api/v1/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => 'second_user_' . uniqid(),
                'email' => $email,
                'password' => 'password123',
            ])
        );

        $this->assertResponseStatusCodeSame(409);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $response);
        $this->assertArrayHasKey('email', $response['errors']);
    }

    #[Test]
    public function it_returns_401_when_accessing_me_without_authentication(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/v1/me');

        $this->assertResponseStatusCodeSame(401);
    }
}
