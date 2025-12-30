import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * FR: Crée la scène Three.js (renderer, camera, controls) et gère le resize.
 * EN: Creates the Three.js scene (renderer, camera, controls) and handles resize.
 */
export function createScene() {
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.style.background = "#05060a";

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 220, 460);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = true;

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.22));
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
  sunLight.position.set(800, 220, 600);
  scene.add(sunLight);

  // Stars background
  addStars(scene);

  // Resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}

function addStars(scene) {
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
  const stars = new THREE.Points(
    starsGeo,
    new THREE.PointsMaterial({ size: 1.2, sizeAttenuation: true })
  );
  scene.add(stars);
}
