// Used by all pages — lenis (same 1.3.23 as the original · duration 1.5), header pull-down, phone menu and map button.
// Page-turn pillars, button roll, photo parallax and wipe reveal are handled by the _fx parts (strip-fade-page · roll-box-btn · inner-parallax · soft-mask-reveal).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  let lenis = null;
  if (!reduce && window.Lenis) {
    // Original: new Lenis({ autoRaf: true, smoothTouch: true, lerp: 1, duration: 1.5 })
    lenis = new Lenis({ autoRaf: true, smoothTouch: true, lerp: 1, duration: 1.5 });
    lenis.on("scroll", ScrollTrigger.update);
    window.lenis = lenis;
  }

  const ck = document.querySelector(".ck");
  // The header rises as much as you scroll down and is fully hidden at 66px (phone 51px × width/375), and comes back down by the same amount when you scroll up (original --headerMove).
  // The first page lifts the panel at the very top (within 5px) and lays the panel down again only after everything is hidden (original onTop)
  // Item detail (header with a second row) doesn’t peel off the panel — only the original brand_top header uses onTop
  const hasTop = !!ck && !ck.classList.contains("ck--local");
  if (ck) {
    let last = null, move = 0, onTop = false;
    const tick = () => {
      const y = Math.max(0, scrollY);
      if (y !== last) {
        const max = innerWidth <= 767 ? 51 * innerWidth / 375 : 66 * Math.max(0.8, innerWidth / 1440);
        move = last == null ? 0 : Math.ceil(Math.min(max, Math.max(0, move + (y - last))));
        ck.style.setProperty("--head-move", `${move}px`);
        ck.classList.toggle("is-hide", move >= max);
        if (hasTop) {
          if (onTop) { if (y >= 5 && move >= max) onTop = false; } else if (y < 5) onTop = true;
          root.classList.toggle("is-ontop", onTop);
        }
        last = y;
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  if (ck) {
    // Pull-down — opens while hovered, expansion by css at .75s after .25s
    const pulls = ck.querySelectorAll(".ck__pull");
    const sync = () => ck.classList.toggle("is-pull", !!ck.querySelector(".ck__pull.is-open"));
    pulls.forEach((p) => {
      p.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") { p.classList.add("is-open"); sync(); } });
      p.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") { p.classList.remove("is-open"); sync(); } });
      // The mouse is already open while hovering, so press only toggles open and closed for touch and keyboard
      let kind = "";
      p.addEventListener("pointerdown", (e) => { kind = e.pointerType; });
      p.querySelector(".ck__btn")?.addEventListener("click", () => {
        if (kind === "mouse") { kind = ""; return; }
        pulls.forEach((o) => o !== p && o.classList.remove("is-open")); p.classList.toggle("is-open"); sync();
      });
    });
    ck.querySelector(".ck__veil")?.addEventListener("click", () => { pulls.forEach((o) => o.classList.remove("is-open")); ck.classList.remove("is-sp"); sync(); lenis?.start(); });

    // Phone menu — the three-dot box turns into ×, the panel unfolds from top to bottom
    const toggle = ck.querySelector(".ck__toggle");
    toggle?.addEventListener("click", () => {
      const open = ck.classList.toggle("is-sp");
      toggle.setAttribute("aria-expanded", open);
      open ? lenis?.stop() : lenis?.start();
    });
    // Accordion — measures height and opens and closes in .5s
    ck.querySelectorAll(".ck__acc").forEach((acc) => {
      const body = acc.querySelector(".ck__acc-body");
      acc.querySelector(".ck__acc-head").addEventListener("click", () => {
        const open = !acc.classList.contains("is-open");
        body.style.height = open ? body.scrollHeight + "px" : "0px";
        acc.classList.toggle("is-open", open);
      });
    });
  }

  // Map — pressing a region button moves to that spot and hides the other region markers
  document.querySelectorAll(".c-map").forEach((map) => {
    const world = map.querySelector(".c-map__world");
    const spots = { a: [18, 12], b: [-14, -10], all: [0, 0] };
    const go = (key) => {
      map.dataset.current = key;
      map.querySelectorAll(".c-map__btn").forEach((b) => b.classList.toggle("is-current", b.dataset.target === key));
      const [x, y] = spots[key] || spots.all;
      world.style.transform = `translate(${x}rem, ${y}rem) scale(${key === "all" ? 0.8 : 1})`;
    };
    map.querySelectorAll(".c-map__btn").forEach((b) => b.addEventListener("click", () => go(b.dataset.target)));
    go(map.dataset.current || "all");
  });

  // The transition curtain lifts after fonts are ready and 300ms have passed (original siteready — the last of fonts·300ms·hero video)
  addEventListener("DOMContentLoaded", () => {
    Promise.all([document.fonts ? document.fonts.ready : null, new Promise((r) => setTimeout(r, 300))])
      .then(() => document.dispatchEvent(new Event("c-siteready")));
  });
})();
