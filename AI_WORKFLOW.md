# Mon workflow avec l'IA

> Ce document explique comment j'ai utilise l'intelligence artificielle (Claude Code) pour realiser ce projet, et pourquoi je pense que c'est une competence pertinente pour un developpeur moderne.

---

## Pourquoi documenter ca ?

Le defi mentionne explicitement :

> *"Tu es libre d'utiliser les outils qui te semblent les plus adaptes pour realiser ce defi. Cela inclut bien sur le code genere par des intelligences artificielles."*

Plutot que de cacher cette utilisation, j'ai choisi d'en faire un atout en documentant **comment** j'ai pilote l'IA. Car c'est la que reside la vraie competence : pas dans le fait d'utiliser ou non une IA, mais dans la capacite a l'utiliser **intelligemment**.

---

## Ma vision du developpement assiste par IA

### Ce que l'IA change (et ne change pas)

| Avant | Maintenant | Ce qui reste constant |
|-------|------------|----------------------|
| Ecrire chaque ligne manuellement | Generer des blocs de code | Comprendre ce que le code fait |
| Chercher sur Stack Overflow | Demander a l'IA | Valider que la solution est correcte |
| Copier des snippets | Generer du code contextualise | Adapter a son architecture |
| Debug par essai-erreur | Debug assiste | Comprendre la cause racine |

### La vraie valeur ajoutee du developpeur

Je suis convaincu que la valeur d'un developpeur en 2024+ ne reside plus dans sa capacite a memoriser des syntaxes ou a taper vite. Elle est dans :

1. **La comprehension du besoin metier** — L'IA ne peut pas deviner ce que le client veut vraiment
2. **Les choix d'architecture** — Decider entre monolithe et microservices, choisir un pattern, structurer le code
3. **La qualite des instructions** — Une IA produit du code mediocre si on lui donne des instructions floues
4. **L'esprit critique** — Reconnaitre quand le code genere est incorrect, sous-optimal ou dangereux
5. **L'integration coherente** — Assembler les morceaux en un tout qui fonctionne et se maintient

---

## Comment j'ai procede concretement

### Phase 1 : Analyse (sans IA)

Avant de generer la moindre ligne de code, j'ai passe du temps a :

- Lire l'enonce plusieurs fois
- Analyser la structure de `stations.json` et `distances.json`
- Comprendre le domaine metier (reseau ferroviaire, codes analytiques)
- Identifier les bounded contexts naturels
- Choisir mon stack technique

**Pourquoi pas d'IA ici ?** Parce que c'est une etape de reflexion ou l'humain apporte le plus de valeur. L'IA aurait pu me proposer des architectures, mais j'aurais perdu la comprehension profonde du probleme.

### Phase 2 : Architecture (decisions humaines, validation IA)

J'ai defini :
- Structure DDD avec 3 bounded contexts
- Value Objects pour les concepts cles
- Repository pattern pour l'acces aux donnees
- Algorithme de Dijkstra pour le routage

J'ai ensuite demande a l'IA de valider mes choix :

```
"Je prevois d'utiliser une architecture DDD avec ces bounded contexts :
Routing, Analytics, Auth. Est-ce que cette separation te semble coherente
pour un systeme de calcul de trajets ferroviaires ?"
```

L'IA a confirme la pertinence et suggere des ameliorations mineures (comme l'ajout d'un Shared Kernel pour les Value Objects communs).

### Phase 3 : Generation de code (instructions structurees)

Pour chaque composant, j'ai fourni des instructions precises. Exemple pour l'algorithme de Dijkstra :

```
"Implemente l'algorithme de Dijkstra en PHP 8.4 avec les contraintes suivantes :
- Utiliser SplPriorityQueue pour l'optimisation
- Le graphe est represente par un array associatif [stationId => [(neighborId, distance)]]
- Retourner un objet Route contenant : path (array de StationId), totalDistance (float)
- Gerer le cas ou aucun chemin n'existe (throw RouteNotFoundException)
- Respecter PSR-12 et le typage strict
- Le code doit passer PHPStan niveau 8"
```

**Pourquoi des instructions si detaillees ?** Parce qu'une instruction vague comme "fais-moi Dijkstra" produit du code generique inutilisable. Les contraintes (PSR-12, PHPStan 8, exceptions typees) garantissent un code coherent avec le reste du projet.

### Phase 4 : Revue et ajustement

Chaque bloc genere a ete :

1. **Relu** — Je lis le code pour comprendre ce qu'il fait
2. **Teste** — Je lance les tests unitaires (souvent ecrits avant)
3. **Ajuste** — Je corrige les erreurs ou ameliore les parties insatisfaisantes

Exemple concret : la premiere version de Dijkstra ne gerait pas correctement les mises a jour de distance. J'ai du :
- Identifier le bug via les tests
- Comprendre la cause (condition de mise a jour incorrecte)
- Demander une correction ciblee a l'IA
- Valider que le fix etait correct

### Phase 5 : Integration

L'assemblage final a ete fait manuellement :
- Verifier que les imports sont corrects
- S'assurer que les conventions de nommage sont uniformes
- Valider que l'architecture est respectee partout
- Lancer la suite de tests complete

---

## Exemples de prompts que j'ai utilises

### Prompt pour un Value Object

```
Cree un Value Object "Distance" en PHP 8.4 pour representer une distance
kilometrique :
- Immutable (proprietes readonly)
- Le constructeur valide que la valeur est positive
- Methode add(Distance $other): Distance
- Methode equals(Distance $other): bool
- Implemente JsonSerializable
- Typage strict, PHPStan level 8 compatible
```

### Prompt pour un test

```
Ecris les tests PHPUnit pour DijkstraRouter avec ces cas :
1. Chemin direct entre deux stations adjacentes
2. Chemin via une station intermediaire
3. Aucun chemin possible -> RouteNotFoundException
4. Station de depart inexistante -> StationNotFoundException
5. Station d'arrivee inexistante -> StationNotFoundException
6. Depart = arrivee -> distance 0
Utilise des data providers quand c'est pertinent.
```

### Prompt pour du refactoring

```
Ce code fonctionne mais n'est pas optimal :
[code]
Refactore-le pour :
- Extraire la logique de validation dans une methode privee
- Utiliser le pattern early return
- Reduire la complexite cyclomatique
Garde la meme signature publique.
```

---

## Ce que j'ai appris

### L'IA est un amplificateur

- Un developpeur junior + IA = code de qualite moyenne plus vite
- Un developpeur senior + IA = code de haute qualite beaucoup plus vite

L'IA amplifie les competences existantes, elle ne les remplace pas.

### La qualite des instructions est cruciale

J'ai remarque que :
- Instructions vagues -> code generique, souvent inutilisable
- Instructions precises -> code adapte, souvent utilisable directement
- Instructions avec contexte -> code qui s'integre naturellement

### L'esprit critique reste indispensable

L'IA peut generer du code qui :
- Compile mais a des bugs logiques
- Fonctionne mais n'est pas performant
- Est correct mais ne respecte pas l'architecture

Sans esprit critique, on se retrouve avec une base de code incoherente.

### Le temps gagne doit etre reinvesti

Le temps que je ne passe plus a ecrire du boilerplate, je le reinvestis dans :
- La reflexion architecturale
- L'ecriture de tests
- La documentation
- La revue de code

---

## Pour les sceptiques

*"Si l'IA a ecrit le code, est-ce vraiment ton travail ?"*

Ma reponse : un architecte ne pose pas les briques lui-meme, mais c'est bien lui qui concoit le batiment. Le code final est le resultat de **mes** decisions d'architecture, **mes** choix techniques, **mes** instructions, et **ma** validation.

*"Comment savoir si tu comprends vraiment le code ?"*

Je peux expliquer chaque ligne, chaque pattern, chaque decision. Je peux modifier le code sans l'IA si necessaire. J'ai passe 3 ans en alternance a ecrire du PHP sans IA — je sais ce que je fais.

*"Est-ce que ca ne rend pas les developpeurs paresseux ?"*

Au contraire. Ca libere du temps pour les taches a haute valeur ajoutee : comprendre le metier, concevoir des architectures robustes, ecrire de la documentation, former les collegues.

---

## Conclusion

Utiliser l'IA efficacement est une competence a part entiere. Ce projet m'a permis de la pratiquer et de la documenter. Je suis convaincu que savoir piloter ces outils sera un differenciateur majeur dans les annees a venir.

Je suis pret a discuter de cette approche et a demontrer ma comprehension du code produit.

---

*Lucas — Decembre 2024*
