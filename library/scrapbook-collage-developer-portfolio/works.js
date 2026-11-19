// Case study: cover lines rise from below, a blue path descends in each section to reach the number dot, and the breadcrumb follows the current section.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chapters = ["place", "map", "app", "build", "ship"];
  const names = { place: "Place", map: "Map", app: "App", build: "Build", ship: "Launch" };

  // Road graph: scatter walkway nodes using a seed random, and draw the single shortest path from start to destination in blue
  const graph = (() => {
    const svg = document.querySelector(".g-graph");
    const ns = "http://www.w3.org/2000/svg";
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const add = (tag, a) => { const el = document.createElementNS(ns, tag); for (const k in a) el.setAttribute(k, a[k]); svg.append(el); return el; };
    const pts = [];
    for (let i = 0; i < 46; i++) pts.push([120 + rnd() * 380, 60 + rnd() * 640]);
    pts.forEach((p, i) => {
      const near = pts.map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j]).sort((a, b) => a[0] - b[0]).slice(1, 3);
      near.forEach(([, j]) => j > i && add("path", { class: "g-edge", d: `M${p[0].toFixed(1)} ${p[1].toFixed(1)} L${pts[j][0].toFixed(1)} ${pts[j][1].toFixed(1)}` }));
    });
    pts.forEach((p) => add("circle", { class: "g-node", cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 2.6 }));
    const route = add("path", { class: "g-path", d: "M300 690 L250 620 L215 560 L230 520 L250 470 L220 410 L270 330" });
    add("circle", { class: "g-goal", cx: 270, cy: 330, r: 9 });
    add("circle", { class: "g-start", cx: 300, cy: 690, r: 11 });
    return route;
  })();

  const lines = (scope) => scope.querySelectorAll(".g-line > span");

  // On entering (original sequence, as when opened directly): the line over the photo is drawn in .55s (destination pin at .42, “Here” at .5),
  // From .32 category → title lines at .14 intervals (power4.out) → one-line summary at .67 → field and photo caption → at .85 the section list opens from the left. Under 1000 width it only rises 8px
  const open = (k) => document.querySelectorAll("[data-open]")[k];
  const title = document.querySelectorAll(".g-openingTitle h1 .g-line > span"), deck = document.querySelectorAll(".g-deck .g-line > span");
  const caption = document.querySelector(".g-aerial figcaption"), navLabel = document.querySelector(".g-route__title"), navItems = document.querySelectorAll(".g-route li");
  const intro = matchMedia("(min-width: 1000px)").matches
    ? gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .set([open(0)], { y: 7, autoAlpha: 0 })
      .set([title, deck], { yPercent: 104 })
      .set([open(1), caption, navLabel], { y: 6, autoAlpha: 0 })
      .set(navItems, { clipPath: "inset(0 100% 0 0)" })
      .set(".g-aerial__pin", { y: -8, scale: 0.96, autoAlpha: 0, transformOrigin: "50% 100%" })
      .set(".g-here", { y: 6, autoAlpha: 0 })
      .fromTo(".g-aerial__route path", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, 0)
      .to(".g-aerial__pin", { y: 0, scale: 1, autoAlpha: 1, duration: 0.32 }, 0.42)
      .to(".g-here", { y: 0, autoAlpha: 1, duration: 0.22 }, 0.5)
      .to(open(0), { y: 0, autoAlpha: 1, duration: 0.22 }, 0.32)
      .to(title, { yPercent: 0, duration: 0.38, stagger: 0.14, ease: "power4.out" }, 0.4)
      .to(deck, { yPercent: 0, duration: 0.3, stagger: 0.1 }, 0.67)
      .to(open(1), { y: 0, autoAlpha: 1, duration: 0.2 }, 0.8)
      .to(caption, { y: 0, autoAlpha: 1, duration: 0.2 }, 0.82)
      .to(navLabel, { y: 0, autoAlpha: 1, duration: 0.18 }, 0.85)
      .to(navItems, { clipPath: "inset(0 0% 0 0)", clearProps: "clipPath", duration: 0.32, stagger: 0.06 }, 0.9)
    : gsap.timeline({ paused: true, defaults: { ease: "power2.out" } })
      .fromTo(title, { y: 8 }, { y: 0, duration: 0.28, stagger: 0.04 }, 0)
      .fromTo([open(0), ...deck, open(1), caption, navLabel], { y: 8 }, { y: 0, duration: 0.3, stagger: 0.02 }, 0);
  // If the URL has a section name or the page is already scrolled down, show the finished state — scrolling during the reveal finishes it immediately
  const settle = () => { if (scrollY > 4) { intro.progress(1); removeEventListener("scroll", settle); } };
  if (reduce || location.hash || scrollY > 4) intro.progress(1);
  else { addEventListener("scroll", settle, { passive: true }); intro.play(); }

  // Current section: paint the route (top) and the small route indicator (bottom left) together
  const marker = document.querySelector(".g-marker");
  const setChapter = (id) => {
    const at = chapters.indexOf(id);
    document.querySelectorAll("[data-stop]").forEach((a) => {
      const i = chapters.indexOf(a.dataset.stop);
      a.toggleAttribute("aria-current", i === at);
      a.parentElement.toggleAttribute("data-passed", i < at);
    });
    marker.querySelector("[data-marker-num]").textContent = String(at + 1).padStart(2, "0");
    marker.querySelector("[data-marker-name]").textContent = names[id];
    marker.dataset.dark = id === "build" || id === "ship" ? "true" : "false";
  };
  setChapter("place");
  chapters.forEach((id) => ScrollTrigger.create({ trigger: `#${id}`, start: "top 50%", end: "bottom 50%", onToggle: (st) => st.isActive && setChapter(id) }));
  ScrollTrigger.create({ trigger: ".g-route", start: "bottom top", end: () => document.querySelector(".g-next").offsetTop, onToggle: (st) => (marker.dataset.visible = st.isActive ? "true" : "false") });

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", held: "(min-width: 1000px)" }, (ctx) => {
    const { motion, held } = ctx.conditions;
    if (!motion) return;
    // Section title: when it reaches 80% of the screen, each line rises from below. On desktop the place and launch titles are pushed separately within the pin
    document.querySelectorAll(held ? ".g-mapOpening, .g-appEditorial, .g-buildHead" : ".g-problem, .g-mapOpening, .g-appEditorial, .g-buildHead, .g-shipGrid").forEach((el) => {
      gsap.fromTo(lines(el), { yPercent: 105 }, { yPercent: 0, duration: 0.8, stagger: 0.07, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" } });
    });
    document.querySelectorAll(".g-drop").forEach((d) => gsap.fromTo(d, { "--drop": 0 }, { "--drop": 1, ease: "none", scrollTrigger: { trigger: d.parentElement, start: "top 90%", end: "top 30%", scrub: true } }));
    const len = graph.getTotalLength();
    gsap.timeline({ scrollTrigger: held ? { trigger: ".g-mapWorld", start: "top top", end: "+=2600", scrub: true } : { trigger: ".g-mapWorld", start: "top top", end: "bottom bottom", scrub: true } })
      .fromTo(".g-graph .g-edge, .g-graph .g-node", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, stagger: 0.002 }, 0)
      .fromTo(graph, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.4, ease: "none" }, 0.2)
      .fromTo(".g-mapNote, .g-mapTech, .g-graphLabel", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.1, stagger: 0.05 }, 0.3)
      .fromTo(".g-mapDevice", { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.55)
      .fromTo(".g-mapPayoff", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.8);

    if (held) {
      // 01 Place (original table, holds 1040px, scrub 1): section number (45%→-25px), title (20%→-230px), body (-230→-490px), handwriting (-490→-680px) each
      // Slides in from off the left of the screen, and the photo comes in from 1.5× screen on the right (80%→-150px, power2.out)
      const beat = document.querySelector(".g-problem");
      const slide = (el, start, end) => el && gsap.fromTo(el, { x: () => -innerWidth, opacity: 0 }, { x: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: beat, start, end, scrub: 1, invalidateOnRefresh: true } });
      slide(beat.querySelector(".g-stop"), "top 45%", "top -25px");
      slide(beat.querySelector("h2"), "top 20%", "top -230px");
      slide(beat.querySelector(".g-problem__body"), "top -230px", "top -490px");
      slide(beat.querySelector(".g-note"), "top -490px", "top -680px");
      gsap.fromTo(".g-lighthouse", { x: () => innerWidth * 1.5 }, { x: 0, ease: "power2.out", scrollTrigger: { trigger: beat, start: "top 80%", end: "top -150px", scrub: 1, invalidateOnRefresh: true } });
      // 03 App: only pushes the progress value over 4000px — the first half is the title, in the second half (--p) four screens enter at the original thresholds (.1·.29·.47·.66)
      gsap.fromTo(".g-appExplore", { "--app-progress": 0 }, { "--app-progress": 1, ease: "none", scrollTrigger: { trigger: ".g-appExplore", start: "top 110px", end: "+=4000", scrub: true } });
      gsap.fromTo(".g-handoff__line path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".g-handoff", start: "top top", end: "+=700", scrub: true } });
      // 04 Build: stays for 4400px — the header in the first 48%, the rest shows the lineage diagram step by step
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".g-build", start: "top top", end: "+=4400", scrub: true } })
        .fromTo(".g-buildHand", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.26)
        .fromTo(".g-sys--app", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.48)
        .fromTo(".g-arrow--a", { scaleX: 0 }, { scaleX: 1, duration: 0.06 }, 0.54)
        .fromTo(".g-sys--api", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.6)
        .fromTo(".g-arrow--down", { scaleX: 0 }, { scaleX: 1, duration: 0.06 }, 0.66)
        .fromTo(".g-sys--db", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.72)
        .fromTo(".g-arrow--b", { scaleX: 0 }, { scaleX: 1, duration: 0.06 }, 0.78)
        .fromTo(".g-sys--admin", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.84)
        .fromTo(".g-sys--cloud, .g-handoffLine", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.06, stagger: 0.04 }, 0.9);
      // 05 Launch: pushes only --ship-progress for 1500px. The panel, title, store button, and destination photo move by the original CSS formulas
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".g-ship", start: "top top", end: "+=1500", scrub: true } })
        .fromTo(".g-ship", { "--ship-progress": 0 }, { "--ship-progress": 1, duration: 1 }, 0)
        .fromTo(".g-destination path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3 }, 0.5)
        .fromTo(".g-destination__pin, .g-arrived", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.1, stagger: 0.05 }, 0.8);
      // Next work (original table, scrub .6): the big title comes down from above (.35 power3.out), and from .3 the text enters from the left and the phone from the right, tilted 5° (.6).
      const head = document.querySelector(".g-nextLink");
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: ".g-next", start: "top 70%", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } })
        .fromTo(head, { y: () => -(head.offsetTop + head.offsetHeight + 4) }, { y: 0, ease: "power3.out", duration: 0.35 }, 0)
        .fromTo(".g-next .g-meta, .g-nextLine, .g-backBottom", { xPercent: -150, rotate: -5, opacity: 0 }, { xPercent: 0, rotate: 0, opacity: 1, ease: "power3.out", duration: 0.6 }, 0.3)
        .fromTo(".g-nextPhone", { xPercent: 150, rotate: 5, opacity: 0 }, { xPercent: 0, rotate: 0, opacity: 1, ease: "power3.out", duration: 0.6 }, 0.3)
        .to({}, { duration: 0 }, 1);
      return;
    }

    gsap.fromTo(".g-problem__body, .g-note, .g-lighthouse", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: ".g-problem", start: "top 70%", toggleActions: "play none none reverse" } });
    gsap.fromTo(".g-appShot", { autoAlpha: 0, y: 90, rotation: (i) => [-4, 3, -2, 5][i] }, { autoAlpha: 1, y: 0, rotation: 0, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: ".g-appComp", start: "top 85%", end: "top 30%", scrub: true } });
    gsap.fromTo(".g-handoff__line path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".g-handoff", start: "top 80%", end: "top 10%", scrub: true } });
    gsap.timeline({ scrollTrigger: { trigger: ".g-system", start: "top 80%", end: "bottom 50%", scrub: true } })
      .fromTo(".g-sys--app", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0)
      .fromTo(".g-arrow--a", { scaleX: 0 }, { scaleX: 1, duration: 0.1, ease: "none" }, 0.1)
      .fromTo(".g-sys--api", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.2)
      .fromTo(".g-arrow--down", { scaleX: 0 }, { scaleX: 1, duration: 0.1, ease: "none" }, 0.3)
      .fromTo(".g-sys--db", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.4)
      .fromTo(".g-arrow--b", { scaleX: 0 }, { scaleX: 1, duration: 0.1, ease: "none" }, 0.5)
      .fromTo(".g-sys--admin", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.6)
      .fromTo(".g-sys--cloud", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.75);
    gsap.timeline({ scrollTrigger: { trigger: ".g-ship", start: "top 85%", end: "top 15%", scrub: true } })
      .fromTo(".g-shipPanel", { "--ship-cut": "100%" }, { "--ship-cut": "0%", ease: "none", duration: 1 }, 0)
      .fromTo(".g-destination", { autoAlpha: 0, y: 60, rotation: 6 }, { autoAlpha: 1, y: 0, rotation: 2, duration: 0.6 }, 0.3)
      .fromTo(".g-destination path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: "none" }, 0.5)
      .fromTo(".g-destination__pin, .g-arrived", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.1 }, 0.85);
    gsap.fromTo(".g-nextGrid > *", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".g-next", start: "top 70%", end: "top 10%", scrub: true } });
  });
})();
