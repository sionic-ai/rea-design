// First page: load order (scenes shown at 0, 1.5, 1.9, 2.6s), area-map SVG (redrawn from scratch, following only the position and feel of the original map drawing),
// Link row hover swaps the side photo (1→1.1x over 1s ease-out, opacity .4→1 over .5s), a photo 80% visible goes 1.1x (.7s), film card swiper.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  // The original runs at 0·1.5·1.9·2.6s after all photos load — the copy has no photos to load, so it shifts by the time the original takes to load them (measured about .45s)
  const steps = [[1, 450], [2, 1950], [3, 2350], [4, 3050]];
  const start = () => steps.forEach(([n, t]) => (reduce ? body.classList.add(`anime-${n}`) : setTimeout(() => body.classList.add(`anime-${n}`), t)));
  if (document.readyState === "complete") start(); else addEventListener("load", start);

  window.TF?.fill();

  // District map — the whole region on the left (dotted outside, gray city districts, light-blue highways) and a large zoom circle on the right (district borders · names), with a tangent line joining the two circles
  const map = document.querySelector(".tf-map");
  if (map) {
    const NS = "http://www.w3.org/2000/svg";
    const put = (tag, a, p = map) => { const n = document.createElementNS(NS, tag); for (const k in a) n.setAttribute(k, a[k]); p.append(n); return n; };
    const defs = put("defs", {});
    const dots = put("pattern", { id: "tf-dots", width: 7, height: 7, patternUnits: "userSpaceOnUse" }, defs);
    put("circle", { cx: 2, cy: 2, r: 1, class: "m-dot" }, dots);
    const clip = put("clipPath", { id: "tf-zoom" }, defs);
    put("circle", { cx: 920, cy: 330, r: 300 }, clip);
    const pref = "M60 140 L170 80 300 110 360 60 470 120 560 170 610 260 560 330 600 420 520 470 470 560 380 600 300 570 210 620 120 560 70 470 110 400 40 330 70 250Z";
    put("path", { class: "m-dots", d: pref });
    put("path", { class: "m-zone", d: pref });
    const city = "M300 210 L380 180 470 220 520 280 480 340 420 360 360 330 320 300Z";
    put("path", { class: "m-city", d: city });
    put("path", { class: "m-zone", d: "M60 330 L200 320 300 360 380 420 470 400 M200 320 L240 220 300 210 M380 420 L360 540" });
    [["M60 210 L130 190 200 220 260 200 300 230", 140, 205, "Highway 1"], ["M40 370 L120 330 220 330 300 300", 70, 352, "Highway 2"], ["M300 460 L380 470 430 520 470 540", 300, 470, "Highway 3"]].forEach(([d, x, y, t]) => {
      put("path", { class: "m-river", d });
      const w = t.length * 12 + 12;
      put("rect", { class: "m-tag", x, y: y - 11, width: w, height: 20 });
      put("text", { class: "m-tag-c", x: x + w / 2, y: y + 4, "text-anchor": "middle" }).textContent = t;
    });
    put("circle", { class: "m-ring", cx: 400, cy: 280, r: 80 });
    put("line", { class: "m-ring", x1: 420, y1: 202, x2: 800, y2: 54 });
    put("line", { class: "m-ring", x1: 440, y1: 350, x2: 830, y2: 618 });
    const zoom = put("g", { "clip-path": "url(#tf-zoom)" });
    put("rect", { class: "m-dots", x: 600, y: 20, width: 640, height: 620 }, zoom);
    put("path", { class: "m-city", d: "M650 260 L760 200 900 230 1030 180 1150 250 1180 360 1100 460 960 500 820 470 700 420 640 340Z" }, zoom);
    put("path", { class: "m-white", d: "M760 200 L800 330 700 420 M800 330 L940 300 1030 180 M940 300 L960 500 M940 300 L1100 340 1150 250 M800 330 L860 470" }, zoom);
    put("path", { class: "m-zone", d: "M610 120 L700 160 760 120 860 150 M1220 160 L1150 250 M610 560 L700 420 M1100 460 L1200 560" }, zoom);
    put("circle", { class: "m-ring", cx: 920, cy: 330, r: 300 });
    const tag = (x, y, t) => {
      const w = t.length * 13 + 12;
      put("rect", { class: "m-tag", x: x - w / 2, y: y - 11, width: w, height: 22 });
      put("text", { class: "m-tag-t", x, y: y + 5, "text-anchor": "middle" }).textContent = t;
    };
    tag(850, 280, "Zone 1"); tag(960, 280, "Zone 2"); tag(1080, 280, "Zone 3"); tag(780, 360, "Zone 4"); tag(900, 360, "Zone 5"); tag(760, 450, "Zone 6"); tag(930, 450, "Zone 7");
    tag(420, 300, "Station"); tag(230, 470, "Airport"); tag(470, 560, "Station 2");
    [[850, 280, 860, 170], [960, 280, 1010, 170], [1080, 280, 1110, 170], [780, 360, 700, 310], [930, 450, 940, 560], [900, 360, 1100, 410]].forEach(([x1, y1, x2, y2]) => put("line", { class: "m-lead", x1, y1, x2, y2 }));
  }

  // Hovering a link row switches the side photo to that link’s photo — as in the original, from .4 opacity to 1, scale from 1 to 1.1
  const swap = document.getElementById("tf-swap");
  if (swap) {
    swap.style.transform = "scale(1)";
    swap.style.transition = "transform 1s ease-out";
    document.querySelectorAll(".tf-link").forEach((a) => a.addEventListener("mouseenter", () => {
      if (reduce) { swap.dataset.label = a.dataset.label; return; }
      swap.style.transition = "none";
      swap.style.transform = "scale(1)";
      swap.style.opacity = "0.4";
      swap.dataset.label = a.dataset.label;
      setTimeout(() => { swap.style.transition = "transform 1s ease-out, opacity 0.5s"; swap.style.transform = "scale(1.1)"; swap.style.opacity = "1"; }, 20);
    }));
  }
  const mv = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("is-move")), { threshold: 0.8 });
  document.querySelectorAll(".js-move").forEach((n) => mv.observe(n));
  const up = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.setAttribute("data-scroll", "in")), { rootMargin: "0px 0px -15%" });
  document.querySelectorAll(".js-fade-up").forEach((n) => (reduce ? n.setAttribute("data-scroll", "in") : up.observe(n)));

  const films = document.querySelector(".tf-films .swiper");
  if (films && window.Swiper) new Swiper(films, {
    slidesPerView: "auto",
    spaceBetween: 15,
    grabCursor: true,
    speed: reduce ? 0 : 300,
    scrollbar: { el: ".tf-films .swiper-scrollbar", draggable: true },
    navigation: { nextEl: ".tf-films__next", prevEl: ".tf-films__prev" },
    breakpoints: { 768: { spaceBetween: 30 } },
  });
})();
