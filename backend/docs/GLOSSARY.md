# Glossaire Métier (Ubiquitous Language)

Ce document définit le langage omniprésent utilisé dans le domaine du routage ferroviaire.
Tous les termes définis ici doivent être utilisés de manière cohérente dans le code, la documentation et les échanges.

## Termes du domaine

### Station

**Définition** : Point d'arrêt sur le réseau ferroviaire où un train peut s'arrêter.

**Propriétés** :

- `id` (StationId) : Identifiant unique, correspond au code court (ex: "MX", "ZW")
- `name` : Nom complet de la station (ex: "Montreux", "Zweisimmen")

**Exemples** :

- MX = Montreux
- ZW = Zweisimmen
- CABY = Chamby

---

### StationId

**Définition** : Identifiant unique d'une station, représenté par un code alphanumérique court.

**Règles** :

- 1 à 10 caractères alphanumériques
- Insensible à la casse (stocké en majuscules)
- Ne peut pas être vide

---

### Segment

**Définition** : Connexion directe entre deux stations adjacentes sur le réseau.

**Propriétés** :

- `from` : Station de départ
- `to` : Station d'arrivée
- `distance` : Distance en kilomètres

**Note** : Un segment est bidirectionnel (on peut le parcourir dans les deux sens).

---

### Distance

**Définition** : Mesure de longueur exprimée en kilomètres.

**Règles** :

- Ne peut pas être négative
- Peut être zéro (même station)
- Précision au centième de kilomètre

---

### Ligne (Line)

**Définition** : Ensemble de stations connectées formant un itinéraire nommé.

**Exemples** :

- **MOB** : Ligne principale Montreux - Zweisimmen
- **MVR-ce** : Ligne Vevey - Les Pléiades

---

### Réseau (Network)

**Définition** : Graphe complet représentant toutes les stations et leurs connexions.

**Caractéristiques** :

- Graphe non-orienté (les segments sont bidirectionnels)
- Peut contenir plusieurs lignes interconnectées
- Les lignes se croisent à certaines stations (ex: CABY connecte MOB et MVR-ce)

---

### Trajet (Route)

**Définition** : Parcours calculé d'une station de départ à une station d'arrivée.

**Propriétés** :

- `id` : Identifiant unique (UUID)
- `fromStationId` : Station de départ
- `toStationId` : Station d'arrivée
- `analyticCode` : Code analytique associé
- `distanceKm` : Distance totale en kilomètres
- `path` : Liste ordonnée des stations traversées
- `createdAt` : Date/heure de création

---

### Chemin (Path)

**Définition** : Résultat du calcul de route, contenant la séquence de stations et la distance totale.

**Propriétés** :

- `stations` : Liste ordonnée des stations du chemin
- `totalDistance` : Distance totale du chemin

**Règle** : Un chemin doit contenir au moins 2 stations (départ et arrivée).

---

### Code Analytique (AnalyticCode)

**Définition** : Code permettant de catégoriser un trajet pour des fins statistiques.

**Exemples de catégories** :

- Fret
- Passager
- Maintenance
- Test

**Règles** :

- 1 à 50 caractères
- Ne peut pas être vide

---

### Voisin (Neighbor)

**Définition** : Station directement connectée à une autre station avec la distance associée.

**Utilisation** : Utilisé par l'algorithme de recherche de chemin pour explorer le graphe.

---

## Bounded Contexts

### Routing Context

Responsable du calcul des trajets et de la gestion du réseau ferroviaire.

**Entités** :

- Station
- Route

**Value Objects** :

- StationId
- Distance
- Segment
- Path
- Neighbor

**Aggregate Root** :

- Network

**Services** :

- PathFinder (interface)
- NetworkLoader (interface)

---

### Analytics Context

Responsable des statistiques et de l'agrégation des données de trajets.

**Entités** :

- RouteRecord

**Value Objects** :

- AnalyticCode
- Period
- DistanceAggregate

---

### Shared Kernel

Éléments partagés entre les contextes.

**Value Objects** :

- StationId
- Distance
- AnalyticCode

---

## Règles métier

1. **Unicité des stations** : Chaque station a un identifiant unique dans le réseau.

2. **Connexité** : Deux stations peuvent être connectées par un segment direct ou par un chemin passant par d'autres stations.

3. **Chemin le plus court** : L'algorithme de routage doit toujours retourner le chemin avec la distance minimale.

4. **Persistance optionnelle** : Les trajets calculés peuvent être persistés pour les statistiques.

5. **Validation des stations** : Un trajet ne peut être calculé qu'entre des stations existantes dans le réseau.
