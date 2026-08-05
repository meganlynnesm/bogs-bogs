// ---------------------------------------------------------------------------
// Research Foundation map. Layers, mapped to the project palette:
//   Data centres (OSM) ....... focal pink     — the research subject
//   Submarine cables (TeleG) . mid-tone blue  — undersea infrastructure
//   Peatlands (GFW raster) ... yellow-green   — the land
// Built on MapLibre GL, following the mapping-systems MapLibre tutorial.
// ---------------------------------------------------------------------------

const PINK = "#c22e69"; // focal — data centres (magma magenta)
const CABLE = "#cb5600"; // Tibetan Tiger (burnt orange) — cables
const YGREEN = "#828211"; // yellow-green dark — peatlands (legend/reference)

// GFW Global Peatlands is published as raster XYZ tiles (zoom 0-12).
const PEAT_TILES =
  "https://tiles.globalforestwatch.org/gfw_peatlands/v20230315/default/{z}/{x}/{y}.png";

// ESA WorldCover 2021 (10 m global land cover), served by Terrascope as WMS.
// Using the WMS GetMap endpoint with MapLibre's {bbox-epsg-3857} token avoids
// tile-matrix guesswork — MapLibre requests one 256px GetMap per tile.
const WORLDCOVER_WMS =
  "https://services.terrascope.be/wms/v2?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap" +
  "&LAYERS=WORLDCOVER_2021_MAP&STYLES=&FORMAT=image/png&TRANSPARENT=true" +
  "&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}";

// Digital-divide choropleth ramp (shared with the Data & the Divide map):
// low speed = dark maroon → high speed = pale pink; missing → white.
const speedColor = [
  "interpolate", ["linear"], ["coalesce", ["get", "speed_mbps"], -1],
  -1, "#ffffff",
  0, "#ffffff",
  1, "#2a0f1c",
  25, "#6e1a3e",
  60, "#a5285f",
  120, "#c22e69",
  250, "#e06a97",
  400, "#f6cddd",
];

// Token-free dark basemap (CARTO "dark_all") — no API key required.
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
  container: "map",
  style: basemapStyle,
  center: [-30, 30], // Atlantic-centred; shows global spread + Europe/US
  zoom: 1.6,
  maxZoom: 16,
  attributionControl: { compact: true },
});

map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
map.addControl(new maplibregl.FullscreenControl());
map.addControl(new maplibregl.ScaleControl(), "top-left");

map.on("load", () => {
  // ---- ESA WorldCover land cover (raster, bottom; off by default) ---------
  map.addSource("worldcover", {
    type: "raster",
    tiles: [WORLDCOVER_WMS],
    tileSize: 256,
    attribution:
      '<a href="https://esa-worldcover.org" target="_blank" rel="noopener">ESA WorldCover</a> 2021 — ESA/Terrascope (CC-BY-4.0)',
  });
  map.addLayer({
    id: "worldcover-raster",
    type: "raster",
    source: "worldcover",
    layout: { visibility: "none" },
    paint: { "raster-opacity": 0.9 },
  });

  // ---- Digital divide: internet-speed country choropleth (off by default) -
  map.addSource("speed", { type: "geojson", data: "internet_speed.geojson" });
  map.addLayer({
    id: "divide-landbase",
    type: "fill",
    source: "speed",
    layout: { visibility: "none" },
    paint: { "fill-color": "#ffffff" },
  });
  map.addLayer({
    id: "divide-fill",
    type: "fill",
    source: "speed",
    layout: { visibility: "none" },
    paint: { "fill-color": speedColor, "fill-opacity": 0.82 },
  });
  map.addLayer({
    id: "divide-outline",
    type: "line",
    source: "speed",
    layout: { visibility: "none" },
    paint: { "line-color": "#c9c4bb", "line-width": 0.4 },
  });

  // ---- Peatlands (global raster, hue-rotated toward yellow-green) ---------
  // Hue-rotation shifts GFW's native periwinkle to a yellow-green while leaving
  // the transparency mask intact, so it only colours actual peat pixels.
  map.addSource("peatlands", {
    type: "raster",
    tiles: [PEAT_TILES],
    tileSize: 256,
    maxzoom: 12,
    attribution:
      '<a href="https://data.globalforestwatch.org/datasets/gfw::global-peatlands/about" target="_blank" rel="noopener">Global Peatlands</a> — GFW/WRI (CC-BY-4.0)',
  });
  map.addLayer({
    id: "peatlands-raster",
    type: "raster",
    source: "peatlands",
    paint: {
      "raster-hue-rotate": -172, // periwinkle (~232°) → olive yellow-green (~60°)
      "raster-saturation": 0.3,
      "raster-opacity": 0.85,
    },
  });

  // ---- Submarine cables: TeleGeography global routes (mid-tone blue) ------
  map.addSource("cables", {
    type: "geojson",
    data: "cables_global.geojson",
    attribution:
      '<a href="https://www.submarinecablemap.com" target="_blank" rel="noopener">TeleGeography Submarine Cable Map</a>',
  });
  map.addLayer({
    id: "cables-glow",
    type: "line",
    source: "cables",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": CABLE,
      "line-opacity": 0.3,
      "line-width": ["interpolate", ["linear"], ["zoom"], 1, 2.5, 6, 6, 12, 12],
    },
  });
  map.addLayer({
    id: "cables-line",
    type: "line",
    source: "cables",
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": CABLE,
      "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.8, 6, 1.8, 12, 3.5],
    },
  });

  // ---- Data centres: OpenStreetMap (focal pink) --------------------------
  map.addSource("datacentres", {
    type: "geojson",
    data: "datacentres.geojson",
    attribution:
      '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">Data centres © OpenStreetMap</a>',
  });
  map.addLayer({
    id: "datacentres-circle",
    type: "circle",
    source: "datacentres",
    paint: {
      "circle-color": PINK,
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2, 6, 3.5, 12, 7],
      "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 1, 0.4, 6, 1],
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.9,
    },
  });

  wirePopups();
  wireToggles();
});

// ---------------------------------------------------------------------------
// Popups (vector layers only — raster peatlands has no clickable features)
// ---------------------------------------------------------------------------
function wirePopups() {
  map.on("click", "divide-fill", (e) => {
    const p = e.features[0].properties || {};
    const s = p.speed_mbps;
    const val = (s === null || s === undefined || s === "")
      ? "no data" : `${Number(s).toFixed(1)} Mbps`;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${p.name || p.ADMIN || "Country"}</strong><br>Median fixed download: ${val}`)
      .addTo(map);
  });

  map.on("click", "cables-line", (e) => {
    const p = e.features[0].properties || {};
    const link = p.id
      ? `<br><a href="https://www.submarinecablemap.com/submarine-cable/${p.id}" target="_blank" rel="noopener">View cable →</a>`
      : "";
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${p.name || "Submarine cable"}</strong>${link}`)
      .addTo(map);
  });

  map.on("click", "datacentres-circle", (e) => {
    const p = e.features[0].properties || {};
    const op = p.operator ? `<br>${p.operator}` : "";
    new maplibregl.Popup()
      .setLngLat(e.features[0].geometry.coordinates.slice())
      .setHTML(`<strong>${p.name || "Data centre"}</strong>${op}`)
      .addTo(map);
  });

  ["divide-fill", "cables-line", "datacentres-circle"].forEach((id) => {
    map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
  });
}

// ---------------------------------------------------------------------------
// Layer toggles
// ---------------------------------------------------------------------------
function wireToggles() {
  const bind = (checkboxId, layerIds) => {
    const box = document.getElementById(checkboxId);
    if (!box) return;
    box.addEventListener("change", () => {
      const vis = box.checked ? "visible" : "none";
      layerIds.forEach((id) => map.setLayoutProperty(id, "visibility", vis));
    });
  };
  bind("toggle-worldcover", ["worldcover-raster"]);
  bind("toggle-divide", ["divide-landbase", "divide-fill", "divide-outline"]);
  bind("toggle-peatlands", ["peatlands-raster"]);
  bind("toggle-cables", ["cables-line", "cables-glow"]);
  bind("toggle-datacentres", ["datacentres-circle"]);
}
