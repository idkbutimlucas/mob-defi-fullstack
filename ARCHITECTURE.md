# Architecture du projet Train Routing

Ce document décrit les choix techniques et l'architecture de la solution.

## Vue d'ensemble

```
                                 ARCHITECTURE
+------------------------------------------------------------------+
|                                                                   |
|   +----------+     +-----------+     +-----------+               |
|   | Frontend |---->|   Nginx   |---->|  Backend  |               |
|   | Vue 3    |     |  (proxy)  |     |  PHP 8.4  |               |
|   | Vuetify 3|     |  :443/80  |     |  Symfony  |               |
|   +----------+     +-----------+     +-----+-----+               |
|                                            |                      |
|   +----------+                       +-----v-----+               |
|   | Storybook|                       | PostgreSQL|               |
|   |  :6006   |                       |   :5432   |               |
|   +----------+                       +-----------+               |
+------------------------------------------------------------------+
```

## Stack technique

### Backend

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Langage | PHP 8.4 | Requis par le défi |
| Framework | Symfony 7.2 | Standard entreprise, architecture moderne |
| ORM | Doctrine 3 | Standard Symfony, migrations |
| Tests | PHPUnit 11 | Standard, coverage intégré |
| Linter | PHPCS (PSR-12) | Standard PSR |
| Analyse statique | PHPStan (level 8) | Détection bugs, typage strict |
| Auth | lexik/jwt-auth-bundle | JWT standard, refresh tokens |

### Frontend

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Framework | Vue.js 3.5 | Standard entreprise |
| UI Library | Vuetify 3 | Material Design, composants riches |
| Langage | TypeScript 5 | Requis, typage fort |
| Tests | Vitest | Rapide, API Jest-compatible |
| Linter | ESLint + Prettier | Standard industrie |
| UI Dev | Storybook 8 | Développement isolé des composants |
| State | Pinia | Standard Vue 3 |

### Infrastructure

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Containers | Docker 25 | Requis |
| Orchestration | Docker Compose | Simplicité, dev/prod |
| Base de données | PostgreSQL 16 | Robuste, standard entreprise |
| Reverse Proxy | Nginx | Performance, SSL, headers sécurité |
| CI/CD | GitHub Actions | Compatible GitLab CI |

## Architecture DDD (Backend)

### Bounded Contexts

```text
                         BOUNDED CONTEXTS
+---------------------------------------------------------------------+
|                                                                      |
|   +----------------+    +----------------+    +----------------+     |
|   |    ROUTING     |    |   ANALYTICS    |    |      AUTH      |     |
|   |    Context     |    |    Context     |    |    Context     |     |
|   +----------------+    +----------------+    +----------------+     |
|   | - Station      |    | - RouteRecord  |    | - User         |     |
|   | - Network      |    | - AnalyticCode |    | - Credentials  |     |
|   | - Route        |    | - Statistics   |    | - JWT Token    |     |
|   | - PathFinder   |    |                |    |                |     |
|   +-------+--------+    +--------+-------+    +--------+-------+     |
|           |                      |                     |             |
|           +----------+-----------+----------+----------+             |
|                      |                                               |
|           +----------v----------+                                    |
|           |   SHARED KERNEL     |                                    |
|           +---------------------+                                    |
|           | - StationId (VO)    |                                    |
|           | - Distance (VO)     |                                    |
|           | - AnalyticCode (VO) |                                    |
|           | - UuidGenerator     |                                    |
|           +---------------------+                                    |
+---------------------------------------------------------------------+
```

### Structure du code

```text
backend/src/
├── Routing/                          # Bounded Context: Routing
│   ├── Domain/
│   │   ├── Model/
│   │   │   ├── Station.php           # Entity
│   │   │   ├── Segment.php           # Value Object
│   │   │   ├── Network.php           # Aggregate Root
│   │   │   ├── Route.php             # Entity
│   │   │   └── PathResult.php        # Value Object
│   │   ├── Service/
│   │   │   └── PathFinderInterface.php
│   │   ├── Repository/
│   │   │   └── RouteRepositoryInterface.php
│   │   └── Exception/
│   │       ├── StationNotFoundException.php
│   │       └── NoRouteFoundException.php
│   │
│   ├── Application/
│   │   ├── Command/
│   │   │   └── CalculateRouteCommand.php
│   │   └── Query/
│   │       └── GetStationsQuery.php
│   │
│   └── Infrastructure/
│       ├── Algorithm/
│       │   └── DijkstraPathFinder.php
│       ├── Persistence/
│       │   ├── DoctrineRouteRepository.php
│       │   └── JsonNetworkLoader.php
│       └── Http/
│           ├── RouteController.php
│           └── StationController.php
│
├── Analytics/                        # Bounded Context: Analytics
│   ├── Domain/
│   │   ├── Model/
│   │   │   └── AnalyticDistance.php
│   │   └── Repository/
│   │       └── RouteRecordRepositoryInterface.php
│   │
│   ├── Application/
│   │   └── Query/
│   │       └── GetDistanceStatsQuery.php
│   │
│   └── Infrastructure/
│       ├── Persistence/
│       │   └── DoctrineRouteRecordRepository.php
│       └── Http/
│           └── StatsController.php
│
├── Auth/                             # Bounded Context: Auth
│   ├── Domain/
│   │   ├── Model/
│   │   │   └── User.php              # Entity (Doctrine)
│   │   └── Repository/
│   │       └── UserRepositoryInterface.php
│   │
│   └── Infrastructure/
│       ├── Persistence/
│       │   └── DoctrineUserRepository.php
│       └── Http/
│           ├── AuthController.php    # Login endpoint
│           ├── RegisterController.php # Registration
│           └── MeController.php      # Current user info
│
└── Shared/                           # Shared Kernel
    ├── Domain/
    │   ├── StationId.php             # Value Object
    │   ├── Distance.php              # Value Object
    │   └── AnalyticCode.php          # Value Object
    │
    └── Infrastructure/
        └── Uuid/
            └── RamseyUuidGenerator.php
```

## Algorithme de Dijkstra

Le calcul du plus court chemin utilise l'algorithme de Dijkstra :

1. Initialisation des distances à l'infini sauf la source à 0
2. File de priorité (min-heap) pour traiter les noeuds
3. Pour chaque noeud, mise à jour des distances des voisins
4. Reconstruction du chemin depuis la destination

Complexité : O((V + E) log V) avec V = stations, E = segments

## Sécurité

### Headers HTTP (nginx)

- `X-Frame-Options: SAMEORIGIN` - Protection clickjacking
- `X-Content-Type-Options: nosniff` - Pas de sniffing MIME
- `X-XSS-Protection: 1; mode=block` - Protection XSS legacy
- `Strict-Transport-Security` - HSTS, force HTTPS
- `Content-Security-Policy` - CSP restrictif
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - Désactive APIs sensibles

### Rate Limiting

- API (`/api/*`) : 10 req/s par IP, burst 20
- Général : 30 req/s par IP, burst 50

### Authentification

- JWT (lexik/jwt-auth-bundle)
- Clés RSA 4096 bits
- Token expiration configurable
- Endpoint `/api/v1/stations` public pour l'UI

### Système d'authentification

```text
                    FLUX D'AUTHENTIFICATION
+------------------------------------------------------------------+
|                                                                   |
|   ┌──────────┐    POST /login     ┌──────────┐                   |
|   │  Client  │ ─────────────────▶ │  Backend │                   |
|   │  (Vue)   │   username/pass    │  (PHP)   │                   |
|   └────┬─────┘                    └────┬─────┘                   |
|        │                               │                          |
|        │   ◀─────────────────────────  │                          |
|        │        JWT Token              │ Validation credentials   |
|        │                               │ + Génération JWT         |
|        │                               │                          |
|   ┌────▼─────┐    API Request     ┌────▼─────┐                   |
|   │  Pinia   │ ─────────────────▶ │  Routes  │                   |
|   │  Store   │  Authorization:    │ protégées│                   |
|   └──────────┘  Bearer <token>    └──────────┘                   |
|                                                                   |
+------------------------------------------------------------------+
```

**Endpoints d'authentification** :

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/v1/login` | POST | Connexion utilisateur | Non |
| `/api/v1/register` | POST | Inscription utilisateur | Non |
| `/api/v1/me` | GET | Infos utilisateur connecté | Oui |
| `/api/v1/stations` | GET | Liste des stations | Non |

**Sécurité des mots de passe** :
- Hashage avec `password_hash()` (bcrypt)
- Validation côté serveur (min 6 caractères)
- Pas de stockage en clair

## Architecture Frontend

### Structure des composants Vue

```text
frontend/src/
├── views/                    # Pages principales
│   ├── HomeView.vue          # Calcul de trajet
│   ├── StatsView.vue         # Statistiques
│   ├── LoginView.vue         # Connexion
│   └── SignupView.vue        # Inscription
│
├── stores/                   # État global (Pinia)
│   ├── auth.ts               # Authentification
│   └── stations.ts           # Cache des stations
│
├── api/                      # Couche API
│   └── client.ts             # Client HTTP typé
│
├── router/                   # Navigation
│   └── index.ts              # Routes + guards
│
└── stories/                  # Storybook
    ├── HomeView.stories.ts
    ├── StatsView.stories.ts
    ├── LoginView.stories.ts
    └── SignupView.stories.ts
```

### Gestion d'état avec Pinia

```text
┌─────────────────────────────────────────────────────────┐
│                      PINIA STORES                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐          ┌──────────────┐             │
│  │  Auth Store  │          │Stations Store│             │
│  ├──────────────┤          ├──────────────┤             │
│  │ - user       │          │ - stations   │             │
│  │ - token      │          │ - loading    │             │
│  │ - isLoading  │          │ - error      │             │
│  ├──────────────┤          ├──────────────┤             │
│  │ + login()    │          │ + fetch()    │             │
│  │ + logout()   │          │ + getById()  │             │
│  │ + register() │          │              │             │
│  └──────────────┘          └──────────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Storybook

Storybook est utilisé pour le développement isolé des composants :

- **HomeView** : Formulaire de calcul de trajet
- **StatsView** : Graphiques et tableau de statistiques
- **LoginView** : Formulaire de connexion
- **SignupView** : Formulaire d'inscription

Lancement : `make storybook` ou `npm run storybook`

## CI/CD Pipeline

```text
          LINT          TEST         SECURITY        BUILD
        +------+      +------+      +--------+     +--------+
        | PHPCS|      |PHPUnit|     | PHPStan|     | Docker |
        |ESLint|----->| Vitest|---->|npm audit|---->| images |
        |Prettier|    |Coverage|    | Trivy  |     |        |
        +------+      +------+      +--------+     +---+----+
                                                       |
                                               +-------v-------+
                                               |    RELEASE    |
                                               |               |
                                               | Push ghcr.io  |
                                               | Tag version   |
                                               +---------------+
```

### Workflows

- `backend.yml` - Tests, lint, coverage backend
- `frontend.yml` - Tests, lint, coverage frontend
- `docker.yml` - Build et test docker compose
- `release.yml` - Scan sécurité, build et push vers ghcr.io

### Seuils de qualité

- Coverage code : minimum 80%
- PHPStan level 8
- Trivy : pas de vulnérabilités CRITICAL/HIGH

## Décisions techniques notables

### Pourquoi Symfony ?

- Architecture moderne avec autowiring
- Écosystème riche (Doctrine, Security, Validator)
- Compatible avec l'approche DDD
- Standard dans l'entreprise

### Pourquoi Vuetify ?

- Composants Material Design prêts à l'emploi
- Accessibilité intégrée
- Thématisation facile
- Standard dans l'entreprise

### Pourquoi PostgreSQL ?

- Performances sur les requêtes complexes
- Types de données riches (JSON, arrays)
- Extensions disponibles (PostGIS si nécessaire)
- Fiabilité éprouvée

### Pourquoi Docker multi-stage ?

- Images de production légères
- Séparation dev/prod claire
- Cache des layers optimisé
- Sécurité (pas de devDependencies en prod)
