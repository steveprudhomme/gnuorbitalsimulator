/**
 * FR: Utilitaires de gestion du temps + datetime-local.
 * EN: Time utilities + datetime-local handling.
 */

const pad = (n) => String(n).padStart(2, "0");

export function toLocalDatetimeValue(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * @param {Object} params
 * @param {HTMLInputElement} params.dtInput
 * @param {HTMLButtonElement} params.btnNow
 * @param {(d: Date) => void} params.onTimeChange
 * @param {Date} params.initial
 */
export function createTimeController({ dtInput, btnNow, onTimeChange, initial }) {
  let current = new Date(initial.getTime());

  dtInput.value = toLocalDatetimeValue(current);

  btnNow.addEventListener("click", () => {
    current = new Date();
    dtInput.value = toLocalDatetimeValue(current);
    onTimeChange(current);
  });

  dtInput.addEventListener("change", () => {
    const d = new Date(dtInput.value);
    if (!Number.isNaN(d.getTime())) {
      current = d;
      onTimeChange(current);
    }
  });

  return {
    get: () => current,
    set: (d) => {
      current = new Date(d.getTime());
      dtInput.value = toLocalDatetimeValue(current);
      onTimeChange(current);
    },
  };
}
