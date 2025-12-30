# Changelog — GNU Orbital Simulator

Tous les changements notables apportés à ce projet seront documentés dans ce fichier.

Le format est inspiré de **Keep a Changelog**  
et le projet suit une **version sémantique simplifiée** (`MAJOR.MINOR.PATCH`).

---

## [0.0.1] — 2025-12-29

### 🎉 Première version publique

#### ✨ Fonctionnalités
- Ajout d’une scène 3D **Terre–Lune** interactive basée sur **Three.js**
- Texture terrestre locale (equirectangulaire) avec :
  - grille de méridiens et parallèles
  - labels de latitude et longitude
- Contrôles caméra complets :
  - rotation
  - zoom
  - déplacement (pan)
- Gestion du **temps et de la date** avec mise à jour dynamique de la scène
- Rotation réaliste de la Terre basée sur le **GMST**
- Affichage d’un fond étoilé

#### 🛰️ Mode mission — Vostok 1
- Activation du mode mission via bouton dédié
- Positionnement initial calibré sur **Baïkonour**
- Affichage d’un **point au sol (ground track)**
- Trajectoire tracée dynamiquement sur le globe
- Modèle orbital “mission-based” (calibré historiquement)
- Gestion approximative de la phase de réentrée et de l’atterrissage (région de Saratov)

#### ▶️ Lecteur de mission (Player)
- Boutons :
  - Play / Pause
  - Stop
  - Recommencer
  - Lecture rapide (mission complète en ~10 s)
- Navigation par **chapitres** :
  - Décollage
  - Mise en orbite
  - Phase orbitale
  - Rétrofusée
  - Réentrée
  - Atterrissage
- Sous-titres contextuels selon l’étape de la mission

#### 🧰 Technique
- Architecture modulaire dans `main.js`
- Utilisation de `satellite.js` pour le calcul du GMST
- Textures locales (aucune dépendance CDN bloquante)
- Compatible déploiement **GitHub Pages**

---

## À venir (Roadmap)

### [0.1.0] — Prévu
- Support des **TLE réels** (SGP4) quand disponibles
- Sélecteur de missions multiples
- Mode LEO / MEO / GEO générique
- Amélioration de la Lune (éphémérides réelles)
- Option d’affichage altitude / vitesse / période

### [0.2.0] — Idées
- Visualisation 3D de l’orbite (au-dessus de la Terre)
- Mode inertiel (ECI) vs Terre-fixe
- Export image / vidéo
- Mode pédagogique (annotations interactives)

---

## Licence

Ce projet est distribué sous licence **GNU GPL v3** (ou ultérieure).
