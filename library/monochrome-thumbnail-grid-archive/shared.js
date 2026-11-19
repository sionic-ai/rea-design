// Spanning several pages — text loader, split menu, a transition curtain that spreads and covers with noise (three r155 shader + barba 2.10.3), lenis 1.3.9 re-attached per page (wrapper = barba version)
(() => {
  const FF = (window.FF = { pages: {}, api: null, lenis: null, loaded: false });
  const reduce = (FF.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches);
  // The original decides wide panel (WebGL, clip menu) vs narrow panel by the width at first open, and reopens when crossing 767px
  FF.wide = innerWidth > 767;
  const touch = "ontouchstart" in document.documentElement;
  gsap.registerPlugin(ScrollTrigger, Flip);

  FF.leaf =
    '<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="currentColor" d="M5.2 32.8C3.6 19 14 6.6 33.2 5.2Z"/><path fill="currentColor" d="M6.8 34.8C21 36.4 33.4 26 34.8 6.8Z"/><path d="M6 34 2 38" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  document.querySelectorAll("[data-leaf]").forEach((el) => (el.innerHTML = FF.leaf));

  // Resolve skin variables to actual color strings — canvas and shaders can’t read color-mix, so paint once to try
  FF.color = (name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `display:none;color:var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };
  FF.rgb = (name) => {
    const ctx = FF._px || (FF._px = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true }));
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = FF.color(name);
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── Letter loader: letters turn on .05s apart over 1s (after .3s) + leaf settles → turns off in the same order → 1s after they start turning off, the curtain lifts over 1.4s
  const loader = () => {
    const box = document.querySelector(".ff-loading");
    if (!box) return void (FF.loaded = true);
    if (reduce) { box.remove(); FF.loaded = true; return; }
    gsap.timeline({ onComplete: () => (FF.loaded = true) })
      .to("[data-load-first]", { opacity: 1, ease: "power3.out", duration: 1, delay: 0.3, stagger: 0.05 })
      .to(".ff-loading__icon", { opacity: 1, x: 0, y: 0, rotate: 0, duration: 1, ease: "power4.out" }, "<")
      .to("[data-load-first]", { opacity: 0, ease: "power3.out", duration: 1, stagger: 0.05 })
      .to(".ff-loading__icon", { opacity: 0, x: -10, y: 10, rotate: 10, duration: 1, ease: "power4.out" }, "<")
      .to(".ff-loading", { opacity: 0, pointerEvents: "none", ease: "power3.out", duration: 1.4 }, "<1");
  };

  // ── Split menu: the two lines are erased in .75s staggered by .1s starting from the last line, then redrawn as an X (±40°), and the panel opens with a clip in 1.4s power4.inOut
  const menu = () => {
    const btn = document.querySelector(".ff-menu-btn");
    if (!btn) return;
    const lines = ".ff-menu-btn__line";
    let open = false, busy = false;
    const redraw = (a, b) => gsap.timeline({ onComplete: () => (busy = false) })
      .to(lines, { clipPath: "inset(0% 100% 0% 0%)", duration: 0.75, ease: "power4.out", stagger: { from: "end", each: 0.1 } })
      .set(`${lines}:nth-of-type(1)`, a)
      .set(`${lines}:nth-of-type(2)`, b, "<")
      .to(lines, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power4.out", stagger: { from: "end", each: 0.1 } }, "<0.01");
    const panels = (show) => {
      if (!FF.wide) return;
      gsap.to(".ff-menu__inner", { clipPath: show ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut" });
      gsap.to(".ff-menu__image", { clipPath: show ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", duration: 1.4, ease: "power4.inOut" });
    };
    const close = () => {
      gsap.to(".ff-menu", { opacity: FF.wide ? 1 : 0, pointerEvents: "none", duration: 0.6 });
      panels(false);
      redraw({ top: "8px", rotate: "0deg" }, { top: "12px", rotate: "0deg" });
      btn.setAttribute("aria-expanded", "false");
    };
    btn.addEventListener("click", () => {
      if (busy) return;
      open = !open;
      busy = true;
      if (open) {
        gsap.to(".ff-menu", { opacity: 1, pointerEvents: "auto", duration: 0.6 });
        panels(true);
        redraw({ top: "10px", rotate: "40deg" }, { top: "10px", rotate: "-40deg" });
        btn.setAttribute("aria-expanded", "true");
      } else close();
    });
    document.querySelectorAll(".ff-menu a").forEach((a) => a.addEventListener("click", () => {
      if (!open) return;
      open = false;
      close();
    }));
  };

  let currentLink = null;
  const current = (ns) => {
    currentLink?.classList.remove("is-current");
    currentLink = document.querySelector(`.ff-menu [data-current="${ns}"]`);
    currentLink?.classList.add("is-current");
  };

  // ── Noise transition curtain: one full-screen panel, where light gray spreads from the spots where value noise (×4) passes a soft threshold at edge .38 ──
  const veil = (() => {
    const host = document.querySelector(".ff-webgl");
    if (!host || !window.THREE || reduce) return null;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth, innerHeight);
    host.prepend(renderer.domElement);
    const scene = new THREE.Scene(), camera = new THREE.Camera();
    const u = { uProgress: { value: 1.3 }, uScale: { value: 4 }, uEdge: { value: 0.38 }, uColor: { value: new THREE.Vector3(...FF.rgb("--site-veil")) } };
    const mat = new THREE.ShaderMaterial({
      uniforms: u,
      transparent: true,
      depthTest: false,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        uniform float uProgress, uScale, uEdge; uniform vec3 uColor; varying vec2 vUv;
        float cell(vec2 c){ return fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5453123); }
        float field(vec2 p){
          vec2 i = floor(p), f = fract(p), w = f * f * (3.0 - 2.0 * f);
          return mix(mix(cell(i), cell(i + vec2(1.0, 0.0)), w.x), mix(cell(i + vec2(0.0, 1.0)), cell(i + vec2(1.0, 1.0)), w.x), w.y);
        }
        void main(){
          float n = field(vUv * uScale), mid = 1.0 - uProgress;
          gl_FragColor = vec4(uColor, 1.0 - smoothstep(mid - uEdge, mid + uEdge, n));
        }`,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    mesh.frustumCulled = false;
    scene.add(mesh);
    renderer.compile(scene, camera);
    const draw = () => renderer.render(scene, camera);
    draw();
    addEventListener("resize", () => { renderer.setSize(innerWidth, innerHeight); draw(); });
    const text = host.querySelector(".ff-veil-text");
    return {
      cover() {
        gsap.to(u.uProgress, { value: -1, duration: 1.5, onUpdate: draw, overwrite: true });
        gsap.set(host, { pointerEvents: "auto" });
        if (text) gsap.to(text, { opacity: 1, duration: 1, delay: 0.3, overwrite: true });
      },
      reveal() {
        gsap.to(u.uProgress, { value: 1.3, duration: 1.8, onUpdate: draw, overwrite: true });
        gsap.set(host, { pointerEvents: "none" });
        if (text) gsap.to(text, { opacity: 0, duration: 1, overwrite: true });
      },
    };
  })();
  FF.veil = veil;

  const smooth = (container) => {
    FF.lenis?.destroy();
    FF.lenis = null;
    if (reduce || !window.Lenis) return void container.addEventListener("scroll", ScrollTrigger.update, { passive: true });
    FF.lenis = new Lenis({ autoRaf: true, wrapper: container, content: container.querySelector(".main"), duration: 1.1, wheelMultiplier: 0.6 });
    FF.lenis.on("scroll", ScrollTrigger.update);
  };
  FF.toTop = (container, done) => {
    if (FF.lenis) FF.lenis.scrollTo(0, { duration: 0.001, onComplete: done, force: true });
    else { container.scrollTop = 0; done?.(); }
  };

  const mount = (container) => { FF.api = FF.pages[container.dataset.barbaNamespace]?.(container) || null; };
  const unmount = () => {
    try { FF.api?.destroy?.(); } catch (e) {}
    FF.api = null;
    ScrollTrigger.getAll().forEach((t) => t.kill());
  };

  // Pulls the next page’s css·js into the current document (the original shares one set of css·js across all pages, so this wasn’t needed there)
  const abs = (h) => new URL(h, location.href).href;
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    document.title = doc.title;
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    await Promise.all(want.filter((h) => !have.includes(h)).map((href) => new Promise((r) => {
      document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r }));
    })));
    const loaded = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (loaded.includes(src)) continue;
      await new Promise((r) => document.body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
    return () => [...document.querySelectorAll('link[rel="stylesheet"]')].forEach((l) => want.includes(l.href) || l.remove());
  };
  const inside = (a) => {
    const raw = a?.getAttribute("href") || "";
    if (!a || a.target === "_blank" || !raw || raw.startsWith("#") || /^(mailto|tel):/.test(raw)) return false;
    try { return new URL(a.href, location.href).origin === location.origin; } catch (e) { return false; }
  };

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    if (!first) return;
    smooth(first);
    loader();
    menu();
    current(first.dataset.barbaNamespace);
    if (!touch) matchMedia("(max-width: 767px)").addEventListener("change", () => location.reload());
    mount(first);
    if (!window.barba || !/^https?:$/.test(location.protocol)) {
      // When opened as a file — barba can’t run, so only cover with the curtain and move on
      document.addEventListener("click", async (e) => {
        const a = e.target.closest("a");
        if (!inside(a) || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        veil?.cover();
        await wait(veil ? 1500 : 0);
        location.href = a.href;
      });
      return;
    }
    let dropOld = null;
    barba.init({
      timeout: 7000,
      preventRunning: true,
      prevent: ({ el }) => !inside(el),
      transitions: [{
        name: "veil",
        sync: false,
        async leave() {
          veil?.cover();
          await wait(veil ? 1500 : 0);
        },
        afterLeave() { unmount(); },
        async beforeEnter({ next }) { dropOld = await bring(next.html); },
        enter({ next }) {
          dropOld?.();
          smooth(next.container);
          FF.lenis?.stop();
          veil?.reveal();
          FF.lenis?.start();
          setTimeout(() => current(next.namespace), 450);
        },
        afterEnter({ next }) { mount(next.container); },
      }],
    });
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
