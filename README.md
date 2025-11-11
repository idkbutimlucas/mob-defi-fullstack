# 🚆 Défi Fullstack - Routage de Train & Statistiques

Ce projet est un exercice de recrutement. L’objectif est de démontrer tes compétences en conception, développement et déploiement d’une application complète (backend + frontend), avec une attention particulière portée à la qualité du code, la sécurité et l’automatisation.

---

## 🎯 Objectifs

- Implémenter un **backend PHP 8** exposant une API conforme à la spécification **OpenAPI** fournie.
- Développer un **frontend VueJS 3 + Vuetify 3 + TypeScript** consommant cette API.
- Fournir une **couverture de code** mesurable (tests unitaires et d’intégration).
- Déployer l’application avec un minimum d’opérations via **Docker** ou **Docker Compose**.
- Mettre en place un **pipeline CI/CD complet** (build, tests, coverage, lint, déploiement).
- Utiliser un **versioning de code** clair et structuré.
- Garantir des **communications sécurisées** (HTTPS, gestion des secrets, authentification).

---

## 🏗️ Architecture attendue

- **Backend (PHP 8)**  
  - Framework au choix (Symfony, Slim, Laravel, etc.).  
  - Implémentation stricte de l’API OpenAPI dictée.  
  - Base de données (MongoDb, PostgreSQL ou MySQL).  
  - Tests avec PHPUnit + rapport de couverture.  

- **Frontend (VueJS 3 + Vuetify 3 + TypeScript)**  
  - Interface utilisateur pour :  
    - Créer un trajet (station A → station B, code analytique).  
    - Visualiser les distances parcourues.  
    - Consulter les statistiques par code analytique.  
  - Tests avec Vitest/Jest + rapport de couverture.  

- **Infrastructure**  
  - Docker/Docker Compose pour orchestrer backend, frontend, base de données et reverse proxy.  
  - Déploiement en une commande (`docker compose up -d`).  

---

## ⚙️ Installation & Démarrage

### Prérequis
- Docker & Docker Compose
- Node.js 22+
- PHP 8.4

### Ce qu'on attend
- L'accès au repository du code source, y compris l'historique
- Un projet prêt à déployer, au format que tu préfères: image docker, release github, ...
- Les instructions de déploiement

## CI/CD complet - Objectifs
- Build: images backend/frontend
- Qualité: lint + tests + coverage (fail si seuils non atteints)
- Sécurité: SAST/DAST (ex: phpstan, npm audit, Trivy)
- Release: tagging sémantique, changelog
- Delivery: push images vers registry, déploiement automatisé (Compose ou SSH)

## Notes sur le domaine
- Routage: Implémentez un algorithme de plus court chemin (Dijkstra) sur le graphe des stations
- Distances: Sommez distance_km des arêtes du chemin.
- Analytique: Persistez le analytic_code pour chaque trajet et servez des agrégations par période.
- Bonus DATA: Exposez un endpoint de statistiques et un écran frontend de visualisation (graph/bar).

## Bonus
- Implémenter un algorithme de routage (ex. Dijkstra) pour calculer la distance entre deux stations.
- Exposer un endpoint de statistiques agrégées par code analytique.
- Visualiser ces statistiques dans le frontend (graphique/tableau).

## Critères d’évaluation
- Couverture: rapports générés et seuils respectés
- OpenAPI: conformité stricte des endpoints et schémas
- Docker: démarrage en une ou deux commandes, documentation claire
- Frontend: UX propre, typé en TypeScript, tests présents
- CI/CD: pipeline fiable, scans basiques de sécurité, images publiées
- Sécurité: HTTPS, auth, headers, gestion des secrets
- Qualité: code lisible, commits structurés, architecture cohérente
