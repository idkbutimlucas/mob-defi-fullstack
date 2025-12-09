# Journal de bord du projet

Ce document retrace mon parcours sur ce defi technique. J'ai voulu etre transparent sur ma demarche, mes reflexions et les choix que j'ai faits a chaque etape.

---

## Qui suis-je ?

Je suis recemment diplome d'un Master 2 "Expert Systemes d'Information". Pendant mes trois annees d'alternance, j'ai travaille principalement avec PHP natif et Symfony, mis en place des pipelines CI/CD avec GitLab, et contenerise des applications avec Docker. Cette experience m'a donne une vision concrete du developpement en contexte professionnel.

---

## Ma lecture du defi

En lisant l'enonce, une phrase m'a particulierement marque :

> *"Nous ne cherchons pas la perfection : nous voulons voir ta capacite a t'approprier un contexte technique exigeant."*

J'ai compris que MOB cherchait quelqu'un capable de s'integrer dans une equipe existante, de comprendre ses pratiques, et de produire du travail qui s'inscrit dans une continuite. J'ai donc aborde ce defi comme si je rejoignais l'equipe pour ma premiere semaine.

---

## Deroulement du projet

### Phase 1 : Analyse et modelisation du domaine

**Premiere etape : comprendre les donnees**

Avant d'ecrire du code, j'ai passe du temps a analyser les fichiers `stations.json` et `distances.json`. J'ai rapidement compris que :

- Le reseau forme un graphe avec des stations comme noeuds
- Les distances entre stations sont les aretes du graphe
- Certaines lignes se connectent entre elles (MOB et MVR-ce partagent des stations)
- C'est un probleme classique de plus court chemin

**Choix de l'architecture DDD**

J'ai identifie trois domaines metier distincts :

1. **Routing** : Gestion du reseau, des stations, et calcul des trajets
2. **Analytics** : Agregation des statistiques par code analytique
3. **Auth** : Gestion des utilisateurs et authentification

Cette separation en Bounded Contexts n'etait pas obligatoire, mais elle rend le code plus lisible et facilite les evolutions futures. Un nouveau developpeur peut rapidement comprendre ou se trouve chaque responsabilite.

**Commit associe** : `feat(backend): modelisation DDD du domaine`

---

### Phase 2 : Infrastructure Docker

**Mise en place de l'environnement**

J'ai configure Docker Compose avec quatre services :

- **nginx** : Reverse proxy avec HTTPS et headers de securite
- **backend** : PHP-FPM 8.4 avec Symfony
- **frontend** : Vite dev server pour Vue.js
- **database** : PostgreSQL 16

J'ai choisi PostgreSQL plutot que MariaDB car c'est une base que je connais bien et qui offre d'excellentes performances sur les requetes d'agregation (utiles pour les statistiques).

**Securite des le depart**

Des cette phase, j'ai configure nginx avec :
- Certificats SSL auto-signes pour HTTPS
- Headers de securite (CSP, X-Frame-Options, HSTS)
- Rate limiting sur les endpoints API

**Commit associe** : `feat(infra): infrastructure Docker complete`

---

### Phase 3 : Backend TDD

**Approche Test-Driven Development**

J'ai developpe le backend en suivant le cycle TDD :
1. Ecrire un test qui echoue
2. Implementer le minimum pour le faire passer
3. Refactoriser

Cette approche m'a force a bien definir les interfaces avant l'implementation.

**L'algorithme de Dijkstra**

Pour le calcul des trajets, j'ai implemente l'algorithme de Dijkstra. J'aurais pu utiliser un simple BFS (recherche en largeur), mais Dijkstra garantit de trouver le chemin le plus court en distance, pas juste le chemin avec le moins d'etapes.

J'ai utilise `SplPriorityQueue` de PHP pour optimiser les performances. Les tests couvrent :
- Chemins directs entre stations adjacentes
- Chemins via plusieurs stations intermediaires
- Cas d'erreur (station inexistante, pas de chemin possible)

**Conformite OpenAPI**

J'ai veille a respecter strictement la specification OpenAPI fournie. Les endpoints `/api/v1/routes` et `/api/v1/stations` correspondent exactement aux schemas definis.

**Commits associes** :
- `feat(backend): implementation TDD complete du backend`
- PR #1

---

### Phase 4 : Frontend Vue.js

**Stack technique**

J'ai utilise Vue 3 avec Vuetify 3 comme demande dans l'enonce. TypeScript est configure en mode strict pour beneficier du typage fort.

**Tests Vitest**

Chaque vue a ses tests unitaires :
- `HomeView` : Formulaire de calcul, validation, affichage des resultats
- `StatsView` : Graphiques Chart.js, tableau de donnees

**Storybook**

J'ai integre Storybook pour developper les composants de maniere isolee. Ca permet de visualiser chaque etat d'un composant (chargement, erreur, succes) sans avoir besoin de lancer toute l'application.

**Commit associe** : `feat(frontend): Phase 4 - Tests TDD et Storybook`

---

### Phase 5 : CI/CD

**GitHub Actions**

J'ai mis en place quatre workflows :

1. **backend.yml** : Tests PHPUnit, PHPCS, PHPStan level 8
2. **frontend.yml** : Tests Vitest, ESLint, Prettier
3. **docker.yml** : Build et test de l'integration Docker
4. **release.yml** : Scan de securite et push vers ghcr.io

J'aurais pu utiliser GitLab CI (que je connais mieux grace a mon alternance), mais GitHub Actions est parfaitement adapte et la logique est transposable.

**Seuils de qualite**

- Coverage minimum : 80%
- PHPStan : niveau 8 (le plus strict)
- Trivy : echec sur vulnerabilites CRITICAL ou HIGH

**Commits associes** :
- `feat(ci): ajout GitHub Actions CI/CD`
- Plusieurs PR de corrections (#4, #5, #6, #7)

---

### Phase 6 : Securite renforcee

**Headers de securite**

J'ai active dans nginx :
- Content-Security-Policy restrictive
- Permissions-Policy (desactive camera, micro, geolocation)
- Rate limiting plus agressif

**Scan de securite automatise**

J'ai ajoute un workflow dedie avec Trivy pour scanner :
- Les images Docker
- Le filesystem pour les secrets exposes
- Les dependances vulnerables

**Commit associe** : `feat(security): enable rate limiting and add Permissions-Policy header`

---

### Phase 7 : Documentation

J'ai redige les documents principaux :
- **ARCHITECTURE.md** : Choix techniques et structure du code
- **CHANGELOG.md** : Historique des modifications
- **README.md** : Instructions de deploiement

**Commit associe** : `docs: Phase 7 - Documentation finale`

---

### Phase 8 : Design moderne

**Identite visuelle MOB**

J'ai voulu que l'interface ressemble a ce qu'on pourrait trouver sur le site officiel du MOB :
- Logo officiel integre
- Couleurs de la charte (bleu #001f78, rose #e6007e)
- Design sobre et professionnel

**Enrichissement du detail des trajets**

J'ai decide d'enrichir la reponse de l'API pour inclure non seulement la distance totale, mais aussi le detail du parcours avec chaque station traversee et la distance de chaque segment. C'est une extension du format, pas une rupture.

**Commits associes** :
- `feat(ui): modern railway-inspired design with MOB branding`
- `feat(ui): enhanced route display with segment distances`

---

### Phase 9 : Authentification complete

**JWT Authentication**

J'ai implemente l'authentification JWT avec `lexik/jwt-auth-bundle`. Les cles RSA 4096 bits sont generees automatiquement par le Makefile.

**Systeme d'inscription**

Plutot qu'un simple utilisateur en dur, j'ai cree un systeme complet :
- Endpoint `/api/v1/register` pour l'inscription
- Validation des donnees cote serveur
- Hashage des mots de passe avec bcrypt
- Persistance des utilisateurs en base

**Pages Login/Signup**

Le frontend a ses pages d'authentification avec :
- Formulaires valides
- Gestion des erreurs
- Redirection apres connexion

**Commits associes** :
- `feat(auth): implement JWT authentication for protected endpoints`
- `feat(auth): add user authentication with login/signup pages`

---

### Phase 10 : Ameliorations continues

**Integration Codecov**

J'ai integre Codecov pour visualiser la couverture de code avec des badges dans le README.

**Couverture a 80%+**

J'ai ameliore les tests pour atteindre :
- Backend : 81% de couverture
- Frontend : 98% de couverture

**Corrections UX**

- L'endpoint `/stations` est maintenant public pour que le formulaire fonctionne sans connexion
- Redirection vers login quand on tente d'acceder a une fonctionnalite protegee
- Logo cliquable pour revenir a l'accueil

---

## Ce que ce projet m'a appris

### Competences approfondies

| Technologie | Avant le projet | Ce que j'ai appris |
|-------------|-----------------|---------------------|
| PHPStan level 8 | Jamais utilise a ce niveau | Rigueur du typage strict, gestion des nullables |
| Vuetify 3 | Connaissais Vue, pas Vuetify | Systeme de composants Material Design |
| Trivy | Ne connaissais pas | Scan de vulnerabilites sur images Docker |
| Storybook | Utilise basiquement | Stories interactives, mocking des API |

### Reflexions personnelles

- Je suis plus efficace quand je prends le temps de reflechir avant de coder (J'aime ecrire sur un bloc-notes les architectures ainsi que des notes pertinentes)
- Le TDD m'a aide a bien definir les interfaces
- Documenter mes choix m'oblige a les justifier

---

## Si j'avais plus de temps

1. **Swagger UI** : Documentation interactive de l'API
2. **Tests E2E avec Cypress** : Validation des parcours utilisateurs complets
3. **Carte interactive** : Visualiser le reseau MOB sur une carte
4. **Cache Redis** : Optimiser les calculs de trajets frequents
5. **Internationalisation** : Support FR/DE/EN
6. **Gestion de Profil Utilisateur** : Personnalisation et gestion du profil utilisateur

---

*Lucas - Decembre 2025*