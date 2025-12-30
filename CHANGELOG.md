# Changelog — GNU Orbital Simulator

Tous les changements notables de **GNU Orbital Simulator** sont documentés dans ce fichier.

Le format suit l’esprit de **Keep a Changelog**  
et la numérotation respecte le **Semantic Versioning (MAJOR.MINOR.PATCH)**.

---

## [0.0.3] — 2025-12-30

### Modifié

#### 🧩 Architecture interne
- Refactor majeur de l’architecture interne sans modification du comportement utilisateur
- Réduction significative de la taille de `main.js`, désormais limité à un rôle d’orchestrateur
- Découpage du code en modules spécialisés :
  - `core/scene.js` : scène, caméra, renderer, contrôles et gestion du resize
  - `core/time.js` : gestion du temps, dates et synchronisation UI
  - `earth/earth.js` : Terre, texture, rotation GMST, grille et labels
  - `earth/gridLabels.js` : grille latitude/longitude et numérotation
  - `moon/moon.js` : Lune (logique existante, inchangée)
  - `ui/ui.js` : interface utilisateur principale
  - `ui/player.js` : lecteur de mission (playback, chapitres)
  - `missions/vostok1.js` : données structurées de la mission
  - `missions/vostokRuntime.js` : rendu, trajectoire et logique de mission

#### 🧰 Maintenabilité
- Séparation claire des responsabilités entre modules
- Code rendu plus lisible et extensible
- Préparation explicite à l’intégration future :
  - du Soleil et de l’éclairage dynamique
  - de missions multiples via fichiers dédiés

---

## [0.0.2] — 2025-12-29

### Ajouté
- Option d’interface (case à cocher) pour afficher ou masquer les numéros de méridiens et parallèles
- Paramétrisation de la taille des labels géographiques

### Modifié
- Amélioration de la lisibilité des labels latitude/longitude
- Mise à jour du README.md
- Ajout du fichier ROADMAP.md
- Mise à jour du CHANGELOG.md

---

## [0.0.1] — 2025-12-29

### Ajouté
- Première version publique de GNU Orbital Simulator
- Scène 3D Terre–Lune interactive basée sur Three.js
- Texture terrestre locale avec grille latitude/longitude
- Gestion du temps et rotation terrestre réaliste (GMST)
- Mode mission Vostok 1 :
  - point au sol (ground track)
  - trajectoire orbitale tracée sur le globe
  - lecteur de mission avec chapitres
- Support du déploiement via GitHub Pages

---

**Auteur**  
Steve Prud’Homme
