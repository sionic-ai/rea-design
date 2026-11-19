// Home — playbook. Above 1200px the left photo panel, center ring and right thin strip stick to the screen while the step rows pass by.
// The step changes when the line head passes screen center (original top center ~ bottom center). Below 1200px, each step stacks photo · text · horizontal band.
(() => {
  const root = document.querySelector(".lm-pb");
  if (!root) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const steps = [...root.querySelectorAll(".lm-pb__step")];
  const layers = [...root.querySelectorAll(".lm-pb__layer")];
  const inners = layers.map((l) => l.querySelector(".lm-pb__inner"));
  steps.forEach((s, i) => { s.style.gridRow = String(i + 1); });
  const EASE = "power2.inOut";
  const NS = "http://www.w3.org/2000/svg";

  // Overlapping ellipse rings — all grow attached to one end (top for vertical panels, left for horizontal ones), and each ring is a band hollowed out from the ellipse just inside it
  const rings = (n, dir, onSelect) => {
    const svg = document.createElementNS(NS, "svg");
    const vert = dir === "v";
    svg.setAttribute("viewBox", vert ? "0 0 59 157" : "0 0 157 59");
    svg.setAttribute("class", "lm-rings" + (onSelect ? " is-live" : ""));
    const long = (k) => 17.6 + (k * 60.5) / Math.max(1, n - 1);
    const short = (k) => 10.4 + (k * 18.1) / Math.max(1, n - 1);
    const ell = (k) => {
      const a = long(k), b = short(k);
      const [cx, cy, rx, ry] = vert ? [29.5, 0.6 + a, b, a] : [0.6 + a, 29.5, a, b];
      return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
    };
    const groups = [];
    for (let k = 0; k < n; k++) {
      const g = document.createElementNS(NS, "g");
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", k ? `${ell(k)} ${ell(k - 1)}` : ell(0));
      p.setAttribute("fill-rule", "evenodd");
      p.setAttribute("class", "lm-ring");
      const t = document.createElementNS(NS, "text");
      const mid = k ? long(k - 1) + long(k) : long(0);
      t.setAttribute(vert ? "x" : "y", "29.5");
      t.setAttribute(vert ? "y" : "x", String(0.6 + mid));
      t.setAttribute("class", "lm-ring-n");
      t.textContent = String(k + 1);
      g.append(p, t);
      if (onSelect) {
        g.setAttribute("role", "button");
        g.setAttribute("tabindex", "0");
        g.setAttribute("aria-label", `${k + 1}Step`);
        g.addEventListener("click", () => onSelect(k));
        g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(k); } });
      }
      svg.append(g);
      groups.push(g);
    }
    return { svg, set: (i) => groups.forEach((g, k) => { g.classList.toggle("is-on", k === i); g.setAttribute("aria-pressed", String(k === i)); }) };
  };

  // Photos for the thin strip and phone horizontal row — built from labels written per step (the strip joins steps in reverse like the original)
  const thumbsOf = (step) => [...step.querySelectorAll(".lm-pb__thumbs i")].map((i) => i.dataset.label);
  const thumb = (label) => {
    const d = document.createElement("div");
    d.className = "wf-img lm-ar-3x4";
    d.dataset.label = label;
    return d;
  };
  const track = root.querySelector(".lm-pb__track");
  [...steps].reverse().forEach((s) => thumbsOf(s).forEach((l) => track.append(thumb(l))));

  const deskRings = rings(steps.length, "v", (i) => steps[i].scrollIntoView({ behavior: "smooth", block: "center" }));
  root.querySelector("[data-lm-rings]").append(deskRings.svg);

  // ───────── Build the phone panel ─────────
  const mob = document.createElement("section");
  mob.className = "lm-pbm";
  mob.dataset.slot = "playbook-mobile";
  mob.innerHTML = `<h2 class="lm-px t-h5 lm-pbm__h">${root.querySelector(".lm-pb__head h2").textContent}</h2>`;
  const mobRings = [];
  const mobItems = steps.map((s, i) => {
    const item = document.createElement("div");
    item.className = "lm-pbm__item";
    const label = layers[i].querySelector(".wf-img").dataset.label.replace("Full-height panel", "Full-width panel");
    item.innerHTML = `<div class="lm-pbm__media"><div class="wf-img lm-fill" data-label="${label}"></div></div>
      <div class="lm-pbm__body">
        <div class="lm-px lm-pbm__text">
          <div class="lm-pbm__top"><h3 class="t-h2 lm-pb__title">${s.querySelector(".lm-pb__title").innerHTML}</h3><div class="lm-pbm__rings"></div></div>
          <p class="t-b1">${s.querySelector(".lm-pb__body").textContent}</p>
        </div>
        <div class="lm-pbm__rail"><div class="lm-pbm__row"></div></div>
      </div>`;
    const r = rings(steps.length, "h", null);
    item.querySelector(".lm-pbm__rings").append(r.svg);
    mobRings.push(r);
    const row = item.querySelector(".lm-pbm__row");
    thumbsOf(s).forEach((l) => row.append(thumb(l)));
    mob.append(item);
    return item;
  });
  root.after(mob);

  // Per step, title words rise once at .6s · .04s, body words after a delay at .5s · .015s
  const splitAll = (titles, bodies) => ({
    t: titles.map((el) => window.lmWords(el)),
    b: bodies.map((el) => window.lmWords(el, { aria: false })),
  });
  const reveal = (sp, seen, i, bodyDelay) => {
    if (seen.has(i)) return;
    seen.add(i);
    if (sp.t[i]) gsap.to(sp.t[i].words, { yPercent: 0, duration: 0.6, stagger: 0.04, ease: "power3.out" });
    if (sp.b[i]) gsap.to(sp.b[i].words, { yPercent: 0, duration: 0.5, delay: bodyDelay, stagger: 0.015, ease: "power3.out" });
  };

  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia();

  mm.add("(min-width: 1200px) and (prefers-reduced-motion: no-preference)", () => {
    layers.forEach((l, i) => gsap.set(l, { clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)", zIndex: i + 1 }));
    inners.forEach((el) => gsap.set(el, { scale: 1.1 }));
    const sp = splitAll(steps.map((s) => s.querySelector(".lm-pb__title")), steps.map((s) => s.querySelector(".lm-pb__body")));
    const seen = new Set();
    let cur = 0, active = null;
    const go = (i) => {
      if (i === active) return;
      active = i;
      deskRings.set(i);
      if (i > cur) for (let k = cur + 1; k <= i; k++) {
        gsap.to(layers[k], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: EASE });
        gsap.to(inners[k - 1], { scale: 1, duration: 0.45, ease: EASE });
      } else for (let k = cur; k > i; k--) {
        gsap.to(layers[k], { clipPath: "inset(0% 100% 0% 0%)", duration: 0.45, ease: EASE });
        gsap.to(inners[k - 1], { scale: 1.1, duration: 0.45, ease: EASE });
      }
      cur = i;
      reveal(sp, seen, i, 0.5);
    };
    steps.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top center", end: "bottom center", onEnter: () => go(i), onEnterBack: () => go(i) }));
    gsap.fromTo(track, { yPercent: -100 }, { yPercent: 0, y: "0dvh", ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom bottom+=100dvh", scrub: 1 } });
    return () => { [...sp.t, ...sp.b].forEach((s) => s && s.revert()); deskRings.set(-1); };
  });

  mm.add("(max-width: 1199px) and (prefers-reduced-motion: no-preference)", () => {
    const sp = splitAll(mobItems.map((m) => m.querySelector(".lm-pb__title")), mobItems.map((m) => m.querySelector(".t-b1")));
    const seen = new Set();
    mobItems.forEach((m, i) => {
      ScrollTrigger.create({ trigger: m, start: "top center", end: "bottom center", onEnter: () => { mobRings.forEach((r) => r.set(i)); reveal(sp, seen, i, 0.3); }, onEnterBack: () => { mobRings.forEach((r) => r.set(i)); reveal(sp, seen, i, 0.3); } });
      const row = m.querySelector(".lm-pbm__row"), rail = m.querySelector(".lm-pbm__rail");
      gsap.fromTo(row, { xPercent: 0 }, {
        xPercent: () => { const over = row.scrollWidth - rail.clientWidth; return over > 0 ? -(over / row.scrollWidth) * 100 : 0; },
        ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true },
      });
    });
    return () => [...sp.t, ...sp.b].forEach((s) => s && s.revert());
  });

  if (reduce) { deskRings.set(0); mobRings.forEach((r) => r.set(0)); }
})();
