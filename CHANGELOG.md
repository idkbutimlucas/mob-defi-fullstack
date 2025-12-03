# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/lang/fr/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation Phase 7 (README, ARCHITECTURE.md, CHANGELOG.md)

## [1.0.0] - 2024-12-03

### Added

#### Phase 1 - Modélisation DDD
- Bounded Contexts : Routing et Analytics
- Value Objects : StationId, Distance, AnalyticCode
- Entities : Station, Route
- Aggregate : Network
- Glossaire métier (GLOSSARY.md)

#### Phase 2 - Infrastructure Docker
- Docker Compose avec 5 services (backend, frontend, storybook, db, nginx)
- Dockerfiles multi-stage pour backend et frontend
- Configuration nginx avec SSL et reverse proxy
- Volumes nommés pour persistance

#### Phase 3 - Backend TDD
- API REST conforme OpenAPI 3.1
- Algorithme de Dijkstra pour le calcul de routes
- Tests unitaires et d'intégration (PHPUnit)
- Authentification JWT (lexik/jwt-auth-bundle)
- Endpoints :
  - `GET /api/v1/stations` - Liste des stations
  - `POST /api/v1/routes` - Calcul de trajet
  - `GET /api/v1/stats/distances` - Statistiques agrégées
- PHPStan level 8
- PHPCS PSR-12

#### Phase 4 - Frontend TDD + Storybook
- Vue.js 3 + Vuetify 3 + TypeScript
- Composants UI avec stories Storybook
- Tests Vitest avec coverage
- Pinia pour le state management
- Formulaire de calcul de trajet
- Affichage des résultats et statistiques

#### Phase 5 - Sécurité
- HTTPS avec certificats auto-signés
- Headers de sécurité (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting nginx (10 req/s API, 30 req/s général)
- Permissions-Policy header
- Validation des secrets (.gitignore)

#### Phase 6 - CI/CD Pipeline
- GitHub Actions workflows :
  - `backend.yml` - Tests, lint, coverage backend
  - `frontend.yml` - Tests, lint, coverage frontend
  - `docker.yml` - Build et test docker compose
  - `release.yml` - Scan sécurité et push ghcr.io
- Scans de sécurité :
  - Trivy (vulnérabilités containers)
  - composer audit
  - npm audit
- Seuils de coverage (80%)
- Versioning calendaire (YYYY.MM.DD-SHA)

### Fixed
- Permissions du répertoire var backend en CI
- Création du schéma de base de données en CI
- Noms des fichiers SSL (cert.pem/key.pem)
- Installation des dépendances avant docker-compose

## Types de changements

- `Added` pour les nouvelles fonctionnalités
- `Changed` pour les changements de fonctionnalités existantes
- `Deprecated` pour les fonctionnalités qui seront supprimées
- `Removed` pour les fonctionnalités supprimées
- `Fixed` pour les corrections de bugs
- `Security` pour les corrections de vulnérabilités
