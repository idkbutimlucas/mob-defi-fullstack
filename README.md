# 🚆 Défi Full stack - Routage de Train & Statistiques

Bienvenue dans notre défi technique !  
Avant même l’envoi de ton CV, nous te proposons de passer par cette étape pratique. Pourquoi ? Parce que nous croyons que **le code parle plus fort que les mots**.

Ce défi est ton ticket d’entrée : il te permet de nous montrer l’étendue de tes capacités à **collaborer, analyser et livrer du code de qualité**. Tu le réalises chez toi, dans ton environnement, avec tes outils, mais l’objectif est de voir comment tu t’adaptes à notre culture technique et à nos pratiques **DevSecOps**.

---

## 🤝 Esprit du défi
Ce défi est autant une **démonstration de tes compétences** qu’une **simulation de collaboration** dans notre environnement.  
Nous ne cherchons pas la perfection : nous voulons voir ta capacité à t’approprier un contexte technique exigeant, à produire du code de qualité et à réfléchir comme un membre de l’équipe.

Tu es invité à démontrer ta capacité à :
- Travailler avec des outils similaires aux nôtres (**Docker, Composer, GitLab, PHPUnit**, etc.)
- Appliquer des pratiques comme **l’analyse statique**, le **TDD**, le **DDD** et l’**intégration/déploiement continus**
- Produire un code **propre, maintenable et réfléchi**, comme si tu faisais déjà partie de l’équipe

> 💡 Conseil : documente tes choix, structure ton code et montre-nous comment tu raisonnes. C’est tout aussi important que le résultat final.

---

## 🧩 Notre environnement
Nous produisons des applications web modernes, sécurisées et performantes, en utilisant principalement :
- **Backend** : PHP 8 (Symfony 7 et CakePHP 5)
- **Frontend** : Vue.js 3 + Vuetify 3 + TypeScript
- **Tests** : PHPUnit, Vitest, Jest
- **Linter** : PHPCS, ESLint, Prettier
- **UI/UX** : Storybook
- **Base de données** : PostgreSQL ou MariaDB
- **Infrastructure** : Docker, Docker Compose, TeamCity (CI/CD), Gitlab (code versioning)
- **Méthodologies** : TDD, DDD, XP

> 💡 Conseil : inspire-toi de nos pratiques et de nos outils.

---

# 🧾 Instructions pour réaliser le défi
Tu dois réaliser une solution à minimum deux niveaux. Un backend PHP 8 exposant une API REST conforme à la spécification OpenAPI fournie ainsi qu'un frontend TypeScript consommant cette API.

## Le contexte
Dans le métier de la circulation ferroviaire, les trajets de chaque train sont répertoriés dans un système de gestion du trafic. Un train circule sur une ligne, ces lignes sont parfois connectées, permettant à un train de circuler sur plusieurs lignes.
Chaque trajet est associé à un code analytique, qui permet de catégoriser le type de trajet (ex : fret, passager, maintenance, etc.).
Les données de statistiques générées sont ensuite utilisées pour diverses analyses.

## Le besoin métier
La solution doit permettre à l'utilisateur de calculer une distance entre deux stations de train. La liste des stations ainsi que les distances entre les stations sont fournies dans les fichiers `stations.json` et `distances.json`.

Tu peux choisir de persister les saisies des utilisateurs, cela t'aidera à compléter les points Bonus (voir ci-dessous), mais ce n'est pas obligatoire.

Il se peut que tu aies des questions ou des incertitudes sur la compréhension du besoin, dans ce cas, tu es libre de faire des hypothèses raisonnables et de les documenter.

> 💡 Conseil : applique le principe fondamental de [qualité du craftsmanship](https://fr.wikipedia.org/wiki/Software_craftsmanship#Fondamentalement_:_un_retour_non_r%C3%A9f%C3%A9renc%C3%A9_%C3%A0_XP).

## Livrables attendus
Lorsque tu as terminé, envoie à n.girardet[at]mob[point]ch, ton dossier de candidature complet ainsi qu'un lien vers le projet contenant :
- Le projet prêt à déployer, au format que tu préfères : un repo GitHub avec un docker-compose, une image publiée dans un registre, un fichier zip dans une release GitHub...
- Les instructions de déploiement claires
- L'accès au repository du code source, y compris l'historique des commits

> ⚠️ Assure-toi qu'un lien vers ton projet est visible et actif dans ton e-mail. 👉 Nous ne traiterons pas les dossiers de candidatures avant d'avoir vu le code.

## ⏳ Durée du défi

Tu n’as aucune limite de temps pour réaliser ce défi. Avance à ton rythme, prends le temps de réfléchir et de coder comme tu le souhaites. Ce repository restera ouvert tant que nous n’aurons pas trouvé la bonne personne pour rejoindre l’équipe. Une fois que ce sera le cas, nous le fermerons.

> 💡 Même si la vitesse n’est pas un critère, nous examinerons les candidatures dans l’ordre où elles nous parviennent.

## Et après ?
Nous procéderons à une revue de ton code et nous te contacterons pour t'informer de la suite.

> 🚫 N'envoie pas de fichiers volumineux (ex : 30 Mo) par e-mail

---

## 🎯 Objectifs

- Implémenter un **backend PHP 8** exposant une API conforme à la spécification **OpenAPI** fournie.
- Développer un **frontend TypeScript** consommant cette API.
- Fournir une **couverture de code** mesurable (tests unitaires et d’intégration).
- Déployer l’application avec un minimum d’opérations via **Docker** ou **Docker Compose**.
- Mettre en place un **pipeline CI/CD complet** (build, tests, coverage, lint, déploiement).
- Utiliser un **versioning de code** clair et structuré.
- Garantir des **communications sécurisées** (HTTPS, gestion des secrets, authentification).

---

## 🏗️ Architecture attendue

- **Backend**  
  - PHP 8.4 obligatoire.
  - Utilisation d'un Framework (Symfony, CakePHP, Slim, Laravel,...) facultatif.  
  - Implémentation stricte de l’API OpenAPI fournie.  
  - Tests avec PHPUnit + rapport de couverture.  

- **Frontend**
  - TypeScript 5 obligatoire.
  - Interface utilisateur pour :  
    - Créer un trajet (station A → station B) + type de trajet.  
    - Consulter les statistiques par code analytique.
  - Tests avec Vitest/Jest + rapport de couverture.

- **Infrastructure** 
  - Docker Engine 25
  - Docker/Docker Compose pour orchestrer backend, frontend, base de données et reverse proxy (si nécessaire).  
  - Déploiement en une commande (`docker compose up -d`).  

> 💡 Conseil : documente tes choix dans une documentation.

---

## 🔄 CI/CD complet

Voici notre point de vue de la représentation d'un CI/CD complet :
- Build : images backend/frontend
- Qualité : lint + tests + coverage (fail si seuils non atteints)
- Sécurité : SAST/DAST (ex: phpstan, npm audit, Trivy)
- Release : tagging sémantique ou calendaire, changelog
- Delivery : push images vers registry, déploiement automatisé (Compose ou SSH)

## 🤖 Code généré par IA

Tu es libre d’utiliser les outils qui te semblent les plus adaptés pour réaliser ce défi. Cela inclut bien sûr le code généré par des intelligences artificielles. Nous savons que ces outils font partie du quotidien des développeurs, et nous voulons voir comment tu es capable de les intégrer intelligemment dans ta solution.

## 🎁 Les points Bonus
- Implémenter un algorithme de routage (ex. Dijkstra) pour calculer la distance entre deux stations.
- Exposer un endpoint de statistiques agrégées par code analytique.
- Visualiser ces statistiques dans le frontend (graphique/tableau).

## ✅ Critères d’évaluation
- Couverture : rapports générés et seuils respectés
- OpenAPI : conformité stricte des endpoints et schémas
- Docker : démarrage en une ou deux commandes, documentation claire
- Frontend : UX propre, typé en TypeScript, tests présents
- CI/CD : pipeline fiable, scans basiques de sécurité, images publiées
- Sécurité : HTTPS, auth, headers, gestion des secrets
- Qualité : code lisible, commits atomiques, architecture cohérente

---
## 🚀 À toi de jouer !
Nous avons hâte de découvrir ta solution et de voir comment tu abordes ce défi.
Bonne chance, et surtout amuse-toi en codant !

---

# 💡 Ma Solution

## À propos de ma démarche

En abordant ce défi, j'ai voulu démontrer non seulement mes compétences techniques, mais aussi ma façon de réfléchir et de structurer un projet professionnel. Fraîchement diplômé d'un Master 2 en informatique, j'ai cherché à appliquer les bonnes pratiques que j'ai apprises tout en m'adaptant aux outils et méthodologies mentionnés dans l'énoncé.

Mon objectif principal était de livrer une solution qui pourrait être mise en production sans modifications majeures, tout en gardant un code lisible et maintenable par une équipe.

---

## 🧠 Mon raisonnement et mes choix techniques

### Pourquoi Symfony 7 ?

J'ai choisi Symfony pour plusieurs raisons. D'abord, c'est un framework que vous utilisez en interne, ce qui me semblait pertinent pour démontrer ma capacité à m'intégrer rapidement dans votre environnement. Ensuite, Symfony offre une architecture solide qui se prête naturellement au Domain-Driven Design grâce à son système d'autowiring et son découplage des composants.

J'aurais pu opter pour une approche plus légère avec Slim ou même du PHP natif, mais j'ai préféré montrer ma maîtrise d'un framework complet, avec tout ce que cela implique en termes de configuration, de conventions et de bonnes pratiques.

### Pourquoi le Domain-Driven Design ?

Le DDD n'était pas obligatoire, mais j'ai fait ce choix délibérément. Le domaine métier du défi (réseau ferroviaire, trajets, codes analytiques) se prête parfaitement à cette approche. En structurant le code en Bounded Contexts (Routing, Analytics, Auth) et en utilisant des Value Objects pour les concepts clés (StationId, Distance, AnalyticCode), j'ai voulu montrer que je ne me contente pas de "faire fonctionner" le code, mais que je réfléchis à sa maintenabilité sur le long terme.

Cette architecture permet à un nouveau développeur de comprendre rapidement où se trouve chaque responsabilité et facilite l'ajout de nouvelles fonctionnalités sans risquer de casser l'existant.

### L'algorithme de Dijkstra

Pour le calcul des trajets, j'ai implémenté l'algorithme de Dijkstra plutôt qu'une simple recherche en largeur (BFS). Même si BFS aurait suffi pour trouver un chemin, Dijkstra garantit de trouver le plus court chemin en termes de distance kilométrique, ce qui est essentiel dans un contexte ferroviaire où les coûts et les temps de trajet dépendent des distances.

J'ai utilisé une `SplPriorityQueue` de PHP pour optimiser les performances. L'implémentation est accompagnée de 9 tests unitaires couvrant tous les cas : chemins directs, chemins via plusieurs stations, cas d'erreur, réseaux complexes avec plusieurs routes possibles.

### La gestion de l'authentification

J'ai implémenté un système d'authentification complet avec inscription et connexion des utilisateurs, alors que ce n'était pas explicitement demandé. Mon raisonnement : dans un contexte réel, on ne déploierait jamais une API avec un simple utilisateur en mémoire. J'ai donc créé une entité User avec Doctrine, un système d'inscription avec validation, et la persistance des utilisateurs en base de données.

Cela m'a également permis de démontrer ma compréhension du système de sécurité de Symfony et de l'intégration JWT.

---

## 🔍 Les défis rencontrés et comment je les ai résolus

### Configuration des tests avec Doctrine

L'un des défis a été de faire cohabiter les tests unitaires (qui n'ont pas besoin de base de données) avec les tests fonctionnels (qui en ont besoin). J'ai résolu ce problème en configurant SQLite en mémoire pour l'environnement de test, ce qui permet des tests rapides tout en validant les interactions avec la base de données.

### Le réseau ferroviaire bidirectionnel

Les données fournies dans `distances.json` représentent des segments unidirectionnels, mais un train peut évidemment circuler dans les deux sens. J'ai donc implémenté le `JsonNetworkLoader` pour créer automatiquement les connexions bidirectionnelles, tout en m'assurant que les distances restent cohérentes dans les deux directions.

### L'interface utilisateur MOB

J'ai voulu créer une interface qui ressemble à ce qu'on pourrait trouver sur le site officiel du MOB. J'ai donc intégré le logo officiel et adopté une charte graphique sobre avec le bleu MOB (#001f78) et le rose accent (#e6007e). L'objectif était de montrer que je peux m'adapter à une identité visuelle existante.

---

## 📊 Ce que j'ai appris

Ce défi m'a permis d'approfondir plusieurs aspects :

- **PHPStan au niveau 8** : C'est la première fois que je configure PHPStan au niveau maximum. Cela m'a forcé à être rigoureux sur le typage et à anticiper les cas null.

- **GitHub Actions** : J'avais l'habitude de GitLab CI, mais j'ai découvert que GitHub Actions offre une syntaxe différente mais tout aussi puissante. La migration vers TeamCity serait relativement simple car la logique reste la même.

- **Trivy pour le scan de conteneurs** : C'est un outil que je ne connaissais pas et que j'intégrerai désormais systématiquement dans mes pipelines.

---

## 🎯 Si j'avais plus de temps

Voici ce que j'ajouterais pour aller plus loin :

1. **Swagger UI** : Un endpoint `/api/docs` pour visualiser et tester l'API de manière interactive.

2. **Tests E2E avec Cypress** : Pour valider les parcours utilisateurs complets du frontend.

3. **Carte interactive** : Visualiser le réseau MOB sur une carte avec les trajets calculés.

4. **Historique des trajets** : Permettre aux utilisateurs de consulter leurs recherches passées.

---

# 📦 Instructions de déploiement

## Prérequis

- Docker Engine 25+
- Docker Compose v2+
- OpenSSL (pour générer les certificats)

## Déploiement rapide

```bash
# 1. Cloner le repository
git clone https://github.com/idkbutimlucas/mob-defi-fullstack.git
cd mob-defi-fullstack

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Générer les certificats SSL (auto-signés pour dev)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=localhost"

# 4. Générer les clés JWT
mkdir -p backend/config/jwt
openssl genpkey -algorithm RSA -out backend/config/jwt/private.pem -pkeyopt rsa_keygen_bits:4096
openssl rsa -pubout -in backend/config/jwt/private.pem -out backend/config/jwt/public.pem

# 5. Lancer l'application
docker compose up -d

# 6. Créer le schéma de base de données
docker compose exec backend php bin/console doctrine:schema:create

# 7. (Optionnel) Lancer Storybook
docker compose --profile dev up -d storybook
```

L'application est accessible sur :
- **Frontend** : https://localhost
- **API** : https://localhost/api/v1
- **Storybook** : http://localhost:6006

## Authentification API

L'API utilise JWT. Un utilisateur par défaut est configuré :

```bash
# Obtenir un token JWT
curl -sk -X POST https://localhost/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"api","password":"'"$API_USER_PASSWORD"'"}'
```

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/stations` | Liste des stations (public) |
| POST | `/api/v1/routes` | Calculer un trajet (auth requise) |
| GET | `/api/v1/stats/distances` | Statistiques agrégées (auth requise) |

## Structure du projet

```
mob-defi-fullstack/
├── backend/          # API PHP 8.4 / Symfony 7
├── frontend/         # Vue.js 3 / Vuetify 3 / TypeScript
├── nginx/            # Reverse proxy HTTPS
├── data/             # Données stations/distances
├── .github/workflows # CI/CD GitHub Actions
├── openapi.yml       # Spécification API
└── docker-compose.yml
```

## Tests

```bash
# Tests backend (PHPUnit)
docker compose exec backend composer test

# Tests frontend (Vitest)
docker compose exec frontend npm run test

# Linting
docker compose exec backend composer lint
docker compose exec frontend npm run lint
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Choix techniques et architecture
- [CHANGELOG.md](./CHANGELOG.md) - Historique des modifications
- [openapi.yml](./openapi.yml) - Spécification API OpenAPI 3.1
