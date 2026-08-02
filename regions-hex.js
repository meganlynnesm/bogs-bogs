// ---------------------------------------------------------------------------
// Regeneration case studies — hex-reveal maps (Ireland, Virginia, Ohio).
// Detailed land cover (CORINE / NLCD image) sits beneath an H3 hex layer
// coloured by dominant land type; click a hex to peel it back and reveal the
// detailed map underneath. IIFE-scoped to avoid clashing with the global map.
// ---------------------------------------------------------------------------
(function () {
  const CARTO = {
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

  const REGIONS = [
    { id: "map-ireland",  bbox: [-10.7, 51.3, -5.3, 55.5], img: "corine_ireland.png", hex: "ireland_hex.geojson" },
    { id: "map-virginia", bbox: [-83.7, 36.5, -75.2, 39.5], img: "nlcd_virginia.png", hex: "virginia_hex.geojson" },
    { id: "map-ohio",     bbox: [-85.0, 38.3, -80.5, 42.0], img: "nlcd_ohio.png",     hex: "ohio_hex.geojson" },
  ];

  const revealed = ["case", ["boolean", ["feature-state", "revealed"], false], 0, 1];

  REGIONS.forEach(function (r) {
    if (!document.getElementById(r.id)) return;
    const w = r.bbox[0], s = r.bbox[1], e = r.bbox[2], n = r.bbox[3];
    const map = new maplibregl.Map({
      container: r.id,
      style: CARTO,
      bounds: [[w, s], [e, n]],
      fitBoundsOptions: { padding: 12 },
      maxZoom: 13,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");

    map.on("load", function () {
      // detailed land cover (revealed beneath the hexes)
      map.addSource("lc", { type: "image", url: r.img, coordinates: [[w, n], [e, n], [e, s], [w, s]] });
      map.addLayer({ id: "lc", type: "raster", source: "lc", paint: { "raster-opacity": 1 } });

      // hex overlay coloured by dominant land type
      map.addSource("hex", { type: "geojson", data: r.hex, generateId: true });
      map.addLayer({
        id: "hex-fill",
        type: "fill",
        source: "hex",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["*", 0.95, revealed],
        },
      });
      map.addLayer({
        id: "hex-line",
        type: "line",
        source: "hex",
        paint: {
          "line-color": "#0c0c0c",
          "line-width": 0.4,
          "line-opacity": ["case", ["boolean", ["feature-state", "revealed"], false], 0.15, 0.45],
        },
      });

      map.on("click", "hex-fill", function (ev) {
        const f = ev.features[0];
        const cur = map.getFeatureState({ source: "hex", id: f.id }).revealed;
        map.setFeatureState({ source: "hex", id: f.id }, { revealed: !cur });
      });
      map.on("mouseenter", "hex-fill", function () { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "hex-fill", function () { map.getCanvas().style.cursor = ""; });

      setTimeout(function () { map.resize(); }, 200);
    });
  });
})();
