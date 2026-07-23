// ---------------------------------------------------------------------------
// Research Foundation map. Layers, mapped to the project palette:
//   Data centres (OSM) ....... focal pink     — the research subject
//   Submarine cables (TeleG) . mid-tone blue  — undersea infrastructure
//   Peatlands (GFW raster) ... yellow-green   — the land
// Built on MapLibre GL, following the mapping-systems MapLibre tutorial.
// ---------------------------------------------------------------------------

const PINK = "#d2437a"; // focal — data centres
const CABLE = "#cb5600"; // Tibetan Tiger (burnt orange) — cables
const YGREEN = "#828211"; // yellow-green dark — peatlands (legend/reference)

// GFW Global Peatlands is published as raster XYZ tiles (zoom 0-12).
const PEAT_TILES =
  "https://tiles.globalforestwatch.org/gfw_peatlands/v20230315/default/{z}/{x}/{y}.png";

// A no-key dark basemap (CARTO "dark_all") that mirrors the Dark Matter look.
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

map.on("load", () => {
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

  ["cables-line", "datacentres-circle"].forEach((id) => {
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
  bind("toggle-peatlands", ["peatlands-raster"]);
  bind("toggle-cables", ["cables-line", "cables-glow"]);
  bind("toggle-datacentres", ["datacentres-circle"]);
}
