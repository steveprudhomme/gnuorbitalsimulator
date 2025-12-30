import * as THREE from "three";
import * as satellite from "satellite.js";
import { createMissionPlayer } from "../ui/player.js";
import { latLonToVector3 } from "../earth/gridLabels.js";

/**
 * FR: Runtime de mission Vostok (marker + trace + player + modèle orbital calibré).
 * EN: Vostok mission runtime (marker + track + player + calibrated orbital model).
 */
export function createVostokRuntime({ earthSpin, constants, ui, mission }) {
  const group = new THREE.Group();
  earthSpin.add(group);

  let active = false;
  let marker = null;

  let trackLine = null;
  let trackPositions = [];
  let lastSampleSimMs = null;

  // Orbit basis cached for mission
  const orbitModel = buildOrbitModel(mission);

  // Player
  const player = createMissionPlayer({
    ui,
    chapters: mission.chapters,
    onChapterJump: (chapter) => {
      rebuildTrackUpTo(chapter.t);
      updateAt(chapter.t, true);
    },
  });

  function ensureMarker() {
    if (marker) return;
    marker = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    group.add(marker);
  }

  function clearGraphics() {
    if (marker) {
      group.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
      marker = null;
    }
    if (trackLine) {
      group.remove(trackLine);
      trackLine.geometry.dispose();
      trackLine.material.dispose();
      trackLine = null;
    }
    trackPositions = [];
    lastSampleSimMs = null;
  }

  function clear() {
    active = false;
    player.stop();
    clearGraphics();
  }

  function activate(timeController) {
    active = true;
    ui.showPlayer();

    // attach handlers once per activation? safe to attach only first time
    // We attach only once using a guard.
    attachPlayerOnce(timeController);

    player.stop();
    clearGraphics();

    // Jump to mission start
    timeController.set(new Date(mission.startUTC.getTime()));
    ui.lineInfo.textContent =
      `Labels: ${ui.toggleLabels.checked ? "ON" : "OFF"} • Vostok calibré: Baïkonour (${mission.baikonur.lat.toFixed(
        3
      )}N, ${mission.baikonur.lon.toFixed(3)}E)`;

    updateAt(timeController.get(), true);
    rebuildTrackUpTo(timeController.get());
    player.setSubtitleFromTime(timeController.get());
  }

  let playerAttached = false;
  function attachPlayerOnce(timeController) {
    if (playerAttached) return;
    playerAttached = true;
    player.attachHandlers({
      missionStart: mission.startUTC,
      missionEnd: mission.endUTC,
      timeController,
    });
  }

  function updatePlayback(nowMs, simTime, timeController, lastFrameMs) {
    if (!active) return simTime;
    // Player handles its own frame deltas; we pass nowMs and bounds.
    const next = player.updatePlayback(
      nowMs,
      simTime,
      mission.startUTC,
      mission.endUTC,
      timeController
    );
    return next;
  }

  function update(simTime) {
    if (!active) return;
    updateAt(simTime, false);
    player.setSubtitleFromTime(simTime);
  }

  function rebuildTrackUpTo(targetTime) {
    clearGraphics();
    if (!active) return;

    const end = Math.min(targetTime.getTime(), mission.endUTC.getTime());
    for (let t = mission.startUTC.getTime(); t <= end; t += mission.track.sampleSimMs) {
      updateAt(new Date(t), true);
    }
  }

  function updateAt(date, forceSample) {
    if (!active) return;

    const ms = date.getTime();
    if (ms < mission.startUTC.getTime() || ms > mission.endUTC.getTime()) return;

    const ll = orbitModel.subpointLatLon(date);
    if (!ll) return;

    const p = latLonToVector3(
      ll.lat,
      ll.lon,
      constants.EARTH_RADIUS * 1.012,
      constants.EARTH_TEXTURE_LON_OFFSET
    );

    ensureMarker();
    marker.position.copy(p);

    if (!forceSample) {
      if (lastSampleSimMs !== null && ms - lastSampleSimMs < mission.track.sampleSimMs) return;
    }
    lastSampleSimMs = ms;

    trackPositions.push(p.x, p.y, p.z);

    // Rebuild line (simple & identical behavior)
    if (trackLine) {
      group.remove(trackLine);
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
    group.add(trackLine);
  }

  return { activate, clear, update, updatePlayback };
}

/* =========================================================
   ORBIT MODEL (same as v0.0.2 logic, moved here)
========================================================= */

function buildOrbitModel(mission) {
  const EARTH_RADIUS_KM = mission.orbit.earthRadiusKm;

  const PERIGEE_KM = mission.orbit.perigeeKm;
  const APOGEE_KM = mission.orbit.apogeeKm;
  const INCL_DEG = mission.orbit.inclDeg;
  const PERIOD_S = mission.orbit.periodS;

  const VOSTOK_START_UTC = mission.startUTC;
  const RETRO_UTC = mission.retroUTC;
  const VOSTOK_END_UTC = mission.endUTC;

  const BAIKONUR = mission.baikonur;
  const LANDING = mission.landing;

  const rp = EARTH_RADIUS_KM + PERIGEE_KM;
  const ra = EARTH_RADIUS_KM + APOGEE_KM;
  const a = (rp + ra) / 2;
  const e = (ra - rp) / (ra + rp);
  const n = (2 * Math.PI) / PERIOD_S;

  const incl = THREE.MathUtils.degToRad(INCL_DEG);

  const orbitBasis = buildOrbitBasisAtT0({
    t0: VOSTOK_START_UTC,
    incl,
    baikonur: BAIKONUR,
  });

  function subpointLatLon(date) {
    const t = (date.getTime() - VOSTOK_START_UTC.getTime()) / 1000;
    if (t < 0) return null;

    // Re-entry interpolation after retro (same behavior)
    if (date.getTime() >= RETRO_UTC.getTime()) {
      const u = (date.getTime() - RETRO_UTC.getTime()) / (VOSTOK_END_UTC.getTime() - RETRO_UTC.getTime());
      const uu = THREE.MathUtils.clamp(u, 0, 1);

      const llRetro = subpointLatLon(new Date(RETRO_UTC.getTime() - 1000));
      if (!llRetro) return { lat: LANDING.lat, lon: LANDING.lon };

      const aVec = ecefUnitFromLatLon(llRetro.lat, llRetro.lon);
      const bVec = ecefUnitFromLatLon(LANDING.lat, LANDING.lon);

      const dot = THREE.MathUtils.clamp(aVec.dot(bVec), -1, 1);
      const ang = Math.acos(dot);

      let v;
      if (ang < 1e-6) {
        v = aVec.clone();
      } else {
        const s1 = Math.sin((1 - uu) * ang);
        const s2 = Math.sin(uu * ang);
        v = aVec
          .clone()
          .multiplyScalar(s1)
          .add(bVec.clone().multiplyScalar(s2))
          .multiplyScalar(1 / Math.sin(ang));
      }

      const lat = THREE.MathUtils.radToDeg(Math.asin(v.z));
      const lon = THREE.MathUtils.radToDeg(Math.atan2(v.y, v.x));
      return { lat, lon };
    }

    // Orbit propagation
    const nu = (n * t) % (2 * Math.PI);
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));

    // ECI position km
    const rEci = orbitBasis.p
      .clone()
      .multiplyScalar(r * Math.cos(nu))
      .add(orbitBasis.q.clone().multiplyScalar(r * Math.sin(nu)));

    // ECI -> ECEF using -GMST
    const gmst = satellite.gstime(date);
    const c = Math.cos(-gmst),
      s = Math.sin(-gmst);
    const rEcef = new THREE.Vector3(c * rEci.x - s * rEci.y, s * rEci.x + c * rEci.y, rEci.z);

    const rr = rEcef.length();
    const lat = THREE.MathUtils.radToDeg(Math.asin(rEcef.z / rr));
    const lon = THREE.MathUtils.radToDeg(Math.atan2(rEcef.y, rEcef.x));
    return { lat, lon };
  }

  return { subpointLatLon };
}

// ECEF unit from lat/lon
function ecefUnitFromLatLon(latDeg, lonDeg) {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  const x = Math.cos(lat) * Math.cos(lon);
  const y = Math.cos(lat) * Math.sin(lon);
  const z = Math.sin(lat);
  return new THREE.Vector3(x, y, z).normalize();
}

// ECEF -> ECI via GMST (same convention)
function ecefToEci(vEcef, gmst) {
  const c = Math.cos(gmst),
    s = Math.sin(gmst);
  return new THREE.Vector3(c * vEcef.x - s * vEcef.y, s * vEcef.x + c * vEcef.y, vEcef.z);
}

function buildOrbitBasisAtT0({ t0, incl, baikonur }) {
  const gmst0 = satellite.gstime(t0);

  const rSubEcef = ecefUnitFromLatLon(baikonur.lat, baikonur.lon);
  const rSubEci = ecefToEci(rSubEcef, gmst0).normalize();

  const x = rSubEci.x,
    y = rSubEci.y,
    z = rSubEci.z;

  const rhs = -(Math.cos(incl) / Math.sin(incl)) * z;

  const A = Math.hypot(x, y);
  const phi = Math.atan2(y, x);

  const u = THREE.MathUtils.clamp(rhs / (A || 1e-9), -1, 1);
  const delta = Math.acos(u);

  const Omega = phi + delta; // heuristic choice

  const w = new THREE.Vector3(
    Math.sin(incl) * Math.cos(Omega),
    Math.sin(incl) * Math.sin(Omega),
    Math.cos(incl)
  ).normalize();

  const p = rSubEci.clone().normalize();
  const q = new THREE.Vector3().crossVectors(w, p).normalize();

  return { p, q, w, Omega };
}
