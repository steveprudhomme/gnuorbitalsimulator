import * as THREE from "three";

/**
 * FR: Lune (modèle simple / illustratif) synchronisée au temps.
 * EN: Moon (simple / illustrative model) synced with time.
 */
export function createMoonSystem({ scene }) {
  const MOON_RADIUS = 17.5;
  const MOON_DIST = 380;

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(MOON_RADIUS, 48, 48),
    new THREE.MeshStandardMaterial({
      color: 0xbfc3c9,
      roughness: 1.0,
      metalness: 0.0,
    })
  );
  scene.add(moon);

  function update(date) {
    // Simple synodic-ish motion (same as v0.0.2)
    const days = date.getTime() / 86400000;
    const ang = (days * (2 * Math.PI / 27.321661)) % (Math.PI * 2);
    moon.position.set(Math.cos(ang) * MOON_DIST, 0, Math.sin(ang) * MOON_DIST);
  }

  return { moon, update };
}
