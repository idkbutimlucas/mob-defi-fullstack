# Hypotheses metier

L'enonce du defi indique : *"tu es libre de faire des hypotheses raisonnables et de les documenter"*. Ce document liste les hypotheses que j'ai faites pour combler les zones d'incertitude du cahier des charges.

---

## Sur le reseau ferroviaire

### Les trajets sont bidirectionnels

Le fichier `distances.json` contient des segments orientes (ex: "Montreux vers Les Avants"). Je pars du principe qu'un train peut circuler dans les deux sens sur une meme voie et que la distance est identique dans les deux directions.

**Implementation** : Le `JsonNetworkLoader` cree automatiquement les connexions inverses lors du chargement du reseau.

### Le reseau n'est pas forcement connexe

Les donnees ne garantissent pas que toutes les stations sont reliees entre elles. Certaines paires de stations peuvent ne pas avoir de chemin.

**Implementation** : L'algorithme de Dijkstra retourne une exception `NoRouteFoundException` si aucun chemin n'existe entre deux stations.

### Les distances sont en kilometres

L'unite n'est pas explicitement specifiee dans les donnees. J'ai suppose que les distances sont en kilometres avec une precision au dixieme.

---

## Sur les codes analytiques

### Les codes sont des chaines libres

L'enonce mentionne des exemples de codes (fret, passager, maintenance) mais ne fournit pas de liste exhaustive. J'ai suppose que les codes analytiques sont des chaines libres, validees uniquement sur leur format.

**Implementation** : Validation alphanumerique, 1 a 50 caracteres, tirets autorises.

### La casse est normalisee

Pour eviter les doublons dans les statistiques ("PASSAGER" vs "passager"), les codes sont normalises en majuscules avant stockage.

---

## Sur les utilisateurs

### Inscription libre

L'enonce mentionne "authentification" sans preciser le workflow d'obtention d'un compte. J'ai cree un systeme d'inscription libre via l'endpoint `/api/v1/register`.

### Pas de roles differencies

Aucune mention de niveaux d'acces differents (admin, utilisateur limite). Tous les utilisateurs authentifies ont les memes droits avec un role unique `ROLE_USER`.

---

## Sur les statistiques

### Statistiques globales

L'endpoint de statistiques agregees ne precise pas la portee des donnees. J'ai choisi d'agreger tous les trajets de tous les utilisateurs plutot que de filtrer par utilisateur.

**Justification** : Dans un contexte de gestion du trafic ferroviaire, les statistiques globales sont plus utiles pour l'analyse.

### Persistance des trajets

L'enonce indique "tu peux choisir de persister les saisies". J'ai choisi de les persister pour alimenter l'endpoint de statistiques (point bonus).

---

## Sur l'API

### Versioning

J'ai prefixe toutes les routes avec `/api/v1/` pour permettre des evolutions futures sans casser les clients existants.

### Enrichissement des trajets

Le besoin demande de "calculer une distance entre deux stations". J'ai enrichi la reponse pour inclure aussi le detail du parcours (stations traversees et distance de chaque segment).

**Justification** : Un utilisateur veut generalement savoir par ou il passe, pas seulement la distance finale. C'est une extension du format, pas une rupture.

### Endpoint stations public

L'endpoint `/api/v1/stations` est public (pas d'authentification requise) pour que le formulaire du frontend puisse charger la liste des stations sans connexion prealable.

---

## Impact si ces hypotheses sont incorrectes

| Hypothese | Impact | Effort de correction |
|-----------|--------|---------------------|
| Bidirectionnel | Modifier le loader pour respecter le sens | Faible |
| Codes libres | Ajouter une table de reference | Moyen |
| Inscription libre | Ajouter validation admin | Moyen |
| Stats globales | Ajouter filtre par user_id | Faible |
| Detail trajets | Revenir au format minimal | Faible |

---

*Ces hypotheses ont ete faites de bonne foi pour livrer une solution fonctionnelle. Je suis ouvert a les revisiter si le contexte metier reel differe.*
