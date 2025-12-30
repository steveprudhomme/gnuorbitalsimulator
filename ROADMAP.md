# Roadmap — GNU Orbital Simulator

Cette feuille de route décrit l’évolution planifiée du projet **GNU Orbital Simulator**.
Elle est basée sur les objectifs définis et respecte strictement la numérotation **Semantic Versioning (MAJOR.MINOR.PATCH)**.

---

## Règles de versionnement (rappel)

- **PATCH** (`0.0.X`)
  - Refactor interne
  - Modularisation
  - Documentation
  - Commentaires
  - Qualité et bonnes pratiques
  - Aucun changement fonctionnel visible

- **MINOR** (`0.X.0`)
  - Ajout de fonctionnalités compatibles
  - Évolution de l’interface ou des capacités de simulation

- **MAJOR** (`X.0.0`)
  - Changement structurant ou cassant
  - Engagement de stabilité de l’architecture

---

## 🔧 PATCH releases — Série 0.0.x  
*Stabilisation, structure, qualité du code*

---

### v0.0.3 — Modularisation interne (phase 1)

**Objectif**  
Réduire la taille de `main.js` et clarifier l’architecture sans modifier le comportement.

**Étapes**
- Découpage du code existant en modules :
  - création de la scène, caméra et renderer
  - gestion du temps et des dates
  - Terre (texture, rotation GMST, grille, labels)
  - Lune (logique actuelle)
  - Interface utilisateur et lecteur de mission
- Maintien strict des fonctionnalités existantes
- Préparation à l’ajout du Soleil et des missions multiples

---

### v0.0.4 — Missions structurées (refactor)

**Objectif**  
Séparer les données de mission du moteur de simulation.

**Étapes**
- Déplacement de la mission **Vostok 1** dans un fichier dédié
- Définition d’un format de données de mission structuré
- Chargement de la mission depuis un module externe
- **Nouvelle mission (fichier de données)** : créer `Mercury-Redstone 3` (Freedom 7) dans un fichier dédié, sans l’exposer encore dans l’UI (préparation)
- Toujours une seule mission disponible côté utilisateur
- Aucun changement fonctionnel visible

---

### v0.0.5 — Commentaires améliorés (FR / EN)

**Objectif**  
Rendre le code compréhensible, pédagogique et maintenable.

**Étapes**
- Ajout de commentaires bilingues (français / anglais) :
  - référentiels (Terre-fixe, inertiel)
  - rotation terrestre (GMST)
  - conversions lat/lon → 3D
  - logique du lecteur de mission
- Commentaires au niveau :
  - des fichiers
  - des fonctions critiques
- Aucun impact fonctionnel

---

### v0.0.6 — Bonnes pratiques (NASA “10 rules”)

**Objectif**  
Renforcer la robustesse et la discipline de développement.

**Étapes**
- Application progressive de bonnes pratiques :
  - fonctions courtes et lisibles
  - validation des entrées (dates, missions, options)
  - gestion d’erreurs (assets manquants, plages de dates)
  - conventions de nommage cohérentes
- Amélioration de la qualité interne sans ajout de fonctionnalités

---

## 🚀 MINOR releases — Série 0.x.0  
*Ajout de fonctionnalités compatibles*

---

### v0.1.0 — Soleil et éclairage réel

**Objectif**  
Introduire le Soleil comme source lumineuse afin de permettre
la visualisation des phénomènes d’illumination.

**Étapes**
- Ajout du Soleil dans la scène
- Lumière directionnelle liée à la position du Soleil
- Visualisation :
  - alternance jour / nuit sur Terre
  - phases de la Lune
- Préparation géométrique pour l’étude des éclipses

---

### v0.2.0 — Missions multiples (interface)

**Objectif**  
Permettre la sélection de missions via l’interface.

**Étapes**
- Ajout d’une liste déroulante des missions disponibles
- Chargement dynamique des fichiers de mission
- Adaptation du lecteur de mission aux données sélectionnées
- Compatibilité complète avec les missions existantes (ex. **Vostok 1** et **Mercury-Redstone 3**)

---

### v0.3.0 — Interface bilingue (FR / EN)

**Objectif**  
Rendre l’application utilisable en français et en anglais.

**Étapes**
- Mise en place d’un système de chaînes de caractères
- Sélecteur de langue dans l’interface
- Traduction :
  - de l’interface utilisateur
  - du lecteur de mission
  - des chapitres et messages d’information

---

## 🧱 MAJOR release — Série 1.x.x

---

### v1.0.0 — Version stable

**Objectif**  
Première version stable et pérenne du projet.

**Étapes**
- Architecture modulaire finalisée
- Soleil, Terre et Lune cohérents et synchronisés temporellement
- Missions structurées et extensibles
- Interface bilingue complète
- Documentation consolidée (README, CHANGELOG, ROADMAP)
- API interne considérée stable

---

## Remarque finale

Les versions **0.0.x** servent à construire des bases solides.  
Les versions **0.x.0** introduisent les capacités majeures.  
La version **1.0.0** marque l’engagement de stabilité du projet.
