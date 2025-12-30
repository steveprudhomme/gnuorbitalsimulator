import * as THREE from "three";
import * as satellite from "satellite.js";
import { buildLatLonGrid, rebuildLabels } from "./gridLabels.js";

/**
 * FR: Système Terre : globe, rotation GMST, grille, labels (toggle).
 * EN: Earth system: globe, GMST rotation, grid, labels (toggle).
 */
export function createEarthSystem({ renderer, scene, toggleLabels }) {
  const constants = {
    EARTH_RADIUS: 64,
    EARTH_TEXTURE_LON_OFFSET: Math.PI / 2,
    GRID_STEP_DEG: 15,
    GRID_DRAW_STEP_DEG: 2,
    LABEL_STEP_DEG: 30,
    LABEL_FONT_SIZE: 28,
    LABEL_SCALE: 0.22,
  };

  const earthSpin = new THREE.Group();
  scene.add(earthSpin);

  const textureLoader = new THREE.TextureLoader();
  const earthMap = textureLoader.load("/textures/earth_daymap.jpg");
  earthMap.colorSpace = THREE.SRGBColorSpace;
  earthMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(constants.EARTH_RADIUS, 96, 96),
    new THREE.MeshStandardMaterial({
      map: earthMap,
      roughness: 1.0,
      metalness: 0.0,
    })
  );
  earthSpin.add(earth);

  const gridGroup = new THREE.Group();
  earth.add(gridGroup);

  const labelGroup = new THREE.Group();
  earth.add(labelGroup);

  buildLatLonGrid({
    gridGroup,
    constants,
  });

  rebuildLabels({
    labelGroup,
    constants,
  });

  // UI toggle
  labelGroup.visible = !!toggleLabels?.checked;
  if (toggleLabels) {
    toggleLabels.addEventListener("change", () => {
      labelGroup.visible = toggleLabels.checked;
    });
  }

  function update(date) {
    const gmst = satellite.gstime(date);
    earthSpin.rotation.y = -gmst;
  }

  return { earthSpin, earth, gridGroup, labelGroup, constants, update };
}
