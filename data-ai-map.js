// ---------------------------------------------------------------------------
// Data, AI & the Divide — digital-divide map (MapLibre + CARTO dark base).
//   Internet speed (country choropleth) ... the divide
//   Data centres (OSM points) ............. focal pink
//   Submarine cables (TeleGeography) ...... tiger orange
// ---------------------------------------------------------------------------

const PINK = "#c22e69";
const CABLE = "#cb5600";

// token-free dark basemap (CARTO "dark_all")
const basemapStyle = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#0c0c0c" } },
    { id: "carto", type: "raster", source: "carto" },
  ],
};

const map = new maplibregl.Map({
  container: "dmap",
  style: basemapStyle,
  center: [10, 25],
  zoom: 1.3,
  maxZoom: 16,
  attributionControl: { compact: true },
});

map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
map.addControl(new maplibregl.ScaleControl(), "top-left");

// low speed = dark purple, high speed = pale blue (cool "connectivity" ramp).
// coalesce missing values to -1 so "no data" countries read grey.
const speedColor = [
  "interpolate", ["linear"], ["coalesce", ["get", "speed_mbps"], -1],
  -1, "#2b2b2b",
  0, "#2b2b2b",
  1, "#2a1a40",
  25, "#4b3670",
  60, "#6a5a9c",
  120, "#98a8d9",
  250, "#cdd9f2",
  400, "#eef2fb",
];

map.on("load", () => {
  // ---- internet speed choropleth (bottom) --------------------------------
  map.addSource("speed", { type: "geojson", data: "internet_speed.geojson" });
  map.addLayer({
    id: "speed-fill",
    type: "fill",
    source: "speed",
    paint: { "fill-color": speedColor, "fill-opacity": 0.72 },
  });
  map.addLayer({
    id: "speed-outline",
    type: "line",
    source: "speed",
    paint: { "line-color": "#0c0c0c", "line-width": 0.4 },
  });

  // ---- submarine cables --------------------------------------------------
  map.addSource("cables", {
    type: "geojson",
    data: "cables_global.geojson",
    attribution:
      '<a href="https://www.submarinecablemap.com" target="_blank" rel="noopener">TeleGeography</a>',
  });
  map.addLayer({
    id: "cables-line",
    type: "line",
    source: "cables",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": CABLE,
      "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.7, 6, 1.6, 12, 3],
      "line-opacity": 0.9,
    },
  });

  // ---- data centres (top) ------------------------------------------------
  map.addSource("datacentres", {
    type: "geojson",
    data: "datacentres.geojson",
    attribution:
      '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">Data centres © OpenStreetMap</a>',
  });
  map.addLayer({
    id: "dc-circle",
    type: "circle",
    source: "datacentres",
    paint: {
      "circle-color": PINK,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 1.6, 6, 3, 12, 6],
      "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 1, 0.3, 6, 0.9],
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.9,
    },
  });

  wirePopups();
  wireToggles();
});

function wirePopups() {
  map.on("click", "speed-fill", (e) => {
    const p = e.features[0].properties || {};
    const s = p.speed_mbps;
    const val = (s === null || s === undefined || s === "") ? "no data"
      : `${Number(s).toFixed(1)} Mbps`;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${p.ADMIN || "Country"}</strong>Median fixed download: ${val}`)
      .addTo(map);
  });

  map.on("click", "cables-line", (e) => {
    const p = e.features[0].properties || {};
    const link = p.id
      ? `<br><a href="https://www.submarinecablemap.com/submarine-cable/${p.id}" target="_blank" rel="noopener">View cable →</a>`
      : "";
    new maplibregl.Popup().setLngLat(e.lngLat)
      .setHTML(`<strong>${p.name || "Submarine cable"}</strong>${link}`).addTo(map);
  });

  map.on("click", "dc-circle", (e) => {
    const p = e.features[0].properties || {};
    const op = p.operator ? `<br>${p.operator}` : "";
    new maplibregl.Popup().setLngLat(e.features[0].geometry.coordinates.slice())
      .setHTML(`<strong>${p.name || "Data centre"}</strong>${op}`).addTo(map);
  });

  ["speed-fill", "cables-line", "dc-circle"].forEach((id) => {
    map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
  });
}

function wireToggles() {
  const bind = (id, layers) => {
    const box = document.getElementById(id);
    if (!box) return;
    box.addEventListener("change", () => {
      const v = box.checked ? "visible" : "none";
      layers.forEach((l) => map.setLayoutProperty(l, "visibility", v));
    });
  };
  bind("t-speed", ["speed-fill", "speed-outline"]);
  bind("t-cables", ["cables-line"]);
  bind("t-dc", ["dc-circle"]);
}
