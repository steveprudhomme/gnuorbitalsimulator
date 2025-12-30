# GNU Orbital Simulator — v0.0.3

**GNU Orbital Simulator** est une application Web (HTML5 / CSS3 / JavaScript) de simulation orbitale 3D, centrée sur une visualisation **Terre–Lune** interactive, avec une ligne du temps contrôlable (date/heure) et un **mode mission** (ex. **Vostok 1**) affichant un point au sol (*ground track*) et une trajectoire tracée sur le globe.

> README inspiré par la structure et l’approche documentaire du projet **GNU Astro Galery**.

---

## Table des matières

- Fonctionnalités
- Philosophie de simulation
- Contrôles (caméra et temps)
- Grille et numérotation géographique
- Mode mission : Vostok 1
- Structure du projet
- Prérequis
- Installation
- Utilisation
- Textures
- Déploiement (GitHub Pages)
- Dépannage
- Sécurité et confidentialité
- Licence
- Crédits

---

## Fonctionnalités

- 🌍 Terre 3D texturée
- 🧭 Grille de méridiens et parallèles
- 🔢 Numérotation des latitudes et longitudes (ON/OFF)
- 🌙 Lune 3D (modèle simple)
- 🕒 Contrôle du temps (date/heure + Now)
- 🎥 Caméra libre (rotation, zoom, pan)
- 🛰️ Mode mission Vostok 1
- 🧩 Architecture modulaire (v0.0.3)

---

## Philosophie de simulation

Séparation claire entre :
- Référentiel Terre (texture, grille, labels)
- Temps et rotation terrestre (GMST)
- Missions orbitales (données vs rendu)

Objectif : pédagogie, lisibilité et évolutivité.

---

## Contrôles (caméra et temps)

- Clic gauche : rotation
- Molette : zoom
- Shift + glisser : pan
- Sélecteur date/heure
- Bouton Now

---

## Grille et numérotation géographique

- Méridiens et parallèles visibles
- Labels activables/désactivables
- Taille configurable dans le code

---

## Mode mission : Vostok 1

- Point au sol
- Trajectoire dynamique
- Lecteur avec chapitres

---

## Structure du projet

```
src/
  main.js
  core/
  earth/
  moon/
  ui/
  missions/
```

---

## Prérequis

- Node.js 18+
- Navigateur moderne

---

## Installation

```bash
git clone <repo>
npm install
npm run dev
```

---

## Licence

GNU GPL v3

---

**Auteur**  
Steve Prud’Homme
