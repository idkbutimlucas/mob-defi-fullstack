# Hypotheses metier

> L'enonce du defi indique : *"tu es libre de faire des hypotheses raisonnables et de les documenter"*. Ce document liste les hypotheses que j'ai faites pour combler les zones d'incertitude du cahier des charges.

---

## Hypotheses sur le reseau ferroviaire

### H1 — Les trajets sont bidirectionnels

| Aspect | Detail |
|--------|--------|
| **Constat** | Le fichier `distances.json` contient des segments directionnels (ex: "Montreux -> Les Avants") |
| **Question** | Un train peut-il circuler dans les deux sens ? |
| **Hypothese** | Oui. La distance A->B est identique a B->A |
| **Implementation** | `JsonNetworkLoader` cree automatiquement les connexions inverses |
| **Justification** | Comportement standard d'un reseau ferroviaire. Les voies a sens unique existent mais seraient explicitement marquees |

### H2 — Le reseau est connexe

| Aspect | Detail |
|--------|--------|
| **Constat** | Les donnees ne garantissent pas que toutes les stations sont reliees |
| **Question** | Peut-on toujours trouver un chemin entre deux stations ? |
| **Hypothese** | Non, certaines paires peuvent ne pas etre connectees |
| **Implementation** | L'algorithme retourne une erreur explicite si aucun chemin n'existe |
| **Justification** | Un reseau reel peut avoir des branches isolees (lignes touristiques, voies de service) |

### H3 — Les distances sont en kilometres

| Aspect | Detail |
|--------|--------|
| **Constat** | L'unite n'est pas explicitement specifiee dans les donnees |
| **Question** | Quelle est l'unite des distances ? |
| **Hypothese** | Kilometres (km), avec precision au dixieme |
| **Implementation** | Les distances sont stockees en float, affichees avec 1 decimale |
| **Justification** | Unite standard pour les reseaux ferroviaires europeens |

---

## Hypotheses sur les codes analytiques

### H4 — Les codes sont libres

| Aspect | Detail |
|--------|--------|
| **Constat** | L'enonce mentionne des exemples (fret, passager, maintenance) sans liste exhaustive |
| **Question** | Y a-t-il une liste fermee de codes valides ? |
| **Hypothese** | Non, les codes sont des chaines libres |
| **Implementation** | Validation sur format (alphanumerique, 1-50 caracteres) sans liste blanche |
| **Justification** | Flexibilite pour les evolutions metier. Dans un systeme reel, la liste serait dans un referentiel externe |

### H5 — Les codes sont case-insensitive pour les stats

| Aspect | Detail |
|--------|--------|
| **Constat** | Rien ne precise si "PASSAGER" et "passager" sont differents |
| **Question** | Comment gerer la casse dans les agregations ? |
| **Hypothese** | Les codes sont normalises en minuscules pour l'agregation |
| **Implementation** | `strtolower()` applique avant stockage et agregation |
| **Justification** | Evite les doublons accidentels dans les statistiques |

---

## Hypotheses sur les utilisateurs

### H6 — Inscription libre

| Aspect | Detail |
|--------|--------|
| **Constat** | L'enonce mentionne "authentification" sans preciser le workflow |
| **Question** | Comment les utilisateurs obtiennent-ils un compte ? |
| **Hypothese** | Inscription libre via endpoint `/register` |
| **Implementation** | Endpoint POST /register avec email/password |
| **Justification** | Plus realiste qu'un user hardcode. Permet de demontrer un flow complet |

### H7 — Pas de roles/permissions

| Aspect | Detail |
|--------|--------|
| **Constat** | Aucune mention de niveaux d'acces differents |
| **Question** | Y a-t-il des admins, des utilisateurs limites, etc. ? |
| **Hypothese** | Non, tous les utilisateurs authentifies ont les memes droits |
| **Implementation** | Un seul role `ROLE_USER` |
| **Justification** | KISS (Keep It Simple). Ajout de roles trivial si besoin |

---

## Hypotheses sur les statistiques

### H8 — Statistiques globales

| Aspect | Detail |
|--------|--------|
| **Constat** | L'endpoint de stats ne precise pas la portee |
| **Question** | Les stats sont-elles par utilisateur ou globales ? |
| **Hypothese** | Globales (tous les trajets de tous les utilisateurs) |
| **Implementation** | Agregation sur l'ensemble de la table `routes` |
| **Justification** | Plus utile pour une analyse du trafic. Filtre par user facile a ajouter |

### H9 — Persistance des trajets

| Aspect | Detail |
|--------|--------|
| **Constat** | L'enonce dit "tu peux choisir de persister les saisies" |
| **Question** | Faut-il sauvegarder chaque calcul de trajet ? |
| **Hypothese** | Oui, pour alimenter les statistiques |
| **Implementation** | Chaque POST /routes cree une entree en base |
| **Justification** | Necessaire pour le bonus "statistiques agregees" |

---

## Hypotheses sur l'API

### H10 — Pas de pagination

| Aspect | Detail |
|--------|--------|
| **Constat** | L'OpenAPI fournie ne mentionne pas de pagination |
| **Question** | Faut-il paginer les listes (stations, stats) ? |
| **Hypothese** | Non pour ce defi (dataset limite) |
| **Implementation** | Retour de toutes les donnees en une requete |
| **Justification** | Le reseau MOB a ~50 stations. Pagination utile a partir de centaines d'items |

### H11 — Versioning d'API

| Aspect | Detail |
|--------|--------|
| **Constat** | Non mentionne dans l'enonce |
| **Question** | Faut-il versionner l'API ? |
| **Hypothese** | Oui, prefixe `/api/v1/` |
| **Implementation** | Toutes les routes sous `/api/v1/` |
| **Justification** | Best practice permettant des evolutions sans casser les clients |

### H12 — Enrichissement du detail des trajets

| Aspect | Detail |
|--------|--------|
| **Constat** | Le besoin demande "calculer une distance entre deux stations" |
| **Question** | Faut-il retourner seulement la distance totale ou aussi le detail du parcours ? |
| **Hypothese** | Le detail (stations traversees + distance de chaque segment) apporte plus de valeur |
| **Implementation** | La reponse inclut `path` avec chaque station et `distanceFromPrevious` |
| **Justification** | Un utilisateur veut generalement savoir par ou il passe, pas juste la distance finale. C'est une extension du format, pas une rupture |

---

## Validation des hypotheses

Si certaines de ces hypotheses s'averent incorrectes, voici l'impact :

| Hypothese | Impact si incorrecte | Effort de correction |
|-----------|---------------------|---------------------|
| H1 (bidirectionnel) | Modifier le loader | Faible |
| H4 (codes libres) | Ajouter une table de reference | Moyen |
| H6 (inscription libre) | Ajouter validation admin | Moyen |
| H8 (stats globales) | Ajouter filtre user_id | Faible |
| H12 (detail trajets) | Revenir au format minimal | Faible |

---

*Ces hypotheses ont ete faites de bonne foi pour livrer une solution fonctionnelle. Je suis ouvert a les revisiter si le contexte metier reel differe.*
