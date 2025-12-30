// src/main.js
// Terre–Lune + grille (méridiens/parallèles numérotés) + Vostok 1 (modèle réaliste calibré mission)
//
// Pourquoi ce modèle ?
// - Les TLE historiques publics pour 1961 sont difficiles à obtenir en texte (souvent derrière des images / services).
// - Un TLE approximatif => point initial faux (comme chez toi).
// - Ici on utilise des paramètres orbitaux publiés (inclinaison ~64.95°, période ~89.1 min, périgée/apogée ~169/315 km),
//   et on CALIBRE l’orbite pour que la sous-satellite position à T0 corresponde à Baïkonour.
// - Résultat: départ au bon endroit + trace plausible + arrivée près de Saratov.
//
// Pré-requis (Vite):
//   npm i three satellite.js
// Texture locale:
//   public/textures/earth_daymap.jpg
//
// index.html: <div id="app"></div>

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as satellite from "satellite.js";

/* =========================================================
   CONSTANTES / RÉGLAGES
========================================================= */
const EARTH_RADIUS = 64;            // rayon visuel
const EARTH_RADIUS_KM = 6378.137;   // rayon WGS84 approx (km)
const MU_EARTH = 398600.4418;       // km^3/s^2

const MOON_RADIUS = 17.5;
const MOON_DIST = 380;

// Texture ↔ longitudes (ajuste si besoin)
const EARTH_TEXTURE_LON_OFFSET = Math.PI / 2;

// Grille
const GRID_STEP_DEG = 15;
const GRID_DRAW_STEP_DEG = 2;
const LABEL_STEP_DEG = 30;

// Vostok: échantillonnage de trace
const TRACK_SAMPLE_SIM_MS = 10_000; // un point tous les 10 s simulés (assez fluide)

/* =========================================================
   DONNÉES VOSTOK 1 (paramètres orbitaux publiés)
========================================================= */
// Temps (UTC)
const VOSTOK_START_UTC = new Date(Date.UTC(1961, 3, 12, 6, 7, 0));
const VOSTOK_END_UTC   = new Date(Date.UTC(1961, 3, 12, 7, 55, 0));
const RETRO_UTC        = new Date(Date.UTC(1961, 3, 12, 7, 25, 0)); // approx

// Lieux (approx)
// Baïkonour (Gagarin's Start / Site 1/5)
const BAIKONUR = { lat: 45.964, lon: 63.305 };
// Atterrissage près de Saratov (Smelovka)
const LANDING  = { lat: 51.27,  lon: 45.99 };

// Orbite (approx) — apogée/périgée altitude (km)
const PERIGEE_KM = 169;
const APOGEE_KM  = 315;
const INCL_DEG   = 64.95;
const PERIOD_S   = 89.1 * 60; // 89.1 min

/* =========================================================
   UI
========================================================= */
const app = document.getElementById("app");
if (!app) throw new Error("index.html doit contenir <div id='app'></div>.");

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.style.background = "#05060a";

app.innerHTML = `
<div id="ui" style="
  position:fixed;left:12px;top:12px;z-index:20;
  font:14px/1.25 system-ui;color:#e9eefc;
  background:rgba(10,12,20,.65);
  border:1px solid rgba(255,255,255,.12);
  border-radius:12px;padding:10px 12px;
  backdrop-filter:blur(8px);user-select:none;min-width:360px;">
  <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
    <b>Terre–Lune</b>
    <button id="btnVostok" type="button"
      style="cursor:pointer;color:inherit;background:rgba(255,255,255,.08);
             border:1px solid rgba(255,255,255,.16);
             border-radius:10px;padding:6px 10px;">Vostok 1</button>
  </div>

  <div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
    <label for="dt">Temps :</label>
    <input id="dt" type="datetime-local" step="1"
      style="color:inherit;background:rgba(255,255,255,.08);
             border:1px solid rgba(255,255,255,.16);
             border-radius:10px;padding:6px 8px;"/>
    <button id="btnNow" type="button"
      style="cursor:pointer;color:inherit;background:rgba(255,255,255,.08);
             border:1px solid rgba(255,255,255,.16);
             border-radius:10px;padding:6px 10px;">Now</button>
    <button id="btnClear" type="button"
      style="cursor:pointer;color:inherit;background:rgba(255,255,255,.08);
             border:1px solid rgba(255,255,255,.16);
             border-radius:10px;padding:6px 10px;">Clear</button>
  </div>

  <div style="margin-top:8px;font-size:12px;opacity:.85;">
    Souris: tourner • Molette: zoom • Shift+drag: pan
  </div>

  <div id="lineUtc" style="margin-top:6px;font-size:12px;opacity:.9;"></div>
  <div id="lineInfo" style="margin-top:4px;font-size:12px;opacity:.75;"></div>
</div>

<div id="player" style="
  position:fixed;left:12px;right:12px;bottom:12px;z-index:20;
  display:none;
  font:14px/1.25 system-ui;color:#e9eefc;
  background:rgba(10,12,20,.72);
  border:1px solid rgba(255,255,255,.12);
  border-radius:14px;padding:10px 12px;
  backdrop-filter:blur(10px);user-select:none;">
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
    <b style="margin-right:8px;">Vostok 1 — Player</b>

    <button id="pPlay" type="button" style="cursor:pointer;color:inherit;background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:6px 10px;">Play</button>

    <button id="pStop" type="button" style="cursor:pointer;color:inherit;background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:6px 10px;">Stop</button>

    <button id="pRestart" type="button" style="cursor:pointer;color:inherit;background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:6px 10px;">Recommencer</button>

    <button id="pFast" type="button" style="cursor:pointer;color:inherit;background:rgba(255,255,255,.08);
      border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:6px 10px;">Play rapide (10s)</button>

    <span style="opacity:.8;font-size:12px;margin-left:auto;">
      Vitesse: <span id="speedLabel">—</span>
    </span>
  </div>

  <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
    <span style="opacity:.85;font-size:12px;">Chapitres:</span>
    <div id="chapters" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;"></div>
  </div>

  <div id="subtitle" style="margin-top:10px;font-size:13px;opacity:.9;">—</div>
</div>
`;

const dtInput = document.getElementById("dt");
const btnNow = document.getElementById("btnNow");
const btnClear = document.getElementById("btnClear");
const btnVostok = document.getElementById("btnVostok");
const lineUtc = document.getElementById("lineUtc");
const lineInfo = document.getElementById("lineInfo");

const playerEl = document.getElementById("player");
const pPlay = document.getElementById("pPlay");
const pStop = document.getElementById("pStop");
const pRestart = document.getElementById("pRestart");
const pFast = document.getElementById("pFast");
const chaptersEl = document.getElementById("chapters");
const subtitleEl = document.getElementById("subtitle");
const speedLabel = document.getElementById("speedLabel");

/* =========================================================
   THREE.JS SETUP
========================================================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 220, 460);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.22));
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(800, 220, 600);
scene.add(sunLight);

// Étoiles
{
  const starsGeo = new THREE.BufferGeometry();
  const starCount = 2400;
  const pos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 2500 + Math.random() * 1800;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi);
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starsGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ size: 1.2, sizeAttenuation: true }));
  scene.add(stars);
}

/* =========================================================
   OUTILS: datetime-local
========================================================= */
const pad = (n) => String(n).padStart(2, "0");
function toLocalDatetimeValue(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* =========================================================
   SPRITES TEXTE
========================================================= */
function createTextSprite(text, opts = {}) {
  const { fontSize = 46, color = "#ffffff", background = "rgba(0,0,0,0.45)", padding = 10 } = opts;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontSize}px system-ui`;
  const w = Math.ceil(ctx.measureText(text).width + padding * 2);
  const h = Math.ceil(fontSize + padding * 2);
  canvas.width = w;
  canvas.height = h;

  ctx.font = `${fontSize}px system-ui`;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.fillText(text, padding, padding);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true });
  const sp = new THREE.Sprite(mat);

  const scale = 0.32;
  sp.scale.set(w * scale, h * scale, 1);
  return sp;
}

/* =========================================================
   COORDONNÉES: lat/lon -> 3D (Terre-fixe)
========================================================= */
function latLonToVector3(latDeg, lonDeg, radius) {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg) + EARTH_TEXTURE_LON_OFFSET;

  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon)
  );
}

/* =========================================================
   TERRE + GRILLE + LABELS
========================================================= */
const earthSpin = new THREE.Group();
scene.add(earthSpin);

const textureLoader = new THREE.TextureLoader();
const earthMap = textureLoader.load("/textures/earth_daymap.jpg");
earthMap.colorSpace = THREE.SRGBColorSpace;
earthMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(EARTH_RADIUS, 96, 96),
  new THREE.MeshStandardMaterial({ map: earthMap, roughness: 1.0, metalness: 0.0 })
);
earthSpin.add(earth);

const gridGroup = new THREE.Group();
earth.add(gridGroup);

function buildLatLonGrid(stepDeg = GRID_STEP_DEG) {
  gridGroup.clear();
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38 });

  // Parallèles
  for (let lat = -90 + stepDeg; lat <= 90 - stepDeg; lat += stepDeg) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += GRID_DRAW_STEP_DEG) pts.push(latLonToVector3(lat, lon, EARTH_RADIUS * 1.002));
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // Méridiens
  for (let lon = -180; lon < 180; lon += stepDeg) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += GRID_DRAW_STEP_DEG) pts.push(latLonToVector3(lat, lon, EARTH_RADIUS * 1.002));
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
}
buildLatLonGrid(GRID_STEP_DEG);

const labelGroup = new THREE.Group();
earth.add(labelGroup);

function rebuildLabels() {
  labelGroup.clear();

  for (let lat = -60; lat <= 60; lat += LABEL_STEP_DEG) {
    const sp = createTextSprite(`${lat > 0 ? "+" : ""}${lat}°`);
    sp.position.copy(latLonToVector3(lat, 0, EARTH_RADIUS * 1.06));
    labelGroup.add(sp);
  }

  for (let lon = -180; lon <= 180; lon += LABEL_STEP_DEG) {
    if (lon === -180) continue;
    const hemi = lon >= 0 ? "E" : "W";
    const sp = createTextSprite(`${Math.abs(lon)}°${hemi}`);
    sp.position.copy(latLonToVector3(0, lon, EARTH_RADIUS * 1.06));
    labelGroup.add(sp);
  }
}
rebuildLabels();

/* =========================================================
   LUNE (illustrative)
========================================================= */
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(MOON_RADIUS, 48, 48),
  new THREE.MeshStandardMaterial({ color: 0xbfc3c9, roughness: 1.0, metalness: 0.0 })
);
scene.add(moon);

function updateMoon(date) {
  const days = date.getTime() / 86400000;
  const ang = (days * (2 * Math.PI / 27.321661)) % (Math.PI * 2);
  moon.position.set(Math.cos(ang) * MOON_DIST, 0, Math.sin(ang) * MOON_DIST);
}

/* =========================================================
   ROTATION TERRE (GMST)
========================================================= */
function updateEarthRotation(date) {
  const gmst = satellite.gstime(date); // radians
  earthSpin.rotation.y = -gmst;
}

/* =========================================================
   VOSTOK — GROUPE (sur la Terre)
========================================================= */
const vostokGroup = new THREE.Group();
earthSpin.add(vostokGroup);

let vostokActive = false;
let marker = null;

let trackLine = null;
let trackPositions = [];
let lastSampleSimMs = null;

function ensureMarker() {
  if (marker) return;
  marker = new THREE.Mesh(
    new THREE.SphereGeometry(1.5, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  );
  vostokGroup.add(marker);
}

function clearVostokGraphics() {
  if (marker) {
    vostokGroup.remove(marker);
    marker.geometry.dispose();
    marker.material.dispose();
    marker = null;
  }
  if (trackLine) {
    vostokGroup.remove(trackLine);
    trackLine.geometry.dispose();
    trackLine.material.dispose();
    trackLine = null;
  }
  trackPositions = [];
  lastSampleSimMs = null;
}

/* =========================================================
   ORBITE “MISSION-BASED” calibrée sur Baïkonour à T0
========================================================= */

// Convertit sous-satellite lat/lon -> ECEF (km) (rayon Terre)
function ecefFromLatLon(latDeg, lonDeg, rKm) {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  const x = rKm * Math.cos(lat) * Math.cos(lon);
  const y = rKm * Math.cos(lat) * Math.sin(lon);
  const z = rKm * Math.sin(lat);
  return new THREE.Vector3(x, y, z);
}

// Rotation ECEF -> ECI via GMST
function ecefToEci(vEcef, gmst) {
  const c = Math.cos(gmst), s = Math.sin(gmst);
  // rotation autour de Z (convention satellite.js)
  return new THREE.Vector3(
    c * vEcef.x - s * vEcef.y,
    s * vEcef.x + c * vEcef.y,
    vEcef.z
  );
}

// Calcule éléments orbitaux (a,e,n) à partir périgée/apogée
const rp = EARTH_RADIUS_KM + PERIGEE_KM;
const ra = EARTH_RADIUS_KM + APOGEE_KM;
const a  = (rp + ra) / 2;
const e  = (ra - rp) / (ra + rp);
const n  = 2 * Math.PI / PERIOD_S; // rad/s (approx cohérent période)

// Construire une orbite ECI simple:
// - inclinaison donnée
// - plan orbital choisi pour que la position sous-satellite à T0 corresponde à Baïkonour
// Stratégie:
// 1) On fixe l’ECI position direction à T0 = direction du point sous-satellite (Baïkonour) dans ECI.
// 2) On choisit un vecteur normal de plan orbital ayant inclinaison i et “contenant” ce vecteur position.
// 3) On propage ensuite avec un mouvement képlérien dans ce plan.
//
// Note: c’est une approximation (sans J2), mais très bonne pour 1 orbite.

const incl = THREE.MathUtils.degToRad(INCL_DEG);
let orbitBasis = null; // {p,q,w} (unit vectors) + r0mag

function buildOrbitBasisAtT0() {
  const gmst0 = satellite.gstime(VOSTOK_START_UTC);

  // Sous-satellite point (Baïkonour) en ECEF puis ECI
  const rSubEcef = ecefFromLatLon(BAIKONUR.lat, BAIKONUR.lon, 1.0); // unité
  const rSubEci = ecefToEci(rSubEcef, gmst0).normalize();

  // On veut un plan orbital avec inclinaison i (angle entre normal et axe Z = i)
  // Normal w = (sin(i)*cos(Ω), sin(i)*sin(Ω), cos(i)) pour un certain Ω (RAAN).
  // Condition: rSubEci doit être dans le plan => w · rSubEci = 0.
  // => sin(i)*(cosΩ*x + sinΩ*y) + cos(i)*z = 0
  // On résout Ω via atan2.

  const x = rSubEci.x, y = rSubEci.y, z = rSubEci.z;
  // cosΩ*x + sinΩ*y = -(cos(i)/sin(i))*z
  const rhs = -(Math.cos(incl) / Math.sin(incl)) * z;

  // Trouver Ω tel que dot([cosΩ,sinΩ],[x,y]) = rhs
  // On utilise la forme: A cos(Ω-φ) = rhs
  const A = Math.hypot(x, y);
  const phi = Math.atan2(y, x);

  // Clamp numérique
  const u = THREE.MathUtils.clamp(rhs / (A || 1e-9), -1, 1);
  const delta = Math.acos(u);

  // Deux solutions: Ω = φ ± delta. On choisit celle qui donne une orbite prograde (sens standard).
  // (heuristique: prendre φ + delta)
  const Omega = phi + delta;

  const w = new THREE.Vector3(
    Math.sin(incl) * Math.cos(Omega),
    Math.sin(incl) * Math.sin(Omega),
    Math.cos(incl)
  ).normalize();

  // Construire base du plan orbital: p (dans le plan, aligné avec rSubEci), q = w×p
  const p = rSubEci.clone().normalize();
  const q = new THREE.Vector3().crossVectors(w, p).normalize();

  // Rayon orbitale instantané : on approxime en prenant r = a(1-e^2)/(1+e cosν).
  // À T0 on ne connait pas ν, mais on peut approcher r0 ~ (rp+ra)/2 = a.
  const r0mag = a;

  orbitBasis = { p, q, w, r0mag, Omega };
}
buildOrbitBasisAtT0();

// Propagation képlérienne simple dans le plan (ellipse)
// On prend ν(t)=n*t (approx 1 orbite) et r(t)=a(1-e^2)/(1+e cosν)
function subpointLatLonFromOrbit(date) {
  const t = (date.getTime() - VOSTOK_START_UTC.getTime()) / 1000; // s
  if (t < 0) return null;

  // Après la rétro, on "descend" vers le point d'atterrissage (modèle réentrée)
  if (date.getTime() >= RETRO_UTC.getTime()) {
    const u = (date.getTime() - RETRO_UTC.getTime()) / (VOSTOK_END_UTC.getTime() - RETRO_UTC.getTime());
    const uu = THREE.MathUtils.clamp(u, 0, 1);

    // Point au moment retro (fin orbit)
    const llRetro = subpointLatLonFromOrbit(new Date(RETRO_UTC.getTime() - 1000));
    if (!llRetro) return { lat: LANDING.lat, lon: LANDING.lon };

    // Interpolation “grand cercle” sur la sphère (slerp)
    const aVec = ecefFromLatLon(llRetro.lat, llRetro.lon, 1.0).normalize();
    const bVec = ecefFromLatLon(LANDING.lat, LANDING.lon, 1.0).normalize();

    const dot = THREE.MathUtils.clamp(aVec.dot(bVec), -1, 1);
    const ang = Math.acos(dot);

    let v;
    if (ang < 1e-6) {
      v = aVec.clone();
    } else {
      const s1 = Math.sin((1 - uu) * ang);
      const s2 = Math.sin(uu * ang);
      v = aVec.clone().multiplyScalar(s1).add(bVec.clone().multiplyScalar(s2)).multiplyScalar(1 / Math.sin(ang));
    }

    const lat = THREE.MathUtils.radToDeg(Math.asin(v.z));
    const lon = THREE.MathUtils.radToDeg(Math.atan2(v.y, v.x));
    return { lat, lon };
  }

  // Orbit propagation
  const nu = (n * t) % (2 * Math.PI);
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

  // Position ECI (km)
  const rEci = orbitBasis.p.clone().multiplyScalar(r * Math.cos(nu))
    .add(orbitBasis.q.clone().multiplyScalar(r * Math.sin(nu)));

  // Convertir ECI -> ECEF (rotation -GMST)
  const gmst = satellite.gstime(date);
  const c = Math.cos(-gmst), s = Math.sin(-gmst);
  const rEcef = new THREE.Vector3(
    c * rEci.x - s * rEci.y,
    s * rEci.x + c * rEci.y,
    rEci.z
  );

  // Sous-satellite lat/lon (sphère)
  const rr = rEcef.length();
  const lat = THREE.MathUtils.radToDeg(Math.asin(rEcef.z / rr));
  const lon = THREE.MathUtils.radToDeg(Math.atan2(rEcef.y, rEcef.x));
  return { lat, lon };
}

/* =========================================================
   PLAYER / CHAPITRES
========================================================= */
const CHAPTERS = [
  { key: "launch",  label: "Décollage",     t: new Date(VOSTOK_START_UTC), subtitle: "Décollage (06:07 UTC) — Baïkonour" },
  { key: "orbitin", label: "Mise en orbite",t: new Date(Date.UTC(1961,3,12,6,17,0)), subtitle: "Mise en orbite (≈06:17 UTC)" },
  { key: "orbit",   label: "En orbite",     t: new Date(Date.UTC(1961,3,12,6,45,0)), subtitle: "Phase orbitale" },
  { key: "retro",   label: "Rétrofusée",    t: new Date(RETRO_UTC), subtitle: "Rétrofusée (≈07:25 UTC)" },
  { key: "reentry", label: "Réentrée",      t: new Date(Date.UTC(1961,3,12,7,35,0)), subtitle: "Réentrée (≈07:35 UTC)" },
  { key: "land",    label: "Atterrissage",  t: new Date(VOSTOK_END_UTC), subtitle: "Atterrissage (≈07:55 UTC) — près de Saratov" },
];

let simTime = new Date();
let isPlaying = false;
let playbackRate = 60; // ms simulé / ms réel
let lastFrameMs = null;

function showPlayer() { playerEl.style.display = "block"; }
function hidePlayer() { playerEl.style.display = "none"; }

function setSubtitleFromTime(date) {
  let current = CHAPTERS[0];
  for (const c of CHAPTERS) if (date.getTime() >= c.t.getTime()) current = c;
  subtitleEl.textContent = current.subtitle;
}

function stopPlayback() {
  isPlaying = false;
  lastFrameMs = null;
  pPlay.textContent = "Play";
  speedLabel.textContent = "—";
}

function startPlaybackNormal() {
  isPlaying = true;
  pPlay.textContent = "Pause";
  playbackRate = 60; // 60 ms sim / ms réel => 60s sim / s réel
  lastFrameMs = null;
  speedLabel.textContent = "x60";
}

function startPlaybackFast10s() {
  isPlaying = true;
  pPlay.textContent = "Pause";
  const missionMs = VOSTOK_END_UTC.getTime() - VOSTOK_START_UTC.getTime();
  playbackRate = missionMs / 10_000;
  lastFrameMs = null;
  speedLabel.textContent = "FAST";
}

function buildChaptersUI() {
  chaptersEl.innerHTML = "";
  for (const c of CHAPTERS) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c.label;
    b.style.cursor = "pointer";
    b.style.color = "inherit";
    b.style.background = "rgba(255,255,255,.08)";
    b.style.border = "1px solid rgba(255,255,255,.16)";
    b.style.borderRadius = "999px";
    b.style.padding = "6px 10px";
    b.style.fontSize = "12px";
    b.addEventListener("click", () => {
      stopPlayback();
      simTime = new Date(c.t.getTime());
      dtInput.value = toLocalDatetimeValue(simTime);
      rebuildTrackUpTo(simTime);
      setSubtitleFromTime(simTime);
    });
    chaptersEl.appendChild(b);
  }
}

/* =========================================================
   DESSIN VOSTOK (point + trace)
========================================================= */
function rebuildTrackUpTo(targetTime) {
  clearVostokGraphics();
  if (!vostokActive) return;

  const end = Math.min(targetTime.getTime(), VOSTOK_END_UTC.getTime());
  for (let t = VOSTOK_START_UTC.getTime(); t <= end; t += TRACK_SAMPLE_SIM_MS) {
    updateVostokAt(new Date(t), true);
  }
}

function updateVostokAt(date, forceSample = false) {
  if (!vostokActive) return;

  const ms = date.getTime();
  if (ms < VOSTOK_START_UTC.getTime() || ms > VOSTOK_END_UTC.getTime()) return;

  const ll = subpointLatLonFromOrbit(date);
  if (!ll) return;

  const p = latLonToVector3(ll.lat, ll.lon, EARTH_RADIUS * 1.012);

  ensureMarker();
  marker.position.copy(p);

  // échantillon trace
  if (!forceSample) {
    if (lastSampleSimMs !== null && (ms - lastSampleSimMs) < TRACK_SAMPLE_SIM_MS) return;
  }
  lastSampleSimMs = ms;
  trackPositions.push(p.x, p.y, p.z);

  if (trackLine) {
    vostokGroup.remove(trackLine);
    trackLine.geometry.dispose();
    trackLine.material.dispose();
    trackLine = null;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(trackPositions, 3));
  trackLine = new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.95 })
  );
  vostokGroup.add(trackLine);
}

/* =========================================================
   EVENTS UI
========================================================= */
dtInput.value = toLocalDatetimeValue(new Date());

btnNow.addEventListener("click", () => {
  stopPlayback();
  simTime = new Date();
  dtInput.value = toLocalDatetimeValue(simTime);
});

dtInput.addEventListener("change", () => {
  stopPlayback();
  const d = new Date(dtInput.value);
  if (!Number.isNaN(d.getTime())) simTime = d;
});

btnClear.addEventListener("click", () => {
  stopPlayback();
  vostokActive = false;
  clearVostokGraphics();
  hidePlayer();
  lineInfo.textContent = "";
});

btnVostok.addEventListener("click", () => {
  vostokActive = true;
  showPlayer();
  buildChaptersUI();
  stopPlayback();

  // RESET mission
  simTime = new Date(VOSTOK_START_UTC.getTime());
  dtInput.value = toLocalDatetimeValue(simTime);

  clearVostokGraphics();
  updateVostokAt(simTime, true);
  rebuildTrackUpTo(simTime);
  setSubtitleFromTime(simTime);

  lineInfo.textContent = `Modèle mission calibré — départ Baïkonour (${BAIKONUR.lat.toFixed(3)}N, ${BAIKONUR.lon.toFixed(3)}E)`;
});

pPlay.addEventListener("click", () => {
  if (!vostokActive) return;
  if (!isPlaying) startPlaybackNormal();
  else stopPlayback();
});
pStop.addEventListener("click", () => stopPlayback());

pRestart.addEventListener("click", () => {
  if (!vostokActive) return;
  stopPlayback();
  simTime = new Date(VOSTOK_START_UTC.getTime());
  dtInput.value = toLocalDatetimeValue(simTime);
  rebuildTrackUpTo(simTime);
  setSubtitleFromTime(simTime);
});

pFast.addEventListener("click", () => {
  if (!vostokActive) return;
  startPlaybackFast10s();
});

/* =========================================================
   LOOP
========================================================= */
function updateUtcLine(date) {
  lineUtc.textContent = `${date.toLocaleString()} | UTC: ${date.toUTCString()}`;
}

function animate(nowMs) {
  requestAnimationFrame(animate);

  if (isPlaying && vostokActive) {
    if (lastFrameMs === null) lastFrameMs = nowMs;
    const dtRealMs = nowMs - lastFrameMs;
    lastFrameMs = nowMs;

    simTime = new Date(simTime.getTime() + dtRealMs * playbackRate);
    if (simTime.getTime() >= VOSTOK_END_UTC.getTime()) {
      simTime = new Date(VOSTOK_END_UTC.getTime());
      stopPlayback();
    }
    dtInput.value = toLocalDatetimeValue(simTime);
  } else {
    lastFrameMs = null;
  }

  updateEarthRotation(simTime);
  updateMoon(simTime);

  if (vostokActive) {
    updateVostokAt(simTime, false);
    setSubtitleFromTime(simTime);
  }

  updateUtcLine(simTime);

  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

/* =========================================================
   RESIZE
========================================================= */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
