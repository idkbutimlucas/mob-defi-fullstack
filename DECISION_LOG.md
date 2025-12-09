# Journal de decisions — Mon parcours sur ce defi

> Ce document retrace ma reflexion tout au long du projet. Plutot qu'une documentation technique froide, j'ai voulu partager comment j'ai aborde ce defi, les questions que je me suis posees, et les choix que j'ai faits — y compris ceux qui m'ont fait hesiter.

---

## Qui suis-je ?

Je suis recemment diplome d'un Master 2 "Expert Systemes d'Information". Pendant mes trois annees d'alternance, j'ai travaille principalement avec PHP natif et Symfony, mis en place des pipelines CI/CD, et contenerise des applications avec Docker. Cette experience m'a donne une vision concrete du developpement en contexte professionnel — pas juste du code qui marche, mais du code qui doit etre maintenu par une equipe, deploye en production, et qui evolue dans le temps.

---

## Ma philosophie sur ce defi

En lisant l'enonce, une phrase m'a particulierement marque :

> *"Nous ne cherchons pas la perfection : nous voulons voir ta capacite a t'approprier un contexte technique exigeant."*

J'ai compris que MOB ne cherchait pas quelqu'un qui livre du code parfait en isolation, mais quelqu'un capable de **s'integrer dans une equipe existante**, de comprendre ses pratiques, et de produire du travail qui s'inscrit dans une continuite.

J'ai donc aborde ce defi comme si je rejoignais l'equipe pour ma premiere semaine : observer l'environnement technique, comprendre les conventions, et proposer une solution qui pourrait etre revue et amelioree par des collegues.

---

## Comment j'ai utilise l'IA dans ce projet

Je prefere etre transparent sur ce point car le defi le permet explicitement. J'ai utilise Claude Code pour m'assister dans le developpement, et je pense que c'est important d'expliquer **comment** et **pourquoi**.

### Ma conviction

A l'ere des outils IA, la valeur ajoutee d'un developpeur ne reside plus uniquement dans sa capacite a ecrire du code ligne par ligne. Elle se situe dans :

- **La comprehension globale** d'un projet et de ses enjeux
- **Les choix d'architecture** et leur justification
- **La capacite a structurer des instructions claires** pour produire un resultat coherent
- **L'esprit critique** pour valider, ajuster et ameliorer le code genere
- **La vision metier** pour s'assurer que la solution repond vraiment au besoin

### Comment j'ai pilote l'IA

Je n'ai pas simplement demande "fais-moi une API de routage de trains". J'ai procede de maniere iterative :

1. **Analyse prealable** : J'ai d'abord lu l'enonce plusieurs fois, analyse les fichiers `stations.json` et `distances.json`, et compris la structure du reseau ferroviaire.

2. **Definition de l'architecture** : Avant de generer du code, j'ai decide de l'architecture globale (DDD, bounded contexts, choix de Symfony). C'est moi qui ai fait ces choix, pas l'IA.

3. **Instructions structurees** : Pour chaque partie du projet, j'ai fourni des instructions precises incluant :
   - Le contexte metier
   - Les contraintes techniques (PHP 8.4, PSR-12, PHPStan level 8)
   - Les patterns a suivre (Value Objects, Repository pattern)
   - Les cas limites a gerer

4. **Revue et ajustement** : Chaque morceau de code genere a ete relu, teste, et souvent ajuste. Par exemple, j'ai du corriger plusieurs fois la gestion des chemins bidirectionnels dans l'algorithme de Dijkstra.

5. **Integration coherente** : J'ai veille a ce que toutes les parties s'assemblent de maniere coherente, avec des conventions de nommage uniformes et une architecture respectee partout.

### Ce que j'ai appris

Piloter une IA pour produire du code de qualite professionnelle demande paradoxalement une **bonne maitrise technique**. Il faut savoir quoi demander, comment le formuler, et surtout etre capable de reconnaitre quand le resultat n'est pas satisfaisant.

C'est un skill que je pense important pour l'avenir du developpement, et ce projet m'a permis de le pratiquer intensivement.

---

## Hypotheses metier

Le defi mentionnait : *"tu es libre de faire des hypotheses raisonnables et de les documenter"*. Voici les miennes :

### Hypothese 1 : Les trajets sont bidirectionnels

**Contexte** : Le fichier `distances.json` contient des segments comme `"Montreux -> Les Avants: 8.2 km"`, mais pas necessairement le trajet inverse.

**Mon hypothese** : Un train peut circuler dans les deux sens sur une meme voie. La distance de A vers B est identique a celle de B vers A.

**Implementation** : Le `JsonNetworkLoader` cree automatiquement les connexions dans les deux directions.

**Justification** : C'est le comportement attendu pour un reseau ferroviaire classique. Si certaines lignes etaient a sens unique (ce qui existe pour certaines voies de service), je m'attendrais a ce que ce soit explicitement indique dans les donnees.

### Hypothese 2 : Les codes analytiques sont libres

**Contexte** : L'enonce mentionne des codes analytiques pour categoriser les trajets (fret, passager, maintenance...) mais ne fournit pas de liste exhaustive.

**Mon hypothese** : Les codes analytiques sont des chaines libres, sans validation stricte cote backend.

**Implementation** : Le champ `analyticCode` est un string valide uniquement sur sa longueur (1-50 caracteres) et son format (alphanumerique + tirets).

**Justification** : Dans un contexte reel, la liste des codes serait probablement geree dans un referentiel externe ou une table de configuration. Pour ce defi, j'ai prefere la flexibilite plutot que d'inventer une liste arbitraire.

### Hypothese 3 : Un utilisateur = une authentification

**Contexte** : L'enonce mentionne "authentification" sans preciser le modele utilisateur.

**Mon hypothese** : Chaque utilisateur a ses propres credentials et peut s'inscrire librement.

**Implementation** : J'ai cree un systeme d'inscription/connexion complet avec persistance en base de donnees.

**Justification** : Un simple utilisateur hardcode aurait "fonctionne" pour le defi, mais n'aurait pas demontre ma comprehension d'un systeme d'auth realiste.

### Hypothese 4 : Les statistiques sont par utilisateur

**Contexte** : L'endpoint de statistiques agregees ne precise pas la portee des donnees.

**Mon hypothese** : Les statistiques affichees concernent tous les trajets enregistres, pas seulement ceux de l'utilisateur connecte.

**Implementation** : L'endpoint `/stats/distances` agrege tous les trajets de la base.

**Justification** : Dans un contexte de gestion du trafic ferroviaire, les statistiques globales sont generalement plus utiles que les statistiques individuelles. Si le besoin etait different, ajouter un filtre par utilisateur serait trivial.

### Hypothese 5 : Pas de gestion des horaires

**Contexte** : L'enonce parle de "trajets" mais pas d'horaires ou de planification.

**Mon hypothese** : Le systeme calcule des distances, pas des temps de trajet.

**Implementation** : Seules les distances kilometriques sont calculees et stockees.

**Justification** : Les temps de trajet dependent de nombreux facteurs (type de train, arrets intermediaires, vitesse commerciale) qui ne sont pas fournis. Le calcul de distance est le scope minimal coherent.

---

## Chronologie de mes decisions

### Jour 1 : Analyse et architecture

**Premiere lecture de l'enonce**

Ma premiere reaction : "C'est un defi complet". Backend, frontend, CI/CD, securite, tests... Il y a beaucoup a faire. J'ai decide de commencer par bien comprendre le besoin avant d'ecrire la moindre ligne de code.

**Analyse des donnees**

J'ai ouvert `stations.json` et `distances.json` pour comprendre la structure du reseau. J'ai remarque que :
- Le reseau forme un graphe (des stations connectees par des segments)
- Les distances ne sont pas toutes directes — il faut parfois passer par des stations intermediaires
- C'est exactement un probleme de plus court chemin

**Choix de l'algorithme**

J'aurais pu utiliser un simple BFS (Breadth-First Search) pour trouver un chemin, mais j'ai opte pour Dijkstra. Pourquoi ? Parce que BFS trouve le chemin avec le moins d'etapes, pas le plus court en distance. Dans un contexte ferroviaire, c'est la distance qui compte.

**Choix du framework**

J'ai hesite entre plusieurs options :
- **PHP natif** : J'aurais pu montrer que je maitrise les fondamentaux sans dependance
- **Slim** : Leger, rapide a mettre en place
- **Symfony** : Plus lourd, mais c'est ce que MOB utilise

J'ai choisi Symfony pour plusieurs raisons :
1. C'est mentionne dans l'environnement technique de MOB
2. Son architecture se prete bien au DDD
3. Ca me permet de montrer que je connais l'ecosysteme

### Jour 2 : Structure DDD

**Pourquoi le Domain-Driven Design ?**

Le DDD n'etait pas obligatoire, mais je l'ai choisi deliberement. En regardant le domaine metier, j'ai identifie des concepts clairs :
- **Routing** : Stations, reseau, calcul de trajets
- **Analytics** : Statistiques par code analytique
- **Auth** : Utilisateurs et authentification

Ces trois domaines ont des responsabilites distinctes. Les separer en bounded contexts rend le code plus lisible et facilite l'evolution.

**Les Value Objects**

J'ai cree des Value Objects pour les concepts cles :
- `StationId` : Identifiant d'une station
- `Distance` : Une distance en kilometres (toujours positive)
- `AnalyticCode` : Un code de categorisation

Pourquoi s'embeter avec ca plutot que des strings et des floats ? Parce que ca rend le code auto-documente. Quand une methode attend un `StationId`, impossible de lui passer accidentellement un code analytique.

### Jour 3 : L'algorithme de Dijkstra

**Premiere implementation**

Ma premiere version de Dijkstra fonctionnait sur les cas simples mais echouait sur les reseaux complexes. Le probleme : je ne gerais pas correctement la mise a jour des distances quand un meilleur chemin etait trouve.

**Debugging et tests**

J'ai ecrit une serie de tests unitaires avant de corriger :
- Chemin direct entre deux stations adjacentes
- Chemin via une station intermediaire
- Cas ou aucun chemin n'existe
- Reseau avec plusieurs routes possibles (pour verifier qu'on trouve la plus courte)

Les tests m'ont permis d'identifier precisement ou l'algorithme echouait.

**Optimisation avec SplPriorityQueue**

PHP a une structure `SplPriorityQueue` parfaite pour Dijkstra. Elle permet d'extraire efficacement l'element avec la plus petite priorite (ici, la plus petite distance).

### Jour 4 : Frontend Vue.js

**Choix de Vuetify**

Pour le frontend, j'ai utilise Vue 3 avec Vuetify 3, comme mentionne dans l'environnement MOB. J'aurais pu faire du CSS custom, mais Vuetify offre :
- Des composants Material Design prets a l'emploi
- Une coherence visuelle sans effort
- Des composants accessibles par defaut

**L'identite visuelle MOB**

J'ai voulu que l'interface ressemble a quelque chose qu'on pourrait voir sur le site du MOB. J'ai donc :
- Integre le logo officiel
- Utilise les couleurs de la charte (bleu #001f78, rose #e6007e)
- Garde un design sobre et professionnel

Ce n'etait pas demande, mais ca montre que je pense au produit final, pas juste au code.

### Jour 5 : CI/CD et securite

**GitHub Actions vs GitLab CI**

MOB utilise TeamCity et GitLab. J'ai choisi GitHub Actions car mon repo est sur GitHub, mais la logique des pipelines est transposable :
- Build des images
- Linting (PHPCS, ESLint)
- Tests avec couverture
- Analyse statique (PHPStan, TypeScript)
- Scan de securite (Trivy, npm audit)

**PHPStan niveau 8**

C'est la premiere fois que je configure PHPStan au niveau maximum. C'est strict — tres strict. Chaque variable doit avoir un type connu, chaque retour de fonction doit etre gere, les null doivent etre explicitement traites.

C'etait frustrant au debut, mais le resultat est un code beaucoup plus robuste. Je comprends pourquoi les equipes l'adoptent.

**La securite**

J'ai implemente :
- HTTPS via nginx avec certificats auto-signes (pour le dev)
- JWT pour l'authentification stateless
- Rate limiting sur les endpoints sensibles
- Headers de securite (CSP, X-Frame-Options, etc.)
- Secrets dans des variables d'environnement

Ce n'est pas exhaustif, mais ca couvre les bases OWASP.

---

## Les moments ou j'ai doute

### "Est-ce que DDD c'est overkill ?"

A plusieurs reprises, je me suis demande si je ne sur-architecturais pas le projet. Pour un defi technique, une structure simple aurait suffi.

**Ma conclusion** : Non, ce n'est pas overkill. Le DDD ajoute quelques fichiers, mais chaque fichier a une responsabilite claire. Un nouveau developpeur peut naviguer dans le code sans se perdre. C'est ca la maintenabilite.

### "Est-ce que mes tests sont suffisants ?"

J'ai atteint 80% de couverture, mais la couverture ne garantit pas la qualite des tests. Je me suis assure de tester :
- Les cas nominaux (le "happy path")
- Les cas d'erreur (stations inexistantes, chemins impossibles)
- Les cas limites (reseau vide, station de depart = station d'arrivee)

### "Est-ce que je devrais ajouter Swagger UI ?"

J'aurais aime ajouter une documentation interactive de l'API. J'ai finalement decide de ne pas le faire par manque de temps, mais c'est dans ma liste "si j'avais plus de temps".

---

## Une reflexion que j'ai eue : enrichir le detail des trajets

En implementant le calcul de distance, je me suis pose une question : **est-ce que retourner juste la distance totale suffit vraiment ?**

Le besoin metier dit : *"permettre a l'utilisateur de calculer une distance entre deux stations"*. Techniquement, retourner `{ "distance": 42.5 }` repond a ce besoin. Mais en me mettant a la place de l'utilisateur, j'ai realise que ce n'est pas suffisant.

### Ce que l'utilisateur veut vraiment savoir

Quand quelqu'un cherche un trajet Montreux -> Zweisimmen, il veut probablement :
- La distance totale
- **Les stations traversees** (pour savoir ou il passe)
- **La distance entre chaque station** (pour comprendre le decoupage du trajet)

### Ma decision

J'ai enrichi la reponse de l'API pour inclure le detail du parcours :

```json
{
  "from": "Montreux",
  "to": "Zweisimmen",
  "totalDistance": 62.4,
  "path": [
    { "station": "Montreux", "distanceFromPrevious": 0 },
    { "station": "Les Avants", "distanceFromPrevious": 8.2 },
    { "station": "Montbovon", "distanceFromPrevious": 12.1 },
    { "station": "Chateau-d'Oex", "distanceFromPrevious": 15.3 },
    { "station": "Zweisimmen", "distanceFromPrevious": 26.8 }
  ]
}
```

### Pourquoi j'ai hesite

Cette modification impliquait de :
- Modifier le schema OpenAPI fourni (est-ce acceptable ?)
- Ajouter de la complexite a la reponse
- Potentiellement casser des clients qui s'attendaient au format minimal

J'ai finalement decide que l'enrichissement etait justifie car :
1. C'est une **extension** du format, pas une rupture (le champ `totalDistance` reste present)
2. Ca apporte une **vraie valeur utilisateur**
3. Ca demontre ma capacite a **reflechir au-dela du cahier des charges**

C'est le genre de decision que je prendrais en equipe apres discussion — ici, j'ai fait l'hypothese que l'amelioration serait bienvenue.

---

## Ce que ce defi m'a appris

### Un projet formateur

Je tiens a etre honnete : ce defi m'a pousse hors de ma zone de confort. Certaines technologies, je les maitrisais deja grace a mon alternance (PHP, Symfony, Docker). D'autres, je les connaissais peu ou pas du tout.

J'ai passe du temps a :
- Lire des documentations officielles (Symfony 7, Vuetify 3, PHPStan)
- Regarder des tutoriels YouTube pour comprendre certains concepts
- Utiliser l'IA comme outil d'apprentissage (pas juste de generation)

### Ce que j'ai approfondi

| Technologie | Mon niveau avant | Ce que j'ai appris |
|-------------|------------------|-------------------|
| **PHPStan niveau 8** | Jamais utilise a ce niveau | La rigueur du typage strict, la gestion des nullables |
| **Vuetify 3** | Connaissais Vue, pas Vuetify | Le systeme de composants Material Design |
| **GitHub Actions** | Habitue a GitLab CI | Syntaxe differente, meme logique |
| **JWT avec Symfony** | Utilise basiquement | Configuration avancee, refresh tokens |
| **Trivy** | Ne connaissais pas | Scan de vulnerabilites sur images Docker |
| **Chart.js avec Vue** | Jamais fait | Integration reactive des graphiques |

### Ma philosophie d'apprentissage

Je ne considere pas le fait d'avoir appris pendant le defi comme une faiblesse. Au contraire :
- Un developpeur qui pretend tout savoir est soit menteur, soit dangereux
- La capacite a **apprendre vite** est plus importante que de tout connaitre d'avance
- Documenter son apprentissage montre de la **maturite professionnelle**

Dans un contexte d'equipe, je serais le premier a dire "je ne connais pas ca, laisse-moi 2h pour me documenter" plutot que de faire semblant et livrer du code bancal.

### Sur moi-meme

- Je suis plus efficace quand je prends le temps de reflechir avant de coder
- Documenter mes choix m'oblige a les justifier — et parfois a les ameliorer
- Piloter une IA demande autant de rigueur que coder soi-meme

---

## Si j'avais plus de temps

Voici ce que j'ajouterais, par ordre de priorite :

1. **Swagger UI** (`/api/docs`) — Documentation interactive de l'API
2. **Tests E2E avec Cypress** — Valider les parcours utilisateurs complets
3. **Carte interactive** — Visualiser le reseau MOB et les trajets calcules
4. **Historique des trajets** — Permettre aux utilisateurs de revoir leurs recherches
5. **Optimisation des performances** — Cache Redis pour les calculs de trajets frequents
6. **Internationalisation** — Support FR/DE/EN pour l'interface

---

## Conclusion

Ce defi m'a permis de demontrer non seulement mes competences techniques, mais aussi ma facon de reflechir et de m'organiser. J'ai aborde ce projet comme un professionnel qui rejoint une equipe, pas comme un etudiant qui rend un devoir.

J'espere que ce journal de decisions vous donne un apercu de ma facon de travailler. Je serais ravi d'en discuter de vive voix et d'approfondir n'importe quel point.

---

*Lucas — Decembre 2024*
