/**
 * FR: Données structurées de la mission Vostok 1.
 * EN: Structured data for Vostok 1 mission.
 */
export const VOSTOK1 = {
  id: "vostok1",
  name: "Vostok 1",
  startUTC: new Date(Date.UTC(1961, 3, 12, 6, 7, 0)),
  endUTC: new Date(Date.UTC(1961, 3, 12, 7, 55, 0)),
  retroUTC: new Date(Date.UTC(1961, 3, 12, 7, 25, 0)), // approx

  baikonur: { lat: 45.964, lon: 63.305 }, // Kazakhstan
  landing: { lat: 51.27, lon: 45.99 },    // near Saratov

  orbit: {
    perigeeKm: 169,
    apogeeKm: 315,
    inclDeg: 64.95,
    periodS: 89.1 * 60,
    earthRadiusKm: 6378.137,
  },

  track: {
    sampleSimMs: 10_000,
  },

  chapters: [
    {
      key: "launch",
      label: "Décollage",
      t: new Date(Date.UTC(1961, 3, 12, 6, 7, 0)),
      subtitle: "Décollage (06:07 UTC) — Baïkonour",
    },
    {
      key: "orbitin",
      label: "Mise en orbite",
      t: new Date(Date.UTC(1961, 3, 12, 6, 17, 0)),
      subtitle: "Mise en orbite (≈06:17 UTC)",
    },
    {
      key: "orbit",
      label: "En orbite",
      t: new Date(Date.UTC(1961, 3, 12, 6, 45, 0)),
      subtitle: "Phase orbitale",
    },
    {
      key: "retro",
      label: "Rétrofusée",
      t: new Date(Date.UTC(1961, 3, 12, 7, 25, 0)),
      subtitle: "Rétrofusée (≈07:25 UTC)",
    },
    {
      key: "reentry",
      label: "Réentrée",
      t: new Date(Date.UTC(1961, 3, 12, 7, 35, 0)),
      subtitle: "Réentrée (≈07:35 UTC)",
    },
    {
      key: "land",
      label: "Atterrissage",
      t: new Date(Date.UTC(1961, 3, 12, 7, 55, 0)),
      subtitle: "Atterrissage (≈07:55 UTC) — près de Saratov",
    },
  ],
};
