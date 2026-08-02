// ---------------------------------------------------------------------------
// Regeneration case studies — hex maps (Ireland, Virginia, Ohio).
// Detailed land cover (CORINE / NLCD image) sits beneath an H3 hex layer
// coloured by dominant land type. One toggle button hides/shows the whole
// hex layer at once, revealing the detailed map beneath.
// IIFE-scoped to avoid clashing with the global map.
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
      map.addSource("hex", { type: "geojson", data: r.hex });
      map.addLayer({
        id: "hex-fill",
        type: "fill",
        source: "hex",
        paint: { "fill-color": ["get", "color"], "fill-opacity": 0.92 },
      });
      map.addLayer({
        id: "hex-line",
        type: "line",
        source: "hex",
        paint: { "line-color": "#0c0c0c", "line-width": 0.4, "line-opacity": 0.4 },
      });

      // single toggle: hide/show the whole hex layer at once
      const shell = document.getElementById(r.id).parentElement;
      const btn = document.createElement("button");
      btn.className = "hex-toggle";
      btn.type = "button";
      btn.textContent = "Reveal detailed map";
      shell.appendChild(btn);
      let shown = true;
      btn.addEventListener("click", function () {
        shown = !shown;
        const v = shown ? "visible" : "none";
        map.setLayoutProperty("hex-fill", "visibility", v);
        map.setLayoutProperty("hex-line", "visibility", v);
        btn.textContent = shown ? "Reveal detailed map" : "Show land-type hexes";
        btn.classList.toggle("active", !shown);
      });

      setTimeout(function () { map.resize(); }, 200);
    });
  });
})();
