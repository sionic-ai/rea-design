// All pages: builds decorative pieces and the mosaic logo in SVG, header hide (up when scrolled down past 150px), phone menu, floor guide popup, anchor move (smooth-scroll 500ms),
// Sets up decoration parallax (5vw upward, tied to scroll), About pieces popping out (back.out 1.7), and lower-page text blocks entering from the side and below (1s power3.out, every time they come and go).
// Card rise is card-rise-toggle, the button arrow is the lottie-hover-play part.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rng = (seed) => { let s = (seed * 2654435761) >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent?.append(n); return n; };
  const COLORS = ["f-orange", "f-green", "f-yellow", "f-rose", "f-olive", "f-teal", "f-deep"];

  // Decorative pieces — redraws the original’s pixel steps, circle chains and mixed pieces in the same size and grain
  const DECO = {
    pixel(svg, r) {
      let x = 8, y = 80;
      for (let i = 0; i < 9; i++) {
        el("rect", { class: i % 3 === 2 ? "f-green" : i % 3 ? "f-deep" : "f-teal", x, y, width: 12, height: 12 }, svg);
        if (r() < 0.55) x += 12; else y -= 12;
      }
      el("rect", { class: "f-orange", x: x + 12, y: y - 12, width: 12, height: 12 }, svg);
    },
    worm(svg, r) {
      const cls = [COLORS[Math.floor(r() * 3)], COLORS[3 + Math.floor(r() * 3)]];
      for (let i = 0; i < 6; i++) {
        const a = i * 0.55 + r() * 0.2;
        el("circle", { class: cls[i % 2], cx: 50 + Math.cos(a) * (14 + i * 5), cy: 50 + Math.sin(a) * (14 + i * 5), r: 9 - i * 0.6 }, svg);
      }
    },
    mix(svg, r) {
      el("path", { class: COLORS[Math.floor(r() * 5)], d: `M20 ${50 + r() * 10}c4-22 30-30 46-18s14 34-6 42-44 0-40-24z` }, svg);
      el("path", { class: COLORS[Math.floor(r() * 5)], d: `M58 18q22 4 24 26-10-14-24-12z` }, svg);
      for (let i = 0; i < 4; i++) el("rect", { class: i % 2 ? "f-teal" : "f-yellow", x: 60 + i * 9, y: 70 + (i % 2) * 9, width: 9, height: 9 }, svg);
    },
    mosaic(svg, r) {
      for (let i = 0; i < 150; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 44, cx = 50 + Math.cos(a) * d, cy = 50 + Math.sin(a) * d, s = 5 + r() * 6;
        const cls = COLORS[Math.floor(r() * COLORS.length)], k = r();
        if (k < 0.4) el("rect", { class: cls, x: cx - s / 2, y: cy - s / 2, width: s, height: s, transform: `rotate(${Math.round(r() * 90)} ${cx} ${cy})` }, svg);
        else if (k < 0.75) el("circle", { class: cls, cx, cy, r: s / 2 }, svg);
        else el("path", { class: cls, d: `M${cx} ${cy - s / 2}l${s / 2} ${s}h${-s}z` }, svg);
      }
    },
  };
  document.querySelectorAll("[data-deco]").forEach((host, i) => {
    const [kind, seed] = host.dataset.deco.split(":");
    if (!DECO[kind] || host.querySelector("svg")) return;
    const svg = el("svg", { viewBox: "0 0 100 100", "aria-hidden": "true" }, host);
    DECO[kind](svg, rng(+seed || i + 1));
  });

  // People illustrations — replace the original illustrations (rainbow, blocks, blackboard, exhibit, people in a circle, sprout) with simple people shapes of the same size and texture
  const person = (svg, x, y, s, body, head = "f-paper") => {
    el("path", { class: body, d: `M${x - 9 * s} ${y}q0-${22 * s} ${9 * s}-${22 * s}t${9 * s} ${22 * s}z` }, svg);
    el("circle", { class: body, cx: x, cy: y - 28 * s, r: 7 * s }, svg);
    el("circle", { class: head, cx: x, cy: y - 28 * s, r: 4.2 * s }, svg);
  };
  const ART = {
    rainbow(svg) {
      ["f-rose", "f-orange", "f-yellow", "f-green"].forEach((c, i) => el("path", { class: c, d: `M${18 + i * 5} 52a${32 - i * 5} ${32 - i * 5} 0 0 1 ${64 - i * 10} 0h-5a${27 - i * 5} ${27 - i * 5} 0 0 0 ${-(54 - i * 10)} 0z` }, svg));
      person(svg, 40, 78, 0.9, "f-rose"); person(svg, 60, 78, 0.9, "f-orange");
    },
    blocks(svg) {
      [[30, 58, "f-yellow"], [46, 58, "f-green"], [38, 44, "f-orange"], [54, 44, "f-teal"], [46, 30, "f-rose"]].forEach(([x, y, c]) => el("rect", { class: c, x, y, width: 15, height: 14, rx: 2 }, svg));
      person(svg, 20, 78, 0.9, "f-olive"); person(svg, 80, 78, 0.9, "f-teal");
    },
    board(svg) {
      el("rect", { class: "f-green", x: 44, y: 14, width: 44, height: 32, rx: 3 }, svg);
      el("path", { class: "f-paper", d: "M50 24h28v3H50zM50 32h20v3H50z" }, svg);
      person(svg, 30, 78, 1, "f-orange"); person(svg, 66, 80, 0.8, "f-rose");
    },
    museum(svg) {
      el("path", { class: "f-olive", d: "M14 34l36-18 36 18z" }, svg);
      [22, 40, 58, 76].forEach((x) => el("rect", { class: "f-yellow", x, y: 36, width: 6, height: 22 }, svg));
      person(svg, 36, 82, 0.8, "f-teal"); person(svg, 64, 82, 0.8, "f-rose");
    },
    circle(svg) {
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; person(svg, 50 + Math.cos(a) * 26, 58 + Math.sin(a) * 14, 0.7, COLORS[i % 5]); }
    },
    plant(svg) {
      el("path", { class: "f-green", d: "M50 60c0-18-6-28-20-30 2 14 8 22 20 24M50 60c0-22 8-34 24-36-2 16-10 26-24 28" }, svg);
      el("rect", { class: "f-olive", x: 49, y: 52, width: 3, height: 18 }, svg);
      el("path", { class: "f-orange", d: "M38 68h26l-4 14H42z" }, svg);
      person(svg, 22, 82, 0.8, "f-teal");
    },
  };
  document.querySelectorAll("[data-art]").forEach((host) => {
    if (!ART[host.dataset.art] || host.querySelector("svg")) return;
    ART[host.dataset.art](el("svg", { viewBox: "0 0 100 90", "aria-hidden": "true" }, host));
  });

  // Header row — comes down within the top 150px or when scrolling up, and slides up when scrolling down outside that range
  const head = document.querySelector(".cn-header");
  let before = -1;
  const onScroll = () => {
    const y = scrollY;
    if (!head || y === before) return;
    const show = 150 > y || y - before < 0;
    head.classList.toggle("is-down", show);
    head.classList.toggle("is-up", !show);
    before = y;
  };
  addEventListener("scroll", onScroll, { passive: true });

  // Phone menu — turns on the three-line button, white panel and blurred overlay together
  const hbg = document.querySelector(".cn-hbg");
  hbg?.addEventListener("click", (e) => {
    e.preventDefault();
    const on = hbg.classList.toggle("js__active");
    hbg.setAttribute("aria-expanded", String(on));
    document.body.classList.toggle("js__active", on);
    document.querySelector(".cn-menubox")?.classList.toggle("js__active", on);
    document.querySelector(".cn-mask")?.classList.toggle("js__active", on);
  });

  // Floor guide — like the original, a hidden checkbox is toggled by a label (header button, Tap, cover, close are all labels). When the checkbox is checked the popup opens
  const sync = (box) => {
    const p = box.closest(".cn-popup");
    p.classList.toggle("is-open", box.checked);
    p.setAttribute("aria-hidden", String(!box.checked));
  };
  document.querySelectorAll(".cn-popup__check").forEach((box) => box.addEventListener("change", () => sync(box)));
  document.querySelectorAll('label[role="button"]').forEach((l) => l.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    l.click();
  }));
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".cn-popup__check:checked").forEach((box) => { box.checked = false; sync(box); });
  });
  document.querySelectorAll("[data-floor]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll("[data-floor]").forEach((x) => x.classList.toggle("js__active", x === b));
    document.querySelectorAll(".cn-floor").forEach((f) => f.classList.toggle("js__active", f.dataset.floorMap === b.dataset.floor));
  }));

  if (window.SmoothScroll) new SmoothScroll('a[href*="#"]:not([data-floor])', { speed: 500 });

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(".cn-deco").forEach((d) => gsap.to(d, { y: "-5vw", ease: "none", scrollTrigger: { trigger: d, start: "top 90%", end: "bottom top", scrub: true } }));
    const pops = gsap.utils.toArray(".cn-pop");
    if (pops.length) gsap.fromTo(pops, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.7)", scrollTrigger: { trigger: pops[0], start: "top 80%", toggleActions: "play none none none" } });
    [["cn-in-left", { x: "-5vw" }, "top 70%"], ["cn-in-right", { x: "5vw" }, "top 70%"], ["cn-in-up", { y: "3vw" }, "top 95%"]].forEach(([cls, from, start]) => {
      gsap.utils.toArray(`.${cls}`).forEach((n) => gsap.fromTo(n, { opacity: 0, ...from }, { opacity: 1, x: 0, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: n, start, toggleActions: "play reverse play reverse" } }));
    });
  });
  if (reduce) gsap.set(".cn-pop", { scale: 1, opacity: 1 });
})();
