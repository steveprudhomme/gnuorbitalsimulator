# GNU Orbital Simulator

**GNU Orbital Simulator** est une application Web (HTML5 / CSS3 / JavaScript) de simulation orbitale 3D, centrée sur une visualisation **Terre–Lune** interactive, avec une ligne du temps contrôlable (date/heure) et un **mode mission** (ex. **Vostok 1**) affichant un point au sol (ground track) et une trajectoire tracée sur le globe.

> README inspiré par la structure et l’approche documentaire du projet “GNU Astro Galery”. :contentReference[oaicite:0]{index=0}

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Philosophie de simulation](#philosophie-de-simulation)
- [Contrôles (caméra et temps)](#contrôles-caméra-et-temps)
- [Mode mission : Vostok 1](#mode-mission--vostok-1)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Textures](#textures)
- [Déploiement (GitHub Pages)](#déploiement-github-pages)
- [Dépannage](#dépannage)
- [Sécurité et confidentialité](#sécurité-et-confidentialité)
- [Licence](#licence)
- [Crédits](#crédits)

---

## Fonctionnalités

- 🌍 **Terre 3D texturée** + grille de **méridiens/parallèles** (optionnellement numérotés)
- 🌙 **Lune 3D** (modèle simple/illustratif — extensible vers des éphémérides)
- 🕒 **Contrôle du temps** : la scène se met à jour quand on change la date/heure
- 🎥 **Caméra libre** : rotation, zoom, pan
- 🛰️ **Mode mission** : exemple **Vostok 1**
  - point au sol affiché sur la Terre
  - trajectoire tracée (ground track)
  - lecteur “player” : Play / Pause / Stop / Recommencer / Play rapide + chapitres

---

## Philosophie de simulation

Le projet sépare clairement :

1. **Référentiel Terre** (texture + grille + labels)
2. **Rotation terrestre réaliste** (basée sur le temps : GMST)
3. **Éléments orbitaux / mission** (calcul de position puis projection sur la Terre)

Objectif : une visualisation **compréhensible et pédagogique**, où chaque transformation (référentiel, rotation, projection) est contrôlable et débogable.

---

## Contrôles (caméra et temps)

### Caméra (OrbitControls)
- **Clic gauche** : tourner autour de la scène
- **Molette** : zoom
- **Shift + drag** : pan

### Temps
- Sélecteur **date/heure**
- Bouton **Now**
- Mise à jour automatique de la rotation terrestre + missions actives

---

## Mode mission : Vostok 1

Quand on clique sur **Vostok 1** :
- Le simulateur se place sur la date de la mission (UTC)
- Un **player** apparaît en bas de page
- La trajectoire (ground track) se dessine sur la Terre

### Player (bas de page)
- **Play** : lecture temps accéléré
- **Play rapide (10s)** : mission complète en ~10 secondes
- **Stop** : pause immédiate
- **Recommencer** : retour au début
- **Chapitres** : navigation par étapes (décollage, mise en orbite, etc.)

> Remarque : selon la version choisie, la mission peut être basée sur un modèle “TLE/SGP4” ou un modèle “mission calibrée”.

---

## Structure du projet

Exemple (Vite recommandé) :

```
GNU-orbital-simulator/
  public/
    textures/
      earth_daymap.jpg
  src/
    main.js
    style.css
  index.html
  package.json
  vite.config.js (optionnel)
```

---

## Prérequis

- Node.js **18+** recommandé
- Navigateur moderne (Chrome/Firefox/Edge)

Dépendances typiques :
- **three**
- **satellite.js** (si mode SGP4/TLE ou GMST)

---

## Installation

```bash
git clone <ton-repo>
cd GNU-orbital-simulator
npm install
npm run dev
```

Puis ouvre l’URL affichée (souvent `http://localhost:5173`).

---

## Utilisation

1. Lance le serveur (`npm run dev`)
2. Ajuste la **date/heure**
3. Clique **Vostok 1**
4. Utilise le **player** pour visualiser la mission

---

## Textures

Le projet utilise une texture locale (évite les problèmes de **CDN bloqué**).

### Texture conseillée (simple)
- `public/textures/earth_daymap.jpg`

Si tu changes de texture, il peut y avoir un **décalage de longitude** (offset) à régler dans le code (ex. `EARTH_TEXTURE_LON_OFFSET`).

---

## Déploiement (GitHub Pages)

### Option A — GitHub Pages + Vite (recommandé)

1. Configure le `base` dans `vite.config.js` (si nécessaire) :
   ```js
   export default {
     base: "/GNU-orbital-simulator/"
   }
   ```

2. Build :
   ```bash
   npm run build
   ```

3. Publie `dist/` sur GitHub Pages (branche `gh-pages` ou via Actions).

### Option B — Site statique simple
Si tu ne veux pas Vite, tu peux aussi servir le projet via un serveur local statique,
mais attention : certains navigateurs bloquent les modules ES6 en `file://`.

---

## Dépannage

### Page blanche
- Ouvre la console (F12) et vérifie les erreurs.
- Cause fréquente : mauvaise URL de texture (`/textures/...`) ou projet non servi via serveur.

### “CDN bloqué”
- Utilise des textures **locales** dans `public/`.
- Évite de charger three.js depuis un CDN si ton réseau le bloque.

### Point Vostok pas au bon endroit
- Vérifie :
  - le modèle utilisé (TLE fiable ou “mission calibrée”)
  - le réglage `EARTH_TEXTURE_LON_OFFSET`
  - que la rotation terrestre utilise bien `GMST`

---

## Sécurité et confidentialité

- Simulation 100% locale (navigateur)
- Aucune donnée personnelle requise
- Aucun envoi réseau requis (si textures locales)

---

## Licence

Code : **GNU GPLv3** (recommandée)  
Assets (textures) : vérifier la licence de la texture utilisée.

---

## Crédits

- **Three.js**
- **satellite.js** (GMST / SGP4 selon version)
- Textures Terre : sources publiques (à créditer selon la licence)
- Inspiration structure README : “GNU Astro Galery” :contentReference[oaicite:1]{index=1}

---

**Auteur**  
Steve Prud’Homme
