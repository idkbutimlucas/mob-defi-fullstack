<?php

declare(strict_types=1);

namespace App\Auth\Infrastructure\Http;

use App\Auth\Domain\Model\User;
use App\Auth\Domain\Repository\UserRepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/v1')]
class AuthController extends AbstractController
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly ValidatorInterface $validator
    ) {
    }

    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validate input
        $constraints = new Assert\Collection([
            'username' => [
                new Assert\NotBlank(['message' => 'Username is required']),
                new Assert\Length([
                    'min' => 3,
                    'max' => 50,
                    'minMessage' => 'Username must be at least 3 characters',
                    'maxMessage' => 'Username cannot exceed 50 characters'
                ]),
                new Assert\Regex([
                    'pattern' => '/^[a-zA-Z0-9_]+$/',
                    'message' => 'Username can only contain letters, numbers and underscores'
                ])
            ],
            'email' => [
                new Assert\NotBlank(['message' => 'Email is required']),
                new Assert\Email(['message' => 'Invalid email format'])
            ],
            'password' => [
                new Assert\NotBlank(['message' => 'Password is required']),
                new Assert\Length([
                    'min' => 6,
                    'minMessage' => 'Password must be at least 6 characters'
                ])
            ]
        ]);

        $violations = $this->validator->validate($data ?? [], $constraints);

        if (count($violations) > 0) {
            $errors = [];
            foreach ($violations as $violation) {
                $field = trim($violation->getPropertyPath(), '[]');
                $errors[$field] = $violation->getMessage();
            }
            return new JsonResponse(['errors' => $errors], Response::HTTP_BAD_REQUEST);
        }

        // Check if username already exists
        if ($this->userRepository->existsByUsername($data['username'])) {
            return new JsonResponse(
                ['errors' => ['username' => 'Username already taken']],
                Response::HTTP_CONFLICT
            );
        }

        // Check if email already exists
        if ($this->userRepository->existsByEmail($data['email'])) {
            return new JsonResponse(
                ['errors' => ['email' => 'Email already registered']],
                Response::HTTP_CONFLICT
            );
        }

        // Create user
        $user = User::create(
            Uuid::v4()->toRfc4122(),
            $data['username'],
            $data['email'],
            '' // Temporary, will be hashed below
        );

        // Hash password (need to create user first for hasher)
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);

        // Recreate user with hashed password
        $user = User::create(
            Uuid::v4()->toRfc4122(),
            $data['username'],
            $data['email'],
            $hashedPassword
        );

        $this->userRepository->save($user);

        return new JsonResponse([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $user->id(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail()
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse(['message' => 'Not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        return new JsonResponse([
            'id' => $user->id(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles()
        ]);
    }
}
