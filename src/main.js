import { createAppUI } from "./ui/ui.js";
import { createScene } from "./core/scene.js";
import { createTimeController } from "./core/time.js";

import { createEarthSystem } from "./earth/earth.js";
import { createMoonSystem } from "./moon/moon.js";

import { VOSTOK1 } from "./missions/vostok1.js";
import { createVostokRuntime } from "./missions/vostokRuntime.js";

function main() {
  const ui = createAppUI();
  const core = createScene();
  const { scene, camera, renderer, controls } = core;

  let simTime = new Date();

  const time = createTimeController({
    dtInput: ui.dtInput,
    btnNow: ui.btnNow,
    onTimeChange: (d) => (simTime = d),
    initial: simTime,
  });

  const earthSys = createEarthSystem({
    renderer,
    scene,
    toggleLabels: ui.toggleLabels,
  });

  const moonSys = createMoonSystem({ scene });

  const vostok = createVostokRuntime({
    earthSpin: earthSys.earthSpin,
    constants: earthSys.constants,
    ui,
    mission: VOSTOK1,
  });

  ui.btnClear.addEventListener("click", () => {
    vostok.clear();
    ui.hidePlayer();
    ui.lineInfo.textContent = "";
  });

  ui.btnVostok.addEventListener("click", () => {
    vostok.activate(time);
  });

  let lastFrameMs = null;

  function animate(nowMs) {
    requestAnimationFrame(animate);

    // Playback mission peut avancer le temps
    simTime = vostok.updatePlayback(nowMs, simTime, time, lastFrameMs);
    lastFrameMs = nowMs;

    earthSys.update(simTime);
    moonSys.update(simTime);
    vostok.update(simTime);

    ui.updateUtcLine(simTime);

    controls.update();
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}

main();