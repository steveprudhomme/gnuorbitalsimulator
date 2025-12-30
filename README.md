# GNU Orbital Simulator — v0.0.2

**GNU Orbital Simulator** est une application Web (HTML5 / CSS3 / JavaScript) de simulation orbitale 3D, centrée sur une visualisation **Terre–Lune** interactive, avec une ligne du temps contrôlable (date/heure) et un **mode mission** (ex. **Vostok 1**) affichant un point au sol (*ground track*) et une trajectoire tracée sur le globe.

> README inspiré par la structure et l’approche documentaire du projet **GNU Astro Galery**.

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Philosophie de simulation](#philosophie-de-simulation)
- [Contrôles (caméra et temps)](#contrôles-caméra-et-temps)
- [Grille et numérotation géographique](#grille-et-numérotation-géographique)
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

- 🌍 **Terre 3D texturée**
- 🧭 **Grille de méridiens et parallèles**
- 🔢 **Numérotation des latitudes et longitudes**
  - taille configurable
  - activation/désactivation via l’interface (v0.0.2)
- 🌙 **Lune 3D** (modèle simple/illustratif — extensible)
- 🕒 **Contrôle du temps**
  - sélection date/heure
  - bouton *Now*
- 🎥 **Caméra libre**
  - rotation
  - zoom
  - déplacement (pan)
- 🛰️ **Mode mission**
  - exemple historique : **Vostok 1**
  - point au sol (*ground track*)
  - trajectoire dynamique tracée sur la Terre
  - lecteur de mission interactif

---

## Philosophie de simulation

Le projet repose sur une séparation claire des concepts :

1. **Référentiel Terre**
   - texture equirectangulaire
   - grille géographique
   - labels indépendants
2. **Rotation terrestre réaliste**
   - calculée à partir du temps (GMST)
3. **Missions orbitales**
   - calcul de position orbitale
   - projection Terre-fixe (*ground track*)

Objectif : offrir une visualisation **pédagogique**, **débogable** et **évolutive**, sans masquer les hypothèses de modélisation.

---

## Contrôles (caméra et temps)

### Caméra (OrbitControls)
- **Clic gauche** : rotation
- **Molette** : zoom
- **Shift + glisser** : déplacement latéral

### Temps
- Sélecteur **date / heure**
- Bouton **Now**
- Mise à jour dynamique :
  - rotation terrestre
  - position des missions actives

---

## Grille et numérotation géographique (v0.0.2)

- Affichage des **méridiens et parallèles**
- Numérotation :
  - latitudes (−60° à +60°)
  - longitudes (E / W)
- **Nouvelle option v0.0.2** :
  - case à cocher dans l’interface pour **afficher / masquer les numéros**
- Taille des caractères :
  - réglable dans le code (`LABEL_FONT_SIZE`, `LABEL_SCALE`)

Cette approche permet une utilisation :
- **pédagogique** (labels visibles)
- **immersive / esthétique** (labels masqués)

---

## Mode mission : Vostok 1

Lorsque le mode **Vostok 1** est activé :

- Le simulateur se positionne au **début réel de la mission**
- Un **point au sol** apparaît à la verticale du vaisseau
- La **trajectoire orbitale** se trace progressivement sur le globe
- Un **lecteur de mission** apparaît en bas de page

### Lecteur (Player)

- ▶️ **Play / Pause**
- ⏹ **Stop**
- 🔁 **Recommencer**
- ⚡ **Lecture rapide** (mission complète en ~10 secondes)
- 📍 **Chapitres** :
  - Décollage
  - Mise en orbite
  - Phase orbitale
  - Rétrofusée
  - Réentrée
  - Atterrissage

> Le modèle utilisé est un modèle *mission-based calibré* (et non un TLE historique brut).

---

## Structure du projet

Structure recommandée (Vite) :

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

- **Node.js 18+** recommandé
- Navigateur moderne :
  - Chrome
  - Firefox
  - Edge

### Dépendances principales
- `three`
- `satellite.js` (GMST / bases orbitales)

---

## Installation

```bash
git clone <url-du-repo>
cd GNU-orbital-simulator
npm install
npm run dev
```

Ouvre ensuite l’URL affichée (ex. `http://localhost:5173`).

---

## Utilisation

1. Lancer le serveur de développement
2. Ajuster la **date / heure**
3. Activer **Vostok 1**
4. Utiliser le **lecteur** pour explorer la mission
5. Activer/désactiver la **numérotation géographique** selon le besoin

---

## Textures

Le projet utilise volontairement des **textures locales** afin d’éviter :
- les problèmes de CDN bloqué
- les dépendances externes non contrôlées

### Texture par défaut
```
public/textures/earth_daymap.jpg
```

> Si la texture change, un ajustement du paramètre  
> `EARTH_TEXTURE_LON_OFFSET` peut être nécessaire.

---

## Déploiement (GitHub Pages)

### Option recommandée — Vite

1. Définir la base dans `vite.config.js` :
   ```js
   export default {
     base: "/GNU-orbital-simulator/"
   }
   ```

2. Build :
   ```bash
   npm run build
   ```

3. Publier le dossier `dist/` sur GitHub Pages.

---

## Dépannage

### Page blanche
- Vérifier la console (F12)
- Causes fréquentes :
  - texture manquante
  - mauvais chemin `/textures/...`
  - ouverture directe via `file://`

### Position incorrecte des missions
- Vérifier :
  - le modèle orbital utilisé
  - la rotation terrestre (GMST)
  - le paramètre `EARTH_TEXTURE_LON_OFFSET`

---

## Sécurité et confidentialité

- Simulation **100 % locale**
- Aucune donnée personnelle
- Aucun appel réseau requis

---

## Licence

- Code : **GNU GPL v3**
- Textures : selon la licence des sources utilisées

---

## Crédits

- **Three.js**
- **satellite.js**
- Textures Terre : sources publiques (NASA / Blue Marble ou équivalent)
- Inspiration documentaire : **GNU Astro Galery**

---

**Auteur**  
Steve Prud’Homme  
