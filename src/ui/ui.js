/**
 * FR: Construit l'interface principale + expose les éléments utiles.
 * EN: Builds main UI and exposes useful elements.
 */
export function createAppUI() {
  const app = document.getElementById("app");
  if (!app) throw new Error("index.html doit contenir <div id='app'></div>.");

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
  const toggleLabels = document.getElementById("toggleLabels");

  const lineUtc = document.getElementById("lineUtc");
  const lineInfo = document.getElementById("lineInfo");

  // Player elements
  const playerEl = document.getElementById("player");
  const pPlay = document.getElementById("pPlay");
  const pStop = document.getElementById("pStop");
  const pRestart = document.getElementById("pRestart");
  const pFast = document.getElementById("pFast");
  const chaptersEl = document.getElementById("chapters");
  const subtitleEl = document.getElementById("subtitle");
  const speedLabel = document.getElementById("speedLabel");

  function showPlayer() {
    playerEl.style.display = "block";
  }
  function hidePlayer() {
    playerEl.style.display = "none";
  }
  function updateUtcLine(date) {
    lineUtc.textContent = `${date.toLocaleString()} | UTC: ${date.toUTCString()}`;
  }

  return {
    dtInput,
    btnNow,
    btnClear,
    btnVostok,
    toggleLabels,
    lineUtc,
    lineInfo,

    playerEl,
    pPlay,
    pStop,
    pRestart,
    pFast,
    chaptersEl,
    subtitleEl,
    speedLabel,

    showPlayer,
    hidePlayer,
    updateUtcLine,
  };
}
