// src/main.js
// GNU Orbital Simulator
// Terre–Lune + grille (méridiens/parallèles) + labels numérotés (toggle + taille réglable)
// + Vostok 1 (modèle mission calibré)
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
const EARTH_RADIUS_KM = 6378.137;   // rayon Terre (km)
const MU_EARTH = 398600.4418;       // km^3/s^2 (non utilisé ici mais utile plus tard)

const MOON_RADIUS = 17.5;
const MOON_DIST = 380;

// Texture ↔ longitudes (ajuste si besoin)
const EARTH_TEXTURE_LON_OFFSET = Math.PI / 2;

// Grille
const GRID_STEP_DEG = 15;
const GRID_DRAW_STEP_DEG = 2;
const LABEL_STEP_DEG = 30;

// Labels: taille et échelle
const LABEL_FONT_SIZE = 28; // <-- ajuste ici
const LABEL_SCALE = 0.22;   // <-- ajuste ici

// Vostok: échantillonnage de trace
const TRACK_SAMPLE_SIM_MS = 10_000; // un point tous les 10 s simulés

/* =========================================================
   DONNÉES VOSTOK 1 (paramètres orbitaux publiés — approximation)
========================================================= */
const VOSTOK_START_UTC = new Date(Date.UTC(1961, 3, 12, 6, 7, 0));
const VOSTOK_END_UTC   = new Date(Date.UTC(1961, 3, 12, 7, 55, 0));
const RETRO_UTC        = new Date(Date.UTC(1961, 3, 12, 7, 25, 0)); // approx

const BAIKONUR = { lat: 45.964, lon: 63.305 }; // Kazakhstan
const LANDING  = { lat: 51.27,  lon: 45.99  }; // près de Saratov (Smelovka)

const PERIGEE_KM = 169;
const APOGEE_KM  = 315;
const INCL_DEG   = 64.95;
const PERIOD_S   = 89.1 * 60;

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
  backdrop-filter:blur(8px);user-select:none;min-width:380px;">
  <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
    <b>GNU Orbital Simulator</b>
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

  <div style="margin-top:10px;display:flex;gap:8px;align-items:center;">
    <input id="toggleLabels" type="checkbox" checked>
    <label for="toggleLabels" style="opacity:.9;">Afficher les numéros (méridiens/parallèles)</label>
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
const toggleLabels = document.getElementById("toggleLabels");

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
  const {
    fontSize = 46,
    color = "#ffffff",
    background = "rgba(0,0,0,0.45)",
    padding = 10,
    scale = LABEL_SCALE,
  } = opts;

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
    for (let lon = -180; lon <= 180; lon += GRID_DRAW_STEP_DEG) {
      pts.push(latLonToVector3(lat, lon, EARTH_RADIUS * 1.002));
    }
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // Méridiens
  for (let lon = -180; lon < 180; lon += stepDeg) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += GRID_DRAW_STEP_DEG) {
      pts.push(latLonToVector3(lat, lon, EARTH_RADIUS * 1.002));
    }
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
}
buildLatLonGrid(GRID_STEP_DEG);

const labelGroup = new THREE.Group();
earth.add(labelGroup);

function rebuildLabels() {
  labelGroup.clear();

  // Latitudes
  for (let lat = -60; lat <= 60; lat += LABEL_STEP_DEG) {
    const sp = createTextSprite(`${lat > 0 ? "+" : ""}${lat}°`, { fontSize: LABEL_FONT_SIZE });
    sp.position.copy(latLonToVector3(lat, 0, EARTH_RADIUS * 1.06));
    labelGroup.add(sp);
  }

  // Longitudes
  for (let lon = -180; lon <= 180; lon += LABEL_STEP_DEG) {
    if (lon === -180) continue;
    const hemi = lon >= 0 ? "E" : "W";
    const sp = createTextSprite(`${Math.abs(lon)}°${hemi}`, { fontSize: LABEL_FONT_SIZE });
    sp.position.copy(latLonToVector3(0, lon, EARTH_RADIUS * 1.06));
    labelGroup.add(sp);
  }
}
rebuildLabels();

// Toggle labels via checkbox
toggleLabels.addEventListener("change", () => {
  labelGroup.visible = toggleLabels.checked;
});
labelGroup.visible = toggleLabels.checked;

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

// Convertit sous-satellite lat/lon -> ECEF (unité sphère)
function ecefUnitFromLatLon(latDeg, lonDeg) {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  const x = Math.cos(lat) * Math.cos(lon);
  const y = Math.cos(lat) * Math.sin(lon);
  const z = Math.sin(lat);
  return new THREE.Vector3(x, y, z);
}

// Rotation ECEF -> ECI via GMST (convention satellite.js)
function ecefToEci(vEcef, gmst) {
  const c = Math.cos(gmst), s = Math.sin(gmst);
  return new THREE.Vector3(
    c * vEcef.x - s * vEcef.y,
    s * vEcef.x + c * vEcef.y,
    vEcef.z
  );
}

// Paramètres ellipse
const rp = EARTH_RADIUS_KM + PERIGEE_KM;
const ra = EARTH_RADIUS_KM + APOGEE_KM;
const a = (rp + ra) / 2;
const e = (ra - rp) / (ra + rp);
const n = 2 * Math.PI / PERIOD_S; // rad/s approx

const incl = THREE.MathUtils.degToRad(INCL_DEG);
let orbitBasis = null; // {p,q,w}

function buildOrbitBasisAtT0() {
  const gmst0 = satellite.gstime(VOSTOK_START_UTC);

  // Sous-satellite Baïkonour en ECEF puis ECI
  const rSubEcef = ecefUnitFromLatLon(BAIKONUR.lat, BAIKONUR.lon);
  const rSubEci = ecefToEci(rSubEcef, gmst0).normalize();

  // Trouver RAAN Ω tel que w·r=0 avec inclinaison i
  const x = rSubEci.x, y = rSubEci.y, z = rSubEci.z;
  const rhs = -(Math.cos(incl) / Math.sin(incl)) * z;

  const A = Math.hypot(x, y);
  const phi = Math.atan2(y, x);

  const u = THREE.MathUtils.clamp(rhs / (A || 1e-9), -1, 1);
  const delta = Math.acos(u);

  const Omega = phi + delta; // choix prograde (heuristique)

  const w = new THREE.Vector3(
    Math.sin(incl) * Math.cos(Omega),
    Math.sin(incl) * Math.sin(Omega),
    Math.cos(incl)
  ).normalize();

  const p = rSubEci.clone().normalize();
  const q = new THREE.Vector3().crossVectors(w, p).normalize();

  orbitBasis = { p, q, w, Omega };
}
buildOrbitBasisAtT0();

function subpointLatLonFromOrbit(date) {
  const t = (date.getTime() - VOSTOK_START_UTC.getTime()) / 1000; // s
  if (t < 0) return null;

  // Modèle simple de réentrée: interpolation vers LANDING après rétro
  if (date.getTime() >= RETRO_UTC.getTime()) {
    const u = (date.getTime() - RETRO_UTC.getTime()) / (VOSTOK_END_UTC.getTime() - RETRO_UTC.getTime());
    const uu = THREE.MathUtils.clamp(u, 0, 1);

    const llRetro = subpointLatLonFromOrbit(new Date(RETRO_UTC.getTime() - 1000));
    if (!llRetro) return { lat: LANDING.lat, lon: LANDING.lon };

    const aVec = ecefUnitFromLatLon(llRetro.lat, llRetro.lon).normalize();
    const bVec = ecefUnitFromLatLon(LANDING.lat, LANDING.lon).normalize();

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

  // Orbit propagation (ellipse dans le plan)
  const nu = (n * t) % (2 * Math.PI);
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

  // Position ECI (km)
  const rEci = orbitBasis.p.clone().multiplyScalar(r * Math.cos(nu))
    .add(orbitBasis.q.clone().multiplyScalar(r * Math.sin(nu)));

  // ECI -> ECEF (rotation -GMST)
  const gmst = satellite.gstime(date);
  const c = Math.cos(-gmst), s = Math.sin(-gmst);
  const rEcef = new THREE.Vector3(
    c * rEci.x - s * rEci.y,
    s * rEci.x + c * rEci.y,
    rEci.z
  );

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
  { key: "orbitin", label: "Mise en orbite",t: new Date(Date.UTC(1961, 3, 12, 6, 17, 0)), subtitle: "Mise en orbite (≈06:17 UTC)" },
  { key: "orbit",   label: "En orbite",     t: new Date(Date.UTC(1961, 3, 12, 6, 45, 0)), subtitle: "Phase orbitale" },
  { key: "retro",   label: "Rétrofusée",    t: new Date(RETRO_UTC), subtitle: "Rétrofusée (≈07:25 UTC)" },
  { key: "reentry", label: "Réentrée",      t: new Date(Date.UTC(1961, 3, 12, 7, 35, 0)), subtitle: "Réentrée (≈07:35 UTC)" },
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
  playbackRate = 60;
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

  simTime = new Date(VOSTOK_START_UTC.getTime());
  dtInput.value = toLocalDatetimeValue(simTime);

  clearVostokGraphics();
  updateVostokAt(simTime, true);
  rebuildTrackUpTo(simTime);
  setSubtitleFromTime(simTime);

  lineInfo.textContent =
    `Labels: ${toggleLabels.checked ? "ON" : "OFF"} • Vostok calibré: Baïkonour (${BAIKONUR.lat.toFixed(3)}N, ${BAIKONUR.lon.toFixed(3)}E)`;
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