// Two brush strokes (sweep) of weight 3000 cover the screen, a ribbon brush stroke draws one stroke of the logo (draw) and passes, and the letters (pop) pop out.
// Once the page has fully loaded and at least min seconds have passed, rest .2s, then from the top brushstroke slide out diagonally leaving half so the screen opens, and fire fx:done.
// A page reached through a same-site link (skip: nav) opens straight away with no veil — the original plays the loader only on a fresh open or a refresh.
(() => {
  const NAV_KEY = "fx-brush-sweep-nav";
  let marking = false;
  const markNav = () => {
    if (marking) return;
    marking = true;
    document.addEventListener("click", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || /^(mailto|tel):/.test(href) || a.origin !== location.origin) return;
      sessionStorage.setItem(NAV_KEY, "1");
    });
  };
  // Paints only the a–b portion of the line (0–1). With round caps, even at length 0 it is handled together with thickness so no single dot remains
  const seg = (p, len, a, b) => {
    p.style.strokeDasharray = `${Math.max(0, b - a) * len} ${len * 2}`;
    p.style.strokeDashoffset = `${-a * len}`;
  };

  kfFx.register("brush-sweep-loader", (el, { options, reduce }) => {
    const done = () => {
      el.style.display = "none";
      el.style.pointerEvents = "none";
      window.__fxLoaderDone = true;
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    };
    const skipNav = options.skip === "nav";
    if (skipNav) markNav();
    const nav = performance.getEntriesByType?.("navigation")[0];
    const reload = nav ? nav.type === "reload" : false;
    const came = skipNav && sessionStorage.getItem(NAV_KEY) === "1";
    if (skipNav) sessionStorage.removeItem(NAV_KEY);
    if (reduce || (came && !reload)) {
      const raf = requestAnimationFrame(done);
      return () => cancelAnimationFrame(raf);
    }

    const sweeps = [...el.querySelectorAll('[data-fx-part="sweep"]')];
    const logo = el.querySelector('[data-fx-part="logo"]');
    const ribbon = el.querySelector('[data-fx-part="ribbon"]');
    const draw = el.querySelector('[data-fx-part="draw"]');
    const pops = [...el.querySelectorAll('[data-fx-part="pop"]')];
    const cover = +(options.cover ?? 3000), thin = +(options.thin ?? 1000);
    const sweep = +(options.sweep ?? 0.65), min = +(options.min ?? 2), hold = +(options.hold ?? 0.2);
    const speed = +(options.speed || 1.25), ribbonW = +(options.ribbon ?? 19), drawW = +(options["draw-width"] ?? 19);
    const [dx, dy] = (options.drift || "900, 1800").split(",").map(Number);

    const lens = new Map();
    const len = (p) => lens.get(p) ?? (lens.set(p, p.getTotalLength?.() || 3000), lens.get(p));
    sweeps.forEach((p) => {
      seg(p, len(p), 0, 1);
      gsap.set(p, { strokeWidth: cover, x: 0, y: 0 });
    });

    const tl = gsap.timeline({ delay: +(options.delay ?? 0.25) }).timeScale(speed);
    // Show the logo after the starting position is fully set (fx.css hides it)
    tl.set(logo || {}, logo ? { visibility: "visible" } : {}, 0);
    if (ribbon) {
      const r = { a: 0, b: 0 }, L = len(ribbon), paint = () => seg(ribbon, L, r.a, r.b);
      paint();
      gsap.set(ribbon, { strokeWidth: 0 });
      tl.to(ribbon, { strokeWidth: ribbonW, duration: 1, ease: "power2.in" }, 0)
        .to(r, { b: 0.07, duration: 0.7, ease: "power2.in", onUpdate: paint }, 0)
        .to(r, { a: 0.4, b: 0.47, duration: 1.2, ease: "none", onUpdate: paint }, 0.7);
    }
    if (draw) {
      const d = { b: 0 }, L = len(draw), paint = () => seg(draw, L, 0, d.b);
      paint();
      gsap.set(draw, { strokeWidth: drawW });
      tl.to(d, { b: 1, duration: 1.1, ease: "power2.out", onUpdate: paint }, ribbon ? "-=0.4" : 0);
    }
    if (ribbon) {
      const r = { a: 0.4, b: 0.47 }, L = len(ribbon), paint = () => seg(ribbon, L, r.a, r.b);
      tl.to(r, { a: 1, b: 1, duration: 1.1, ease: "power2.inOut", onUpdate: paint, immediateRender: false }, "-=0.5")
        .to(ribbon, { strokeWidth: 0, duration: 0.5, ease: "power2.in" }, "-=0.55");
    }
    // In the original the ribbon starts low and, after drawing fully, lifts the whole logo to the screen center — lift is a share of the logo height
    if (logo) {
      const lift = +(options.lift ?? 0.06);
      gsap.set(logo, { yPercent: lift * 100 });
      tl.to(logo, { yPercent: 0, duration: 0.8, ease: "power2.inOut" }, "+=0.1");
    }
    if (pops.length) {
      pops.forEach((p) => {
        const b = p.getBBox?.();
        gsap.set(p, b ? { scale: 0, rotation: gsap.utils.random(-25, 25), strokeWidth: 6, svgOrigin: `${b.x + b.width / 2} ${b.y + b.height / 2}` } : { scale: 0, rotation: gsap.utils.random(-25, 25), transformOrigin: "50% 50%" });
      });
      tl.to(pops, { scale: 1, rotation: 0, duration: 0.6, stagger: 0.1, ease: "back.out(3)" }, "-=0.2")
        .to(pops, { strokeWidth: 0, duration: 0.6, stagger: 0.1, ease: "power1.in" }, "<");
    }

    // At least min seconds after everything is received — the original starts lifting the curtain at 2 seconds even if the logo drawing isn’t finished
    let loaded = document.readyState === "complete", timed = false, exited = false, exitTl;
    const exit = () => {
      if (exited || !loaded || !timed) return;
      exited = true;
      exitTl = gsap.timeline({ onComplete: done });
      exitTl.to({}, { duration: hold });
      const order = sweeps.slice().reverse();
      order.forEach((p, i) => {
        const o = { a: 0 }, L = len(p), paint = () => seg(p, L, o.a, 1);
        const at = `out+=${i * sweep * 0.25}`;
        if (i === 0) exitTl.addLabel("out");
        exitTl.to(o, { a: 0.5, duration: sweep, ease: "power2.inOut", onUpdate: paint }, at)
          .to(p, { strokeWidth: thin, x: i % 2 ? -dx : dx, y: dy, duration: sweep, ease: "power2.inOut" }, at);
      });
      if (logo) exitTl.to(logo, { opacity: 0, duration: 0.15, ease: "power1.out" }, `out+=${sweep * 0.2}`);
    };
    const onLoad = () => { loaded = true; exit(); };
    if (!loaded) addEventListener("load", onLoad, { once: true });
    const t1 = setTimeout(() => { timed = true; exit(); }, min * 1000);
    // Open after 6 seconds even if the outer one never comes up
    const t2 = setTimeout(() => { loaded = timed = true; exit(); }, Math.max(6, min) * 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      removeEventListener("load", onLoad);
      tl.kill();
      exitTl?.kill();
      const all = [...sweeps, ribbon, draw, logo, ...pops].filter(Boolean);
      if (all.length) gsap.set(all, { clearProps: "all" });
    };
  });
})();
