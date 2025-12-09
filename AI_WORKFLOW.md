# Mon utilisation de l'IA

Le defi mentionne explicitement :

> *"Tu es libre d'utiliser les outils qui te semblent les plus adaptes pour realiser ce defi. Cela inclut bien sur le code genere par des intelligences artificielles."*

J'ai utilise Claude Code pour m'assister dans le developpement. Ce document explique comment et pourquoi.

---

## Ma conviction

La valeur d'un developpeur ne reside plus uniquement dans sa capacite a ecrire du code ligne par ligne. Elle se situe dans :

- La comprehension du besoin metier
- Les choix d'architecture
- La capacite a structurer des instructions claires
- L'esprit critique pour valider et ameliorer le code
- L'integration coherente des differentes parties

---

## Comment j'ai procede

### Analyse sans IA

Avant de generer du code, j'ai passe du temps a :

- Lire l'enonce plusieurs fois
- Analyser la structure des fichiers JSON
- Comprendre le domaine metier
- Identifier les bounded contexts
- Choisir le stack technique

C'est une etape de reflexion ou l'humain apporte le plus de valeur.

### Decisions d'architecture

J'ai defini moi-meme :

- La structure DDD avec 3 bounded contexts
- Les Value Objects pour les concepts cles
- Le pattern Repository pour l'acces aux donnees
- L'algorithme de Dijkstra pour le routage

J'ai ensuite utilise l'IA pour valider ces choix et suggerer des ameliorations.

### Generation de code

Pour chaque composant, j'ai fourni des instructions precises :

- Le contexte metier
- Les contraintes techniques (PHP 8.4, PSR-12, PHPStan level 8)
- Les patterns a suivre
- Les cas d'erreur a gerer

Une instruction vague produit du code generique. Des contraintes precises garantissent un code coherent.

### Revue et ajustement

Chaque bloc genere a ete :

1. Relu pour comprendre ce qu'il fait
2. Teste avec les tests unitaires
3. Ajuste pour corriger les erreurs ou ameliorer

Exemple : la premiere version de Dijkstra ne gerait pas correctement les mises a jour de distance. J'ai identifie le bug via les tests, compris la cause, et demande une correction ciblee.

---

## Ce que j'ai appris

### L'IA amplifie les competences

- Un developpeur junior + IA = code de qualite moyenne plus vite
- Un developpeur senior + IA = code de haute qualite beaucoup plus vite

L'IA amplifie les competences existantes, elle ne les remplace pas.

### La qualite des instructions est cruciale

- Instructions vagues : code generique, souvent inutilisable
- Instructions precises : code adapte, souvent utilisable directement
- Instructions avec contexte : code qui s'integre naturellement

### L'esprit critique reste indispensable

L'IA peut generer du code qui :

- Compile mais a des bugs logiques
- Fonctionne mais n'est pas performant
- Est correct mais ne respecte pas l'architecture

Sans esprit critique, on se retrouve avec une base de code incoherente.

---

## Conclusion

Utiliser l'IA efficacement demande une bonne maitrise technique. Il faut savoir quoi demander, comment le formuler, et surtout etre capable de reconnaitre quand le resultat n'est pas satisfaisant.

C'est une competence que je pense importante pour l'avenir du developpement.

---

*Lucas - Decembre 2024*
