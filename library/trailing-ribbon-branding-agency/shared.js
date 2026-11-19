/* Spanning pages — lenis (lerp .1 · wheel .9, scrolls the .od-wrapper panel), barba (curtain covers .4s and lifts over 1.8s), 
   Header color (data-header-color per section), drawer, diagonal mask reveal (bottom 88%), photo parallax, Work card haze, placeholder video (canvas). */
(() => {
  const OD = (window.OD = window.OD || {});
  OD.pages = OD.pages || {};
  OD.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  OD.mobile = () => innerWidth < 768;
  const html = document.documentElement;
  gsap.registerPlugin(ScrollTrigger);

  /* Skin variables to the colors the canvas uses */
  const probe = document.createElement("i");
  probe.style.display = "none";
  OD.color = (name) => {
    if (!probe.isConnected) document.body.append(probe);
    probe.style.color = `var(${name})`;
    return getComputedStyle(probe).color;
  };
  OD.rgb = (name) => (OD.color(name).match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);

  /* Placeholder video — same spot and same playback as the original video (forest, light bloom), looping while visible, as a canvas where skin-colored blobs flow */
  OD.fakeVideo = (canvas, seed = 1) => {
    const g = canvas.getContext("2d");
    const W = 480, H = 300;
    canvas.width = W; canvas.height = H;
    const cols = ["--kf-ink", "--site-video-light", "--kf-bg", "--site-video-base", "--kf-ink-soft"].map(OD.color);
    const blobs = Array.from({ length: 9 }, (_, i) => {
      const r = (k) => { const s = Math.sin(seed * 12.9898 + i * 78.233 + k * 3.1) * 43758.5453; return s - Math.floor(s); };
      return { x: r(1), y: r(2), r: 0.18 + r(3) * 0.35, vx: (r(4) - 0.5) * 0.05, vy: (r(5) - 0.5) * 0.04, c: cols[i % cols.length], a: 0.35 + r(6) * 0.4 };
    });
    let raf = 0, last = 0, t = 0, playing = false;
    const draw = () => {
      g.fillStyle = cols[3]; g.fillRect(0, 0, W, H);
      g.globalCompositeOperation = "lighter";
      blobs.forEach((b) => {
        /* Like real footage (hazy forest scene), little change between frames — flows slowly */
        const x = (b.x + Math.sin(t * 0.3 + b.y * 6) * 0.08 + b.vx * 0.5 * t) % 1.4 - 0.2, y = (b.y + Math.cos(t * 0.25 + b.x * 5) * 0.08 + b.vy * 0.5 * t) % 1.4 - 0.2;
        const gr = g.createRadialGradient(x * W, y * H, 0, x * W, y * H, b.r * W);
        gr.addColorStop(0, b.c); gr.addColorStop(1, "transparent");
        g.globalAlpha = b.a; g.fillStyle = gr; g.fillRect(0, 0, W, H);
      });
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      t += Math.min(0.1, (now - (last || now)) / 1000); last = now;
      draw();
      canvas.dispatchEvent(new Event("frame"));
    };
    draw();
    return {
      canvas,
      play() { if (playing || OD.reduce) return; playing = true; last = 0; raf = requestAnimationFrame(loop); },
      pause() { playing = false; cancelAnimationFrame(raf); },
      destroy() { this.pause(); },
    };
  };

  /* Fog — pre-bake value noise (8 layers of distortion · 4 layers of density) on a 180×120 grid, and on hover the background color passes through as a diagonal band for 1.7s */
  let fogField = null;
  const fogFieldOf = () => {
    if (fogField) return fogField;
    const W = 180, H = 120;
    const hash = (x, y) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
    const sm = (e) => e * e * (3 - 2 * e);
    const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = sm(x - xi), v = sm(y - yi); const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); const p = a + (b - a) * u; return p + (c + (d - c) * u - p) * v; };
    const fbm = (x, y, o) => { let s = 0, amp = 0.5, f = 1, n = 0; for (let i = 0; i < o; i++) { s += vn(x * f, y * f) * amp; n += amp; amp *= 0.5; f *= 2; } return s / n; };
    const bake = (off, sc, oct) => { const a = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) a[y * W + x] = fbm((x / W) * sc * 1.5 + off, (y / H) * sc + off, oct); return a; };
    return (fogField = { W, H, warp: bake(0, 1, 8), density: bake(91, 2, 4) });
  };
  const fogCard = (card) => {
    const cv = card.querySelector(".fog");
    if (!cv) return null;
    const { W, H } = fogFieldOf();
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const half = 1, warpK = 1, base = 0.54, range = 0.45, mid = half + warpK / 2;
    let raf = 0, start = 0, img = null;
    const frame = (now) => {
      const p = (now - start) / 1700;
      if (p >= 1) { g.clearRect(0, 0, W, H); raf = 0; return; }
      const { warp, density } = fogFieldOf(), d = img.data;
      const e = 1 - (1 - p) * (1 - p), c = -mid + e * (1 + mid * 2);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, l = (x / W + (1 - y / H)) / 2 + (warp[i] - 0.5) * warpK, u = Math.abs(l - c) / half;
        d[i * 4 + 3] = (u >= 1 ? 0 : (1 - u * u * (3 - 2 * u)) * (base + range * density[i])) * 255;
      }
      g.putImageData(img, 0, 0);
      raf = requestAnimationFrame(frame);
    };
    const on = () => {
      if (OD.reduce) return;
      if (!img) { img = g.createImageData(W, H); const [r, gg, b] = OD.rgb("--kf-bg"); for (let i = 0; i < W * H; i++) { img.data[i * 4] = r; img.data[i * 4 + 1] = gg; img.data[i * 4 + 2] = b; } }
      start = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    card.addEventListener("mouseenter", on);
    return () => { card.removeEventListener("mouseenter", on); cancelAnimationFrame(raf); };
  };

  /* Re-applied on every page */
  let lenis = null, offs = [];
  const later = (fn) => offs.push(fn);
  const startScroll = (content) => {
    const wrapper = document.querySelector(".od-wrapper");
    ScrollTrigger.defaults({ scroller: wrapper });
    if (typeof Lenis !== "undefined" && !OD.reduce) {
      lenis = new Lenis({ wrapper, content, lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.9 });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
      later(() => { gsap.ticker.remove(raf); lenis.destroy(); lenis = null; });
    }
    OD.lenis = lenis;
    OD.scroller = wrapper;
  };
  const onAnchor = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const t = a.getAttribute("href");
    if (t.length < 2) return;
    const el = document.querySelector(t);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.2 }); else el.scrollIntoView();
    setMenu(false);
  };
  document.addEventListener("click", onAnchor);

  /* Headline */
  const header = document.querySelector(".od-header");
  const setMenu = (open) => {
    if (!header) return;
    header.dataset.menu = open ? "open" : "closed";
    const b = header.querySelector(".od-menu-btn");
    b?.setAttribute("aria-expanded", String(open));
    const m = header.querySelector(".od-menu");
    if (m) m.inert = !open;
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  header?.querySelector(".od-menu-btn")?.addEventListener("click", () => setMenu(header.dataset.menu !== "open"));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && header?.dataset.menu === "open") setMenu(false); });
  const headerColors = (root, ns) => {
    const sts = [];
    const pick = () => { const a = sts.find((s) => s.isActive); header.dataset.color = a ? a.trigger.dataset.headerColor : "green"; };
    root.querySelectorAll("[data-header-color]").forEach((el) => sts.push(ScrollTrigger.create({ trigger: el, start: "top top+=40", end: "bottom top+=40", onToggle: pick })));
    pick();
    header.style.transition = "none";
    header.dataset.visible = ns === "home" ? "false" : "true";
    header.offsetHeight; header.style.removeProperty("transition");
    const phil = ns === "home" && root.querySelector("#philosophy");
    if (phil) sts.push(ScrollTrigger.create({ trigger: phil, start: "top 80%", onEnter: () => (header.dataset.visible = "true"), onLeaveBack: () => (header.dataset.visible = "false") }));
    document.querySelectorAll(".od-header [data-ns], .od-footer [data-ns]").forEach((a) => (a.dataset.ns === ns ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    later(() => sts.forEach((s) => s.kill()));
  };

  const common = (root, ns) => {
    headerColors(root, ns);
    /* Diagonal mask — if data-mask-out has a value, it runs when that element reaches 88% down the screen */
    root.querySelectorAll("[data-mask-out]").forEach((el) => {
      const sel = el.dataset.maskOut;
      if (OD.reduce) { el.dataset.maskOutVisible = "true"; return; }
      const st = ScrollTrigger.create({ trigger: (sel && root.querySelector(sel)) || el, start: "top 88%", once: true, onEnter: () => (el.dataset.maskOutVisible = "true") });
      later(() => st.kill());
    });
    /* Parallax — intensity n (default 10): inner goes yPercent -n → n, scale 1+2n/100, --parallax-filter 1 → 0 */
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      root.querySelectorAll("[data-parallax]").forEach((el) => {
        const inner = el.firstElementChild;
        if (!inner) return;
        const n = parseFloat(el.dataset.parallax) > 0 ? parseFloat(el.dataset.parallax) : 10;
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "clamp(bottom top)", scrub: true } });
        tl.fromTo(inner, { yPercent: -n, scale: 1 + (n * 2) / 100 }, { yPercent: n, ease: "none" }, 0);
        tl.fromTo(el, { "--parallax-filter": 1 }, { "--parallax-filter": 0, ease: "none" }, 0);
      });
    });
    later(() => mm.revert());
    root.querySelectorAll(".od-card").forEach((c) => { const off = fogCard(c); if (off) later(off); });
    /* Placeholder video — plays only when visible (the footer starts 300px ahead from below) */
    root.querySelectorAll("canvas.od-video").forEach((cv, i) => {
      const v = OD.fakeVideo(cv, i + 3);
      const st = ScrollTrigger.create({ trigger: cv.parentElement, start: cv.closest(".od-footer") ? "top bottom+=300" : "top bottom", end: "bottom top", onToggle: ({ isActive }) => (isActive ? v.play() : v.pause()) });
      later(() => { st.kill(); v.destroy(); });
    });
    root.querySelectorAll("[data-copy]").forEach((b) => {
      let t = 0;
      const on = async () => { try { await navigator.clipboard.writeText(b.dataset.copy); } catch (e) { return; } b.dataset.copied = "true"; clearTimeout(t); t = setTimeout(() => (b.dataset.copied = "false"), 2000); };
      b.addEventListener("click", on);
    });
    /* Contact — only alerts on empty fields and does not send (placeholder) */
    const form = root.querySelector(".od-form");
    if (form) {
      const check = (el) => { const msg = el.required && !el.value.trim() ? el.dataset.errorRequired || "" : el.validity.typeMismatch ? el.dataset.errorFormat || "" : ""; el.setAttribute("aria-invalid", String(!!msg)); const o = root.querySelector(`#${el.id}-error`); if (o) o.textContent = msg; return !msg; };
      const fields = [...form.querySelectorAll("input, textarea")];
      fields.forEach((el) => el.addEventListener("input", () => el.getAttribute("aria-invalid") === "true" && check(el)));
      form.addEventListener("submit", (e) => { e.preventDefault(); const bad = fields.filter((el) => !check(el)); if (bad.length) { bad[0].focus(); return; } form.querySelector(".od-status").textContent = "Post-submission notice text goes here."; });
    }
  };

  const enter = (container, first) => {
    const ns = container.dataset.barbaNamespace;
    startScroll(container);
    common(container, ns);
    OD.current = OD.pages[ns];
    OD.current?.init?.(container, { first });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  const leave = () => {
    OD.current?.destroy?.();
    offs.splice(0).reverse().forEach((f) => f());
    ScrollTrigger.getAll().forEach((s) => s.kill());
  };

  const boot = () => {
    const container = document.querySelector('[data-barba="container"]');
    enter(container, true);
    if (typeof barba === "undefined") return;
    const veil = document.querySelector(".od-transition");
    barba.init({
      timeout: 7000,
      preventRunning: true,
      prevent: ({ el }) => !el || el.target === "_blank" || el.hasAttribute("data-barba-prevent") || (el.getAttribute("href") || "").startsWith("#"),
      transitions: [{
        name: "od-veil",
        async leave({ next }) {
          setMenu(false);
          /* As in the original, the header row switches to the next page’s state as soon as the transition starts — on the first page it hides right away with white text */
          /* On leave the next page hasn’t been fetched yet so namespace is empty — decide by URL instead */
          const path = next?.url?.path || "";
          if (header && path) {
            const home = /(^|\/)(index\.html)?$/.test(path);
            header.style.transition = "none";
            header.dataset.visible = home ? "false" : "true";
            header.dataset.color = home ? "white" : "green";
            header.offsetHeight; header.style.removeProperty("transition");
          }
          html.classList.add("is-wait");
          if (!OD.reduce) await gsap.to(veil, { opacity: 1, duration: 0.4, ease: "power3.out" });
        },
        afterLeave() { leave(); },
        enter({ next }) {
          document.querySelector(".od-wrapper").scrollTop = 0;
          enter(next.container, false);
          html.classList.remove("is-wait");
          if (!OD.reduce) gsap.fromTo(veil, { opacity: 1 }, { opacity: 0, duration: 1.8, ease: "power3.out" });
        },
      }],
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
