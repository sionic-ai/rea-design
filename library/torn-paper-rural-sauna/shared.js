// Motion shared by two pages: Lenis, a pill strip that sticks up with scroll, price·booking expansion inside the strip, price season tabs,
// Ink-bleed image generation, large footer text, swup page transitions and reattaching page motion after each transition.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const wrapper = document.querySelector(".wrapper");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lenis = null;

  // ---------- Ink blot: the same shape per seed value — big mass + splatter drops + dry-brush grain ----------
  // Like a brush stroke, dense inside and scattering into grains only at the edge — add noise to a blurred shape and keep only where it crosses the threshold
  const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const smooth = (pts) => {
    const n = pts.length;
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + "Z";
  };
  const blob = (r, cx, cy, rad, n, wob) =>
    smooth(Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const k = rad * (1 - wob / 2 + r() * wob);
      return [cx + Math.cos(a) * k * 1.25, cy + Math.sin(a) * k];
    }));
  function ink(seed) {
    const r = rand(seed * 7919 + 13);
    let body = "";
    const lumps = 2 + Math.floor(r() * 3);
    for (let i = 0; i < lumps; i++) body += `<path d="${blob(r, 200 + (r() - .5) * 180, 150 + (r() - .5) * 120, 50 + r() * 60, 14, .9)}"/>`;
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, dist = 90 + r() * 110, s = 2 + r() * 11;
      body += `<ellipse cx="${(200 + Math.cos(a) * dist * 1.4).toFixed(1)}" cy="${(150 + Math.sin(a) * dist).toFixed(1)}" rx="${s.toFixed(1)}" ry="${(s * (.6 + r() * .6)).toFixed(1)}"/>`;
    }
    let dry = "";
    for (let i = 0; i < 5; i++) dry += `<path d="${blob(r, 200 + (r() - .5) * 140, 150 + (r() - .5) * 90, 20 + r() * 30, 10, 1.2)}"/>`;
    const id = `ink-f${seed}`;
    return `<svg viewBox="0 0 400 300" aria-hidden="true"><defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="14" result="d"/><feGaussianBlur in="d" stdDeviation="9" result="b"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${seed}" result="n"/><feComposite in="b" in2="n" operator="arithmetic" k2="1" k3=".9" k4="-1.05" result="c"/><feComponentTransfer in="c" result="t"><feFuncA type="linear" slope="5"/></feComponentTransfer><feComposite in="d" in2="t" operator="in"/></filter></defs><g filter="url(#${id})"><g fill="var(--kf-ink)">${body}</g><g fill="var(--kf-surface)" opacity=".22">${dry}</g></g></svg>`;
  }
  const drawInk = (scope) => scope.querySelectorAll("[data-ink]:not([data-ink-drawn])").forEach((el) => {
    el.insertAdjacentHTML("afterbegin", ink(+el.dataset.ink || 1));
    el.setAttribute("data-ink-drawn", "");
  });
  drawInk(document);

  // ---------- Smooth scroll: the original recreates Lenis on every page change and jumps straight to the top ----------
  const mm = gsap.matchMedia();
  const ticker = (t) => lenis?.raf(t * 1000);
  const setupLenis = () => {
    lenis?.destroy();
    lenis = null;
    if (reduce) return;
    lenis = new Lenis({ duration: 1.1, lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
  };
  if (!reduce) { gsap.ticker.add(ticker); gsap.ticker.lagSmoothing(0); }
  setupLenis();

  // ---------- Pill band: starts 110 (phone 146)/16em down from the top and sticks to the top after scrolling that much ----------
  const header = document.querySelector(".h");
  const fixTop = () => {
    const max = parseFloat(getComputedStyle(header).getPropertyValue("--fix-max"));
    header.style.setProperty("--fix-p", Math.min(1, Math.max(0, scrollY / max)));
  };
  fixTop();
  addEventListener("scroll", fixTop, { passive: true });

  // ---------- Expanding panel inside the strip (pricing · booking) ----------
  // The original changes instantly with no in-between values — the white curtain turns on at length 0, the band sticks to the top with margin-top transition 0s, and the panel height goes straight to auto
  const info = document.querySelector(".h-info");
  const infoMain = info?.querySelector(".h-info__main");
  const veil = document.querySelector(".h-veil");
  const tabs = [...document.querySelectorAll(".h-info__tab")];
  const lock = (on) => { root.classList.toggle("is-modalopen", on); if (lenis) on ? lenis.stop() : lenis.start(); };
  const closeInfo = () => {
    infoMain.querySelectorAll(".h-panel").forEach((p) => { p.classList.remove("is-active"); gsap.set(p.querySelector(".h-panel__inner"), { height: 0 }); });
    tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
    gsap.set(veil, { autoAlpha: 0 });
    infoMain.classList.remove("is-active");
    info.classList.remove("is-active");
    lock(false);
  };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const panel = document.getElementById(tab.getAttribute("aria-controls"));
      const open = infoMain.classList.contains("is-active");
      if (open && panel.classList.contains("is-active")) return closeInfo();
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      infoMain.querySelectorAll(".h-panel").forEach((p) => {
        const on = p === panel;
        p.classList.toggle("is-active", on);
        gsap.set(p.querySelector(".h-panel__inner"), { height: on ? "auto" : 0 });
      });
      if (!open) {
        infoMain.classList.add("is-active");
        info.classList.add("is-active");
        gsap.set(veil, { autoAlpha: 1 });
        lock(true);
      }
    });
  });
  veil?.addEventListener("click", closeInfo);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && infoMain?.classList.contains("is-active")) closeInfo(); });

  // ---------- Pricing season tabs (Apr–Oct / Nov–Mar) — present in both the band panel and the body ----------
  const priceTabs = (scope) => scope.querySelectorAll("[data-pricetab]:not([data-bound])").forEach((box) => {
    box.setAttribute("data-bound", "");
    const btns = [...box.querySelectorAll("[data-season]")];
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", String(x === b)); });
      box.querySelectorAll("[data-season-panel]").forEach((p) => (p.hidden = p.dataset.seasonPanel !== b.dataset.season));
    }));
  });
  priceTabs(document);

  // ---------- Map switch (location ↔ day course) ----------
  const toggleMap = (scope) => scope.querySelectorAll("[data-togglemap]").forEach((box) => {
    box.querySelectorAll("[data-map]").forEach((b) => b.addEventListener("click", () => box.classList.toggle("is-oneday", b.dataset.map === "oneday")));
  });

  // ---------- Footer large text: drops from above, a brush tail follows 0.35s later ----------
  const footer = () => mm.add("(prefers-reduced-motion: no-preference)", () => {
    const foo = document.querySelectorAll(".f-visual__char");
    if (foo.length) {
      gsap.timeline({ scrollTrigger: { trigger: ".f-visual__txt", start: "top 80%", once: true } })
        .to(foo[0], { y: 0, autoAlpha: 1, duration: 1, ease: "sine.out" })
        .to(foo[1], { y: 0, autoAlpha: 1, duration: 1, ease: "sine.out" }, "<+.35");
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(".f-visual__char", { autoAlpha: 1, y: 0 }));

  // ---------- Per-page motion: each page js registers it with brand.page(name, attach), and it is re-attached every time the body (#l-main) changes ----------
  const pages = new Map();
  let unmount = null;
  const mountPage = () => {
    const main = document.getElementById("l-main");
    drawInk(main);
    priceTabs(main);
    toggleMap(main);
    const name = main.dataset.page;
    const fn = pages.get(name);
    unmount = fn ? fn(main, { reduce, first }) : null;
    document.querySelectorAll(".h-nav a").forEach((a) => {
      const here = a.getAttribute("href") === `${name}.html`;
      here ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
  };
  let first = true;
  const show = () => gsap.to(wrapper, { autoAlpha: 1, duration: reduce ? 0 : 0.5, ease: "sine.out" });
  window.brand = {
    page: (name, fn) => pages.set(name, fn),
    show,
    get lenis() { return lenis; },
  };
  addEventListener("DOMContentLoaded", () => {
    mountPage();
    footer();
    first = false;
    if (!document.querySelector(".loader")) show();
  });

  // ---------- Page transition (swup 4.9.2 + head·scroll·js plugins, same settings as the original) ----------
  // The outer frame vanishes in 0.2s sine.out, only the body is swapped in, then Lenis is recreated and appears from the top in 0.5s sine.out.
  // swup fetches the next page, so it can’t be used when opened via file:// — only then are link navigations intercepted with the same values.
  const canSwup = /^https?:$/.test(location.protocol) && window.Swup && window.SwupHeadPlugin && window.SwupScrollPlugin && window.SwupJsPlugin;
  if (canSwup) {
    const swup = new Swup({
      containers: ["#l-main"],
      plugins: [
        new SwupHeadPlugin({ persistAssets: true, awaitAssets: true }),
        new SwupScrollPlugin({ animateScroll: { betweenPages: false, samePageWithHash: true, samePage: true }, scrollFriction: 0.4, scrollAcceleration: 0.05 }),
        new SwupJsPlugin({ animations: [{ from: "(.*)", to: "(.*)", out: async () => { await gsap.to(wrapper, { duration: reduce ? 0 : 0.2, ease: "sine.out", autoAlpha: 0 }); }, in: (done) => done() }] }),
      ],
    });
    swup.hooks.on("visit:start", () => document.body.setAttribute("data-loaded", "false"));
    swup.hooks.on("content:replace", () => {
      unmount?.();
      unmount = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
      setupLenis();
      lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0);
      fixTop();
      mountPage();
      footer();
      document.body.setAttribute("data-loaded", "true");
      show();
    });
  } else {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href$='.html']");
      if (!a || e.metaKey || e.ctrlKey || a.target === "_blank" || a.closest(".wf-ui")) return;
      e.preventDefault();
      gsap.to(wrapper, { autoAlpha: 0, duration: reduce ? 0 : 0.2, ease: "sine.out", onComplete: () => (location.href = a.href) });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(wrapper, { autoAlpha: 1 }); });
  }
})();
