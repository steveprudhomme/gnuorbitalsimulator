import * as THREE from "three";

/**
 * FR: Convertit lat/lon -> position 3D sur une sphère (Terre-fixe).
 * EN: Converts lat/lon -> 3D position on a sphere (Earth-fixed).
 */
export function latLonToVector3(latDeg, lonDeg, radius, lonOffsetRad) {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg) + lonOffsetRad;

  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon)
  );
}

/**
 * FR: Sprite texte (canvas → texture).
 * EN: Text sprite (canvas → texture).
 */
export function createTextSprite(text, opts = {}) {
  const {
    fontSize = 46,
    color = "#ffffff",
    background = "rgba(0,0,0,0.45)",
    padding = 10,
    scale = 0.22,
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

  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: true,
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(w * scale, h * scale, 1);
  return sp;
}

/**
 * FR: Construit la grille de méridiens/parallèles.
 * EN: Builds latitude/longitude grid.
 */
export function buildLatLonGrid({ gridGroup, constants }) {
  gridGroup.clear();
  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.38,
  });

  const {
    EARTH_RADIUS,
    EARTH_TEXTURE_LON_OFFSET,
    GRID_STEP_DEG,
    GRID_DRAW_STEP_DEG,
  } = constants;

  // Parallels
  for (let lat = -90 + GRID_STEP_DEG; lat <= 90 - GRID_STEP_DEG; lat += GRID_STEP_DEG) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += GRID_DRAW_STEP_DEG) {
      pts.push(
        latLonToVector3(lat, lon, EARTH_RADIUS * 1.002, EARTH_TEXTURE_LON_OFFSET)
      );
    }
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // Meridians
  for (let lon = -180; lon < 180; lon += GRID_STEP_DEG) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += GRID_DRAW_STEP_DEG) {
      pts.push(
        latLonToVector3(lat, lon, EARTH_RADIUS * 1.002, EARTH_TEXTURE_LON_OFFSET)
      );
    }
    gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
}

/**
 * FR: Reconstruit les labels de latitudes/longitudes.
 * EN: Rebuilds latitude/longitude labels.
 */
export function rebuildLabels({ labelGroup, constants }) {
  labelGroup.clear();

  const {
    EARTH_RADIUS,
    EARTH_TEXTURE_LON_OFFSET,
    LABEL_STEP_DEG,
    LABEL_FONT_SIZE,
    LABEL_SCALE,
  } = constants;

  // Latitudes
  for (let lat = -60; lat <= 60; lat += LABEL_STEP_DEG) {
    const sp = createTextSprite(`${lat > 0 ? "+" : ""}${lat}°`, {
      fontSize: LABEL_FONT_SIZE,
      scale: LABEL_SCALE,
    });
    sp.position.copy(
      latLonToVector3(lat, 0, EARTH_RADIUS * 1.06, EARTH_TEXTURE_LON_OFFSET)
    );
    labelGroup.add(sp);
  }

  // Longitudes
  for (let lon = -180; lon <= 180; lon += LABEL_STEP_DEG) {
    if (lon === -180) continue;
    const hemi = lon >= 0 ? "E" : "W";
    const sp = createTextSprite(`${Math.abs(lon)}°${hemi}`, {
      fontSize: LABEL_FONT_SIZE,
      scale: LABEL_SCALE,
    });
    sp.position.copy(
      latLonToVector3(0, lon, EARTH_RADIUS * 1.06, EARTH_TEXTURE_LON_OFFSET)
    );
    labelGroup.add(sp);
  }
}
