# Changelog — GNU Orbital Simulator

Tous les changements notables apportés à ce projet seront documentés dans ce fichier.

Le format est inspiré de **Keep a Changelog**  
et le projet suit une **version sémantique simplifiée** (`MAJOR.MINOR.PATCH`).

---

## [0.0.2] — 2025-12-30

### ✨ Améliorations

#### 🧭 Grille et numérotation géographique
- Ajout d’une **option d’interface (case à cocher)** permettant :
  - d’**activer ou désactiver** l’affichage des numéros de méridiens et parallèles
- Paramétrisation de la **taille des caractères** des labels :
  - contrôle via les constantes `LABEL_FONT_SIZE` et `LABEL_SCALE`
- Amélioration de la lisibilité générale des labels sur le globe

#### 🎛️ Interface utilisateur
- Interface rendue plus flexible pour un usage :
  - pédagogique (labels visibles)
  - immersif / esthétique (labels masqués)
- Aucune régression fonctionnelle sur les modes existants

#### 🧰 Technique
- Regroupement des labels géographiques dans un groupe dédié (`labelGroup`)
- Activation/désactivation instantanée sans recalcul de la scène
- Préparation de l’architecture pour d’autres options d’affichage (ex. grille)

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

## Licence

Ce projet est distribué sous licence **GNU GPL v3** (ou ultérieure).
