import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Astronomy from "astronomy-engine";

const ui = document.getElementById("app");
ui.innerHTML = `
  <div id="ui" style="
    position:fixed;left:12px;top:12px;z-index:10;
    font:14px/1.2 system-ui;color:#e9eefc;
    background:rgba(10,12,20,.65);border:1px solid rgba(255,255,255,.12);
    border-radius:12px;padding:10px 12px;backdrop-filter:blur(8px);">
    <div><b>Terre–Lune</b></div>
    <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
      <label for="dt">Temps :</label>
      <input id="dt" type="datetime-local" step="1"
        style="color:inherit;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);
        border-radius:10px;padding:6px 8px;"/>
      <button id="now" type="button"
        style="cursor:pointer;color:inherit;background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:6px 10px;">Now</button>
    </div>
  </div>
`;

document.body.style.margin = "0";
document.body.style.background = "#05060a";
document.body.style.overflow = "hidden";

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene/camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 180, 420);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
sunLight.position.set(800, 200, 600);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.12));

// Bodies
const EARTH_RADIUS = 64;
const MOON_RADIUS = 17.5;
const MOON_DIST = 380;

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(EARTH_RADIUS, 64, 64),
  new THREE.MeshStandardMaterial({ color: 0x2b67ff, roughness: 0.95 })
);
scene.add(earth);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(MOON_RADIUS, 48, 48),
  new THREE.MeshStandardMaterial({ color: 0xbfc3c9, roughness: 1.0 })
);
scene.add(moon);

// UI time
const dtInput = document.getElementById("dt");
const nowBtn = document.getElementById("now");

const pad = (n) => String(n).padStart(2, "0");
function toLocalDatetimeValue(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

let simTime = new Date();
dtInput.value = toLocalDatetimeValue(simTime);

nowBtn.addEventListener("click", () => {
  simTime = new Date();
  dtInput.value = toLocalDatetimeValue(simTime);
  updateBodies(simTime);
});

dtInput.addEventListener("change", () => {
  simTime = new Date(dtInput.value);
  updateBodies(simTime);
});

// Astronomy
function updateBodies(date) {
  // simple rotation: 360°/jour
  const dayFrac = (date.getUTCHours()*3600 + date.getUTCMinutes()*60 + date.getUTCSeconds()) / 86400;
  earth.rotation.y = dayFrac * Math.PI * 2;

  const time = Astronomy.MakeTime(date);
  const vec = Astronomy.GeoVector(Astronomy.Body.Moon, time, false);

  const v = new THREE.Vector3(vec.x, vec.z, -vec.y);
  if (v.length() > 0) {
    v.normalize().multiplyScalar(MOON_DIST);
    moon.position.copy(v);
  }
  moon.lookAt(earth.position);
}

updateBodies(simTime);

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
