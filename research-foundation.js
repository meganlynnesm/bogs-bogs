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

// Global land cover — NASA GIBS "MODIS IGBP Land Cover Type" (annual, ~500 m),
// pre-coloured PNG tiles, no API key. Native max zoom 8; MapLibre overzooms
// beyond that. (ESA WorldCover's Terrascope host is currently unreachable, and
// Dynamic World is only served through Google Earth Engine — neither drops into
// a static page, so GIBS is the reliable key-free source.)
const LANDCOVER_TILES =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/" +
  "MODIS_Combined_L3_IGBP_Land_Cover_Type_Annual/default/2024-01-01/" +
  "GoogleMapsCompatible_Level8/{z}/{y}/{x}.png";

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
    tiles: [LANDCOVER_TILES],
    tileSize: 256,
    maxzoom: 8,
    attribution:
      '<a href="https://www.earthdata.nasa.gov/gibs" target="_blank" rel="noopener">NASA GIBS</a> — MODIS IGBP Land Cover Type (annual)',
  });
  map.addLayer({
    id: "worldcover-raster",
    type: "raster",
    source: "worldcover",
    layout: { visibility: "none" },
    paint: { "raster-opacity": 0.9 },
  });

  // Dark ocean mask painted over the land-cover raster, so its baked-in blue
  // "water" class reads as sea. Shown/hidden together with the land cover.
  map.addSource("ocean", { type: "geojson", data: "ocean_ne110.geojson" });
  map.addLayer({
    id: "ocean-mask",
    type: "fill",
    source: "ocean",
    layout: { visibility: "none" },
    paint: { "fill-color": "#0c0c0c" },
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
  bind("toggle-worldcover", ["worldcover-raster", "ocean-mask"]);
  bind("toggle-divide", ["divide-landbase", "divide-fill", "divide-outline"]);
  bind("toggle-cables", ["cables-line", "cables-glow"]);
  bind("toggle-datacentres", ["datacentres-circle"]);
}
