// About scene: pinned photo header (next section pinches in → opens out), MapLibre globe
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original pin-reveal — progress goes 0 → 1 while the next section’s top edge rises from 90% → 35% of the window, and once fully open, the pinned photo is cut at the next section’s top edge
  document.querySelectorAll("[data-pin-reveal]").forEach((hero) => {
    const next = hero.nextElementSibling;
    const media = hero.querySelector("[data-pin-reveal-media]");
    if (!next) return;
    if (media) new IntersectionObserver(([e]) => media.classList.toggle("is-off", !e.isIntersecting), { threshold: 0 }).observe(hero);
    if (reduce) return;
    next.style.setProperty("--pin-reveal-progress", "0");
    ScrollTrigger.create({
      trigger: next, start: "top bottom", end: "bottom top", scrub: true,
      onUpdate: () => {
        const h = innerHeight, top = next.getBoundingClientRect().top, lead = 0.9 * h;
        const p = Math.min(1, Math.max(0, (lead - top) / (lead - 0.35 * h)));
        next.style.setProperty("--pin-reveal-progress", `${p}`);
        if (!media) return;
        media.style.setProperty("--pin-reveal-sibling-top", `${top}px`);
        if (p >= 1) media.setAttribute("data-pin-reveal-clipped", ""); else media.removeAttribute("data-pin-reveal-clipped");
      },
    });
  });

  // Original MapVisual — maplibre globe projection, first point centered, zoom 1.4 (phone .5), only drag turned on and other hand controls off, dotted line between points
  document.querySelectorAll("[data-globe]").forEach((box) => {
    if (!window.maplibregl) return;
    const probe = document.body.appendChild(document.createElement("i"));
    // The computed color comes out as oklab text that maplibre can’t read — paint it on a canvas and read it back as sRGB
    const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const color = (expr) => {
      probe.style.color = expr;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = getComputedStyle(probe).color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    };
    const land = color("var(--kf-bg)");
    const water = color("var(--site-mono-20)");
    const border = color("color-mix(in oklab, var(--kf-accent) 30%, var(--kf-bg))");
    const ink = color("var(--kf-ink)");
    probe.remove();
    const pts = box.dataset.points.split(";").map((s) => { const [lng, lat, name] = s.split(","); return { lng: +lng, lat: +lat, name }; });
    const mobile = matchMedia("(max-width: 767px)").matches;
    const map = new maplibregl.Map({
      container: box,
      style: {
        version: 8,
        projection: { type: "globe" },
        sources: { carto: { type: "vector", url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json" } },
        layers: [
          { id: "background", type: "background", paint: { "background-color": land } },
          { id: "water", type: "fill", source: "carto", "source-layer": "water", filter: ["all", ["==", "$type", "Polygon"]], paint: { "fill-color": water } },
          { id: "country-borders", type: "line", source: "carto", "source-layer": "boundary", filter: ["all", ["==", "admin_level", 2], ["==", "maritime", 0]], paint: { "line-color": border, "line-width": 0.8, "line-opacity": 0.9 } },
        ],
      },
      center: [pts[0].lng, pts[0].lat],
      zoom: mobile ? 0.5 : 1.4,
      attributionControl: false,
      dragRotate: false, scrollZoom: false, doubleClickZoom: false, touchZoomRotate: false, touchPitch: false, boxZoom: false, keyboard: false,
    });
    map.getCanvas().setAttribute("tabindex", "-1");
    box.setAttribute("aria-hidden", "true");
    map.on("load", () => {
      const lines = [];
      pts.forEach((a, i) => pts.slice(i + 1).forEach((b) => lines.push({ type: "Feature", geometry: { type: "LineString", coordinates: [[a.lng, a.lat], [b.lng, b.lat]] }, properties: {} })));
      map.addSource("links", { type: "geojson", data: { type: "FeatureCollection", features: lines } });
      map.addLayer({ id: "links", type: "line", source: "links", paint: { "line-color": ink, "line-dasharray": [2, 2], "line-width": 1.2, "line-opacity": 0.9 } });
    });
    pts.forEach((p) => {
      const el = document.createElement("div");
      el.className = "ab-pin";
      el.innerHTML = `<span>${p.name}</span>`;
      new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
    });
  });
})();
