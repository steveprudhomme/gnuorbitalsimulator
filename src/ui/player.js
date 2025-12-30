import { toLocalDatetimeValue } from "../core/time.js";

/**
 * FR: Gère l'état du player (lecture/pause/stop/fast) et l'UI chapitres.
 * EN: Manages player state (play/pause/stop/fast) and chapter UI.
 */
export function createMissionPlayer({ ui, chapters, onChapterJump }) {
  let isPlaying = false;
  let playbackRate = 60; // ms simulés / ms réels
  let lastFrameMs = null;

  function setSubtitleFromTime(date) {
    let current = chapters[0];
    for (const c of chapters) if (date.getTime() >= c.t.getTime()) current = c;
    ui.subtitleEl.textContent = current.subtitle;
  }

  function stop() {
    isPlaying = false;
    lastFrameMs = null;
    ui.pPlay.textContent = "Play";
    ui.speedLabel.textContent = "—";
  }

  function startNormal() {
    isPlaying = true;
    ui.pPlay.textContent = "Pause";
    playbackRate = 60;
    lastFrameMs = null;
    ui.speedLabel.textContent = "x60";
  }

  function startFast10s(missionStart, missionEnd) {
    isPlaying = true;
    ui.pPlay.textContent = "Pause";
    const missionMs = missionEnd.getTime() - missionStart.getTime();
    playbackRate = missionMs / 10_000;
    lastFrameMs = null;
    ui.speedLabel.textContent = "FAST";
  }

  function buildChaptersUI(timeController) {
    ui.chaptersEl.innerHTML = "";
    for (const c of chapters) {
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
        stop();
        onChapterJump(c);
        timeController.set(new Date(c.t.getTime()));
        ui.dtInput.value = toLocalDatetimeValue(timeController.get());
        setSubtitleFromTime(timeController.get());
      });

      ui.chaptersEl.appendChild(b);
    }
  }

  function attachHandlers({ missionStart, missionEnd, timeController }) {
    ui.pPlay.addEventListener("click", () => {
      if (!isPlaying) startNormal();
      else stop();
    });

    ui.pStop.addEventListener("click", () => stop());

    ui.pRestart.addEventListener("click", () => {
      stop();
      timeController.set(new Date(missionStart.getTime()));
      ui.dtInput.value = toLocalDatetimeValue(timeController.get());
      onChapterJump(chapters[0]);
      setSubtitleFromTime(timeController.get());
    });

    ui.pFast.addEventListener("click", () => {
      startFast10s(missionStart, missionEnd);
    });

    buildChaptersUI(timeController);
  }

  function updatePlayback(nowMs, simTime, missionStart, missionEnd, timeController) {
    if (!isPlaying) {
      lastFrameMs = null;
      return simTime;
    }

    if (lastFrameMs === null) lastFrameMs = nowMs;
    const dtRealMs = nowMs - lastFrameMs;
    lastFrameMs = nowMs;

    const next = new Date(simTime.getTime() + dtRealMs * playbackRate);

    if (next.getTime() >= missionEnd.getTime()) {
      timeController.set(new Date(missionEnd.getTime()));
      stop();
      return timeController.get();
    }

    timeController.set(next);
    ui.dtInput.value = toLocalDatetimeValue(timeController.get());
    return timeController.get();
  }

  return {
    attachHandlers,
    stop,
    setSubtitleFromTime,
    updatePlayback,
  };
}
