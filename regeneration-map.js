// ---------------------------------------------------------------------------
// Regeneration — global land-cover map (MapLibre + CARTO dark base).
//   Land cover (dominant type, country choropleth) + GFW peatlands raster.
// ---------------------------------------------------------------------------

const PEAT_TILES =
  "https://tiles.globalforestwatch.org/gfw_peatlands/v20230315/default/{z}/{x}/{y}.png";

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
  container: "rmap",
  style: basemapStyle,
  center: [15, 25],
  zoom: 1.3,
  maxZoom: 16,
  attributionControl: { compact: true },
});

map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
map.addControl(new maplibregl.ScaleControl(), "top-left");

const landColor = [
  "match", ["get", "land_type"],
  "Forest", "#5e7d2f",
  "Cropland", "#e4c259",
  "Open land", "#ac6f20",
  /* no data */ "#2b2b2b",
];

map.on("load", () => {
  map.addSource("land", { type: "geojson", data: "land_cover.geojson" });
  map.addLayer({
    id: "land-fill",
    type: "fill",
    source: "land",
    paint: { "fill-color": landColor, "fill-opacity": 0.75 },
  });
  map.addLayer({
    id: "land-outline",
    type: "line",
    source: "land",
    paint: { "line-color": "#0c0c0c", "line-width": 0.4 },
  });

  map.addSource("peatlands", {
    type: "raster",
    tiles: [PEAT_TILES],
    tileSize: 256,
    maxzoom: 12,
    attribution:
      '<a href="https://data.globalforestwatch.org/datasets/gfw::global-peatlands/about" target="_blank" rel="noopener">Global Peatlands</a> — GFW/WRI',
  });
  map.addLayer({
    id: "peatlands-raster",
    type: "raster",
    source: "peatlands",
    paint: { "raster-opacity": 0.7 },
  });

  map.on("click", "land-fill", (e) => {
    const p = e.features[0].properties || {};
    const lt = p.land_type || "no data";
    const f = p.forest_pct, a = p.agri_pct;
    const detail = (f != null && a != null)
      ? `<br>Forest ${Number(f).toFixed(0)}% · Cropland+pasture ${Number(a).toFixed(0)}%`
      : "";
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${p.ADMIN || "Country"}</strong>Dominant land type: ${lt}${detail}`)
      .addTo(map);
  });
  map.on("mouseenter", "land-fill", () => (map.getCanvas().style.cursor = "pointer"));
  map.on("mouseleave", "land-fill", () => (map.getCanvas().style.cursor = ""));

  const bind = (id, layers) => {
    const box = document.getElementById(id);
    if (!box) return;
    box.addEventListener("change", () => {
      const v = box.checked ? "visible" : "none";
      layers.forEach((l) => map.setLayoutProperty(l, "visibility", v));
    });
  };
  bind("t-land", ["land-fill", "land-outline"]);
  bind("t-peat", ["peatlands-raster"]);

  // ensure correct sizing now that it sits inside the content column
  setTimeout(() => map.resize(), 200);
});
