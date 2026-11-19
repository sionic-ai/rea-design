// Shared motion: Lenis (lerp .17) · load order (is-load → loaded) · is-shown attached on view · stitch dotted lines sinking in one stitch at a time ·
// White logo clone over the photo stage, menu drawer, order pill hiding, PLAY MOVIE cursor, category selection, Swiper paging, end-scene zoom.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  const head = document.querySelector(".ky-head");
  gsap.registerPlugin(ScrollTrigger);

  /* ── Smooth scroll — like the original, Lenis 1.3.1 (lerp .17 · wheel .75) runs on its own requestAnimationFrame on desktop only (not Safari) ── */
  const mm = gsap.matchMedia();
  const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (canHover && !safari) mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = (window.lenis = new Lenis({ lerp: 0.17, wheelMultiplier: 0.75, syncTouch: false, easing: (x) => 1 - Math.pow(1 - x, 3) }));
    lenis.on("scroll", ScrollTrigger.update);
    let id = 0;
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); window.lenis = null; };
  });

  /* ── When visible, add is-shown once (original rootMargin -20% 0 -20%) ── */
  const onShown = (els, cb, rootMargin = "-20% 0px -20%") => {
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); }
    }, { rootMargin });
    els.forEach((el) => io.observe(el));
  };
  // Each child of a group entrance is delayed by .12s
  document.querySelectorAll(".ky-fadeups, .ky-fades").forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--i", i + 1)));

  /* ── Stitch dashes: each ‹ta-ta› advances one stitch (stitch+gap) and repeats short burst·pause·long burst (original sewAnimator values) ── */
  const PRESETS = {
    normal: { short: 57, long: 57, pause: [0], pattern: [[15, 40], [12, 35], [10, 50]] },
    slow: { short: 96, long: 96, pause: [400, 300, 600], pattern: [[5, 30], [8, 25], [10, 22]] },
    notStop: { short: 42, long: 28, pause: [0], pattern: [[15, 40], [12, 35], [10, 50]] },
    long: { short: 100, long: 32, pause: [0], pattern: [[10, 70], [15, 80]] },
  };
  const NS = "http://www.w3.org/2000/svg";
  const schedule = (count, p) => {
    const times = [];
    let t = 0;
    for (let i = 0; times.length < count; i++) {
      const [a, b] = p.pattern[i % p.pattern.length];
      for (let k = 0; k < a && times.length < count; k++) times.push((t += p.short));
      t += p.pause[i % p.pause.length];
      for (let k = 0; k < b && times.length < count; k++) times.push((t += p.long));
    }
    return times;
  };
  const sewOne = (host) => {
    const cs = getComputedStyle(host);
    const stitch = parseFloat(cs.getPropertyValue("--stitch")) || 5;
    const gap = parseFloat(cs.getPropertyValue("--gap")) || 5;
    const svg = document.createElementNS(NS, "svg");
    const path = document.createElementNS(NS, "path");
    path.setAttribute("class", "ky-stitch__line");
    svg.append(path);
    host.append(svg);
    let len = 0, unit = 1, shown = 0;
    const draw = () => {
      const n = Math.max(0, Math.min(shown, Math.ceil(len / ((stitch + gap) * unit))));
      // Only as many stitch·gap pairs as the revealed stitches are laid out and the rest is one long gap — no mask, it grows one stitch at a time from the end
      const arr = n ? Array(n).fill(`${stitch * unit} ${gap * unit}`).join(" ") + ` 0 ${len + 10}` : `0 ${len + 10}`;
      path.setAttribute("stroke-dasharray", arr);
    };
    const layout = () => {
      const w = host.offsetWidth, h = host.offsetHeight;
      const d = host.dataset.d;
      if (d) {
        const [, , vw, vh] = host.dataset.vb.split(/\s+/).map(Number);
        svg.setAttribute("viewBox", host.dataset.vb);
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        path.setAttribute("d", d);
        unit = 1 / Math.min(w / vw, h / vh);
      } else {
        path.setAttribute("d", host.classList.contains("-y") ? `M0.5 0 V${h}` : `M0 0.5 H${w}`);
        unit = 1;
      }
      len = path.getTotalLength();
      draw();
    };
    layout();
    new ResizeObserver(layout).observe(host);
    const full = () => { shown = Infinity; draw(); };
    const fire = () => {
      if (reduce) return full();
      const p = PRESETS[host.dataset.sew || "normal"];
      const times = schedule(Math.ceil(len / ((stitch + gap) * unit)), p);
      const state = { t: 0 };
      gsap.to(state, {
        t: times[times.length - 1] || 0, duration: (times[times.length - 1] || 0) / 1000, ease: "none",
        onUpdate() { let n = 0; while (n < times.length && times[n] <= state.t) n++; if (n !== shown) { shown = n; draw(); } },
        onComplete: full,
      });
    };
    const delay = host.dataset.delay ? +host.dataset.delay : 200;
    if (host.dataset.on === "load") addEventListener("ky:loaded", () => setTimeout(fire, delay), { once: true });
    else addEventListener("ky:loaded", () => onShown([host], () => setTimeout(fire, delay), "-20% 0px 0%"), { once: true });
  };

  /* ── Placing duplicates of the logo and menu button inside the photo stage (.ky-invert) clips them to the zone, so they turn white only within that zone ── */
  const cloneHead = () => {
    if (!head) return;
    const parts = [head.querySelector(".ky-head__logo"), head.querySelector(".ky-head__btn")];
    document.querySelectorAll(".ky-invert").forEach((zone) => {
      parts.forEach((p) => {
        const c = p.cloneNode(true);
        c.classList.add("ky-clone");
        if (head.classList.contains("-fade")) c.classList.add("-fade");
        c.setAttribute("aria-hidden", "true");
        c.tabIndex = -1;
        zone.prepend(c);
      });
    });
  };

  /* ── Re-evaluating hover after the video window opens — in the original, the window opens even if the cursor stays still, and 176ms later the PLAY circle inside it grows from hover (measured). 
     The copy chrome re-evaluates only when the cursor moves, so at that moment the cursor position is measured again and the same look is applied with is-rehover. When the cursor moves, hand over to the real hover ── */
  const pt = { x: -1, y: -1 };
  addEventListener("pointermove", (e) => {
    pt.x = e.clientX; pt.y = e.clientY;
    document.querySelectorAll(".is-rehover").forEach((el) => el.classList.remove("is-rehover"));
  }, { passive: true });
  // Hook on the first frame the window starts receiving the cursor (re-measured every frame from 50ms up to 400ms)
  window.kyRehover = () => {
    const t0 = performance.now();
    const look = () => {
      if (pt.x < 0) return;
      const top = document.elementFromPoint(pt.x, pt.y);
      const hit = [...document.querySelectorAll(".ky-modal__play")].find((el) => top && el.contains(top) && !el.matches(":hover"));
      if (hit) return hit.classList.add("is-rehover");
      if (performance.now() - t0 < 400) requestAnimationFrame(look);
    };
    setTimeout(look, 50);
  };

  /* ── Menu Drawer ── */
  const menu = () => {
    if (document.querySelector(".ky-sitemap")) document.body.insertAdjacentHTML("beforeend", '<div class="ky-sitemap-bg" aria-hidden="true"></div>');
    const open = (on) => {
      document.body.classList.toggle("is-sitemap-open", on);
      document.querySelectorAll(".ky-sitemap").forEach((s) => s.setAttribute("aria-hidden", on ? "false" : "true"));
      on ? window.lenis?.stop() : window.lenis?.start();
    };
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-menu]");
      if (b) return open(b.dataset.menu === "open" ? !document.body.classList.contains("is-sitemap-open") : false);
      if (document.body.classList.contains("is-sitemap-open") && !e.target.closest(".ky-sitemap")) open(false);
    });
    addEventListener("keydown", (e) => e.key === "Escape" && open(false));
  };

  /* ── Order pill: hidden within the hero intro range ── */
  const order = () => {
    const pill = head?.querySelector(".ky-head__order");
    const area = document.querySelector("[data-order-hidden]");
    if (!pill || !area || !head.classList.contains("-order-fade")) return;
    // The About section shows only after its bottom edge passes the bottom edge of the screen
    const sync = () => pill.classList.toggle("is-shown", area.getBoundingClientRect().bottom <= innerHeight);
    ScrollTrigger.create({ trigger: area, start: "bottom bottom", onToggle: sync });
    addEventListener("ky:loaded", sync, { once: true });
  };

  /* ── PLAY MOVIE cursor: follows the mouse at a .125 ratio ── */
  const cursor = () => {
    const areas = document.querySelectorAll("[data-cursor-area]");
    if (!areas.length || !canHover) return;
    const el = document.createElement("div");
    el.className = "ky-cursor";
    el.innerHTML = '<p class="ky-cursor__play">PLAY<br>MOVIE</p>';
    document.body.append(el);
    const m = { x: innerWidth / 2, y: innerHeight / 2 }, p = { ...m };
    addEventListener("pointermove", (e) => { m.x = e.clientX; m.y = e.clientY; el.classList.add("is-start"); }, { passive: true });
    areas.forEach((a) => {
      a.addEventListener("pointerenter", () => el.classList.add("is-play"));
      a.addEventListener("pointerleave", () => el.classList.remove("is-play"));
    });
    gsap.ticker.add(() => {
      p.x += (m.x - p.x) * 0.125;
      p.y += (m.y - p.y) * 0.125;
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    });
  };

  /* ── Category select: the row height opens in .5s easeInOutQuart ── */
  const selects = () => {
    document.querySelectorAll(".ky-select").forEach((s) => {
      const panel = s.querySelector(".ky-select__panel");
      s.querySelector(".ky-select__btn").addEventListener("click", () => {
        const on = !s.classList.contains("is-open");
        s.classList.toggle("is-open", on);
        panel.style.height = on ? panel.scrollHeight + "px" : "0px";
      });
    });
  };

  /* ── Paging (original Swiper 8.4.2 — horizontal wheel uses forceToAxis, threshold 5) ── */
  window.kySwiper = (root, o = {}) => window.Swiper ? new Swiper(root, {
    slidesPerView: "auto",
    mousewheel: { enabled: true, forceToAxis: true, sensitivity: 1.0, thresholdDelta: 5 },
    ...o,
    ...(reduce ? { speed: 0, autoplay: false } : {}),
  }) : null;
  /* ── Ending scene: photo scales 1 → 1.2 while passing through the section ── */
  const efoot = () => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".ky-efoot").forEach((z) => {
        gsap.fromTo(z.querySelector(".ky-efoot__bg"), { scale: 1 }, { scale: 1.2, ease: "none", scrollTrigger: { trigger: z, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
  };

  cloneHead();
  document.querySelectorAll(".ky-stitch").forEach(sewOne);
  menu();
  order();
  cursor();
  selects();
  efoot();

  // Original order: is-load on load (hero photo · page fade) → is-loaded on loaded (header after 2.5s) · dotted lines · scroll reveal
  const loaded = () => {
    document.body.classList.add("is-load");
    document.querySelectorAll(".ky-fade.-load").forEach((el) => el.classList.add("is-shown"));
    requestAnimationFrame(() => {
      document.body.classList.add("is-loaded");
      document.querySelectorAll(".ky-load-trigger").forEach((el) => el.classList.add("is-shown"));
      onShown(document.querySelectorAll(".ky-trigger"), (el) => el.classList.add("is-shown"));
      dispatchEvent(new Event("ky:loaded"));
      ScrollTrigger.refresh();
    });
  };
  document.readyState === "complete" ? loaded() : addEventListener("load", loaded, { once: true });
})();
