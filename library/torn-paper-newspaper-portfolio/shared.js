// Devices shared across the site — smooth scroll (locomotive), torn paper curtain menu, curtain page transitions, black-and-white switch, nav hiding, oval buttons, drag row.
// The curtain itself is drawn by the motion part paper-tear-curtain(_fx). Here we only decide when to cover and when to lift.
(() => {
  const html = document.documentElement;
  const body = document.body;
  const app = document.querySelector("#app");
  const nav = document.querySelector(".nav");
  const above = document.querySelector(".gl-canvas.above");
  const below = document.querySelector(".gl-canvas.below");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(min-width: 992px)");
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const fromMenu = /[?&]m=1/.test(location.search);
  const ease = {
    quadOut: "power1.out",
    out: kfFx.ease("0,0,0.58,1", "power1.out"),
    inOut: kfFx.ease("0.42,0,0.58,1", "power1.inOut"),
  };
  window.site = window.site || {};
  // Keep the GSAP tick awake — when an idle tick wakes on interaction the first frame is 2~3 frames late, so it starts 40~60ms later than the original (IX2)
  gsap.ticker.add(() => {});
  // Hover reactions are bound with mouseover and mouseout like the original IX2 — moving between inner children doesn’t call it again
  site.hover = (el, on, off) => {
    const over = (e) => { if (!el.contains(e.relatedTarget)) on(e); };
    const out = (e) => { if (!el.contains(e.relatedTarget)) off(e); };
    el.addEventListener("mouseover", over);
    el.addEventListener("mouseout", out);
    return () => { el.removeEventListener("mouseover", over); el.removeEventListener("mouseout", out); };
  };

  // One paper grain tile — three layers of value noise baked once on a 256px plate (only black-dot opacity, so only the grain remains on any background)
  {
    const N = 256, c = document.createElement("canvas");
    c.width = c.height = N;
    const g = c.getContext("2d"), img = g.createImageData(N, N);
    const grid = (k) => { const a = new Float32Array((k + 1) * (k + 1)); for (let i = 0; i < a.length; i++) a[i] = Math.random(); for (let i = 0; i <= k; i++) { a[i * (k + 1) + k] = a[i * (k + 1)]; a[k * (k + 1) + i] = a[i]; } return a; };
    const layers = [[16, 0.2], [64, 0.35], [128, 0.45]].map(([k, w]) => ({ k, w, a: grid(k) }));
    const at = ({ k, a }, x, y) => {
      const fx = (x / N) * k, fy = (y / N) * k, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
      const p = (u, v) => a[v * (k + 1) + u];
      const top = p(ix, iy) * (1 - tx) + p(ix + 1, iy) * tx, bot = p(ix, iy + 1) * (1 - tx) + p(ix + 1, iy + 1) * tx;
      return top * (1 - ty) + bot * ty;
    };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let v = 0;
      for (const l of layers) v += at(l, x, y) * l.w;
      const o = (y * N + x) * 4;
      img.data[o] = img.data[o + 1] = img.data[o + 2] = 0;
      img.data[o + 3] = Math.round((1 - v) * 80);
    }
    g.putImageData(img, 0, 0);
    html.style.setProperty("--site-paper", `url(${c.toDataURL()})`);
  }

  // Smooth scroll — like the original, locomotive unless it is a touch device, and the work list scrolls horizontally
  const container = document.querySelector("[data-scroll-container]");
  if (container && window.LocomotiveScroll && !touch && !reduce) {
    const horizontal = container.dataset.scrollDirection === "horizontal" && desktop.matches;
    site.loco = new LocomotiveScroll({
      el: container,
      smooth: true,
      direction: horizontal ? "horizontal" : "vertical",
      gestureDirection: horizontal ? "both" : "vertical",
    });
    addEventListener("load", () => site.loco.update());
    document.fonts?.ready.then(() => site.loco.update());
  }
  site.onScroll = (fn) => {
    if (site.loco) site.loco.on("scroll", (a) => fn(a.scroll.y, a.direction));
    else {
      let last = scrollY;
      addEventListener("scroll", () => { fn(scrollY, scrollY > last ? "down" : "up"); last = scrollY; }, { passive: true });
    }
  };

  // In horizontal shelf mode, the menu curtain covers from the side
  if (above && body.classList.contains("is-work") && desktop.matches) above.setAttribute("data-fx-paper-tear-curtain", "horizontal: 1");

  // Arrival — if not coming via the menu, bright paper covers upward from the bottom over a dark background for 2s (original .gl-canvas.below is flipped 180°), then the panel turns on in 1s (About · Work list)
  if (below && !fromMenu && !reduce) {
    app.classList.add("is-veiled");
    below.setAttribute("data-fx-paper-tear-curtain", "invert: 1; cover: --kf-bg; bg: --kf-contrast-bg; bg-alpha: 1; horizontal: 0");
    below.addEventListener("fx:done", () => app.classList.add("appear"), { once: true });
    // The original starts the curtain after fetching the curtain module (ogl) — the copy starts after the font arrives (1.5s at most) so the gap between the first paint and the curtain stays the same
    const fontsIn = Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);
    addEventListener("DOMContentLoaded", () => fontsIn.then(() => requestAnimationFrame(() => below.dispatchEvent(new CustomEvent("fx:in")))), { once: true });
  } else if (below) {
    below.remove();
  }

  // First page — scroll stops while the panel spins in (original 5s)
  // In the original (Webflow IX2), the rise (expo.inOut) starts about .3s after the first paint. The plate size, angle and y are re-tuned per frame (the middle of the rise lands 1.3s after the first paint)
  // The copy attaches the rotating part .3s after DOMContentLoaded (waiting for load would delay several seconds until all Korean font chunks arrive)
  if (app?.hasAttribute("data-spin")) {
    const spin = () => setTimeout(() => app.setAttribute("data-fx", "spin-in-page"), 300);
    if (document.readyState !== "loading") spin();
    else addEventListener("DOMContentLoaded", spin, { once: true });
    app.addEventListener("fx:done", () => html.classList.remove("is-spinning"), { once: true });
    if (desktop.matches && !reduce) {
      site.loco?.stop();
      scrollTo(0, 0);
      app.addEventListener("fx:done", () => { site.loco?.update(); site.loco?.start(); }, { once: true });
    }
  }

  // Menu — a dark paper curtain covers and three lines of large text rise in turn (IX2 Menu Open·Close values)
  const menu = document.querySelector(".menu");
  const navLink = document.querySelector(".nav-link");
  const lines = navLink?.querySelectorAll(".nav-line");
  const titles = [...document.querySelectorAll(".menu-title")];
  const actives = document.querySelectorAll(".menu-link.is-current .m-active");
  const socials = document.querySelector(".f-block.li");
  const side = document.querySelector(".menu-side");
  const dark = nav?.querySelector(".nav-head .dark");
  const light = nav?.querySelector(".nav-head .light");
  let open = false;
  let moving = false;
  let menuTl;
  gsap.set(titles, { yPercent: 100 });
  gsap.set(side, { xPercent: -100 });
  const send = (name, detail) => above?.dispatchEvent(new CustomEvent(name, { detail }));

  function openMenu() {
    open = true;
    nav.classList.add("is-open");
    menu.style.display = "flex";
    send("fx:in", { invert: false });
    menuTl?.kill();
    menuTl = gsap.timeline();
    menuTl.set(titles, { yPercent: 100 }).set(actives, { scaleX: 0 }).set(side, { xPercent: -100 });
    menuTl.to(side, { xPercent: 101, duration: 1.6, ease: "expo.inOut" }, 0);
    // Like the first batch of original IX2, write the dark logo’s initial value (1) once on open and clear it at .3s
    menuTl.fromTo(dark, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: ease.out }, 0);
    menuTl.to(light, { opacity: 1, duration: 0.3, ease: ease.out }, 0.4);
    if (lines?.length === 2) {
      menuTl.to(lines[0], { rotation: -45, duration: 0.5, ease: ease.out }, 0);
      menuTl.to(lines[1], { rotation: 45, y: "-0.3rem", duration: 0.5, ease: ease.out }, 0);
    }
    titles.forEach((t, i) => menuTl.to(t, { yPercent: 0, duration: 1 + i * 0.1, ease: "expo.out" }, 1 + i * 0.05));
    // The social row’s starting position (2vh below, transparent) is used when the motion starts — the original (IX2) does the same
    menuTl.fromTo(socials, { y: "2vh", opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: ease.out, immediateRender: false }, 1.1);
    menuTl.to(actives, { scaleX: 1, duration: 0.9, ease: "expo.inOut" }, 1.1);
  }

  function closeMenu() {
    open = false;
    send("fx:out", { invert: false });
    menuTl?.kill();
    menuTl = gsap.timeline({ onComplete: () => nav.classList.remove("is-open") });
    if (lines?.length === 2) menuTl.to(lines, { rotation: 0, y: 0, duration: 0.5, ease: ease.out }, 0);
    menuTl.to(actives, { scaleX: 0, duration: 0.8, ease: "expo.inOut" }, 0);
    menuTl.to(side, { xPercent: -100, duration: 1.6, ease: "expo.inOut" }, 0);
    menuTl.to(titles, { yPercent: 100, duration: 0.75, ease: "expo.out" }, 0.2);
    menuTl.to(socials, { y: "3vh", opacity: 0, duration: 0.5, ease: ease.out }, 0.2);
    menuTl.to(dark, { opacity: 1, duration: 0.3, ease: ease.out }, 1.4);
    menuTl.to(light, { opacity: 0, duration: 0.3, ease: ease.out }, 1.4);
    setTimeout(() => { if (!open) menu.style.display = "none"; }, 400);
  }

  navLink?.addEventListener("click", () => {
    if (moving) return;
    open ? closeMenu() : openMenu();
  });
  // Two lines spread apart staggered by 0.2vw each — the original applied this hover on the first page only
  if (navLink && lines?.length === 2 && body.classList.contains("is-index")) site.hover(navLink, () => {
    gsap.to(lines[0], { x: "0.2vw", duration: 0.5, ease: "expo.out" });
    gsap.to(lines[1], { x: "-0.2vw", duration: 0.5, ease: "expo.out" });
  }, () => gsap.to(lines, { x: 0, duration: 0.5, ease: "expo.out" }));

  // Page transition — when the menu is closed, a flipped veil covers from below (with that pattern if at a photo spot), and when open, the veil lifts to reveal the new background
  const go = (href) => { location.href = href; };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(\?[^#]*)?(#.*)?$/.test(href) || a.hasAttribute("data-no-curtain")) return;
    e.preventDefault();
    if (moving || !above) return;
    moving = true;
    setTimeout(() => { moving = false; }, 1500);
    const cover = a.dataset.color || "--kf-contrast-bg";
    if (open) {
      gsap.to(nav.querySelectorAll(".nav-head, .nav-block, .menu-line, .menu"), { opacity: 0, duration: 0.6, ease: "expo.out" });
      send("fx:out", { cover: "--kf-contrast-bg", bg: cover, bgAlpha: 1 });
    } else {
      above.classList.add("is-front");
      send("fx:in", { cover: a.hasAttribute("data-image") ? "--kf-raised" : cover, invert: true, placeholder: a.hasAttribute("data-image"), horizontal: false, bgAlpha: 0 });
    }
    let left = false;
    const leave = () => { if (!left) { left = true; go(href); } };
    above.addEventListener("fx:done", leave, { once: true });
    setTimeout(leave, reduce ? 0 : 2500);
  });

  // Black and white — tapping the location text turns photos and stamps B&W in .3s, tapping again restores them
  document.querySelectorAll("[data-mono-toggle]").forEach((b) => b.addEventListener("click", () => html.classList.toggle("is-mono")));

  // Nav hide — moving the nav plate itself would drag along the fixed backdrop and menu inside it, so only the header line (.nav-inner, .menu-line) is lifted via CSS.
  // Phone (under 479px): hides in .3s when scrolling down and comes back in .4s when scrolling up (outQuad)
  site.navShown = (show, dur) => {
    body.style.setProperty("--nav-dur", `${reduce ? 0 : dur}s`);
    body.classList.toggle("nav-hidden", !show);
  };
  if (nav && !reduce) {
    site.onScroll((y, dir) => {
      if (open || innerWidth > 479) return;
      const hide = dir === "down" && y > 40;
      site.navShown(!hide, hide ? 0.3 : 0.4);
    });
  }

  // Oval button — the text slides out to the right and an arrow comes into its place
  document.querySelectorAll(".cta-h").forEach((c) => {
    const text = c.querySelector(".cta-text");
    const arrow = c.querySelector(".arrow");
    const shift = +(c.dataset.arrow || 26);
    site.hover(c, () => {
      if (!desktop.matches) return;
      gsap.to(text, { x: "30vw", duration: 0.6, ease: "expo.inOut", overwrite: true });
      gsap.to(arrow, { x: `${shift}vw`, duration: 0.7, ease: "expo.inOut", overwrite: true });
    }, () => {
      gsap.to(text, { x: 0, duration: 0.8, ease: "expo.inOut", overwrite: true });
      gsap.to(arrow, { x: 0, duration: 0.7, ease: "expo.inOut", overwrite: true });
    });
  });

  // Work card — on hover the photo zooms in to 1.1x over 1s
  document.querySelectorAll(".item").forEach((it) => {
    const img = it.querySelector(".item-img");
    if (!img) return;
    site.hover(it, () => desktop.matches && gsap.to(img, { scale: 1.1, duration: 1, ease: "expo.out" }), () => gsap.to(img, { scale: 1, duration: 1, ease: "expo.out" }));
  });

  // Black-box giant title — the fallback font is wider than the original, so only the font size shrinks to fit the box width (the box stays fully filled)
  // Neighboring cells (flex) widen again by the amount shrunk, so measure several times until the overflow is gone
  const fit = () => document.querySelectorAll("[data-fit]").forEach((el) => {
    el.style.fontSize = "";
    for (let i = 0; i < 5; i++) {
      const cs = getComputedStyle(el);
      const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const room = el.clientWidth - pad;
      const need = el.scrollWidth - pad;
      if (need <= room + 1 || room <= 0) break;
      el.style.fontSize = `${parseFloat(cs.fontSize) * (room / need) * 0.99}px`;
    }
  });
  fit();
  document.fonts?.ready.then(() => { fit(); site.loco?.update(); });
  addEventListener("resize", fit);

  // Drag row — the same butter-slider as the original (smoothAmount .15 · dragSpeed 2.5). Like the original, the page’s first row is pushed 62% of the screen width (left as is if too short to push that far)
  if (window.butterSlider && desktop.matches) {
    site.sliders = butterSlider.autoInit();
    const first = site.sliders[0];
    if (first) {
      first.smoothAmount = 1;
      first.setRelativePosition(innerWidth * (0.62 / first.dragSpeed));
      first.smoothAmount = 0.15;
    }
  }

  // Div-based button (original form) — also pressable by keyboard
  document.addEventListener("keydown", (e) => {
    const b = e.target.closest?.('[role="button"]');
    if (!b || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    b.click();
  });
})();
