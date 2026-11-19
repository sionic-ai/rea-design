// About fan cards (Brand first visit) — five cards sit in a fan at the lower screen (center x .5·y .19, sides .66/.34·.27, .78/.22·.39, tilt 0·∓18°·∓23°)
// fx:fan { reveal: i } Each time, that card rises from .12 below, .88 scale, transparent, over .527s with power3.out, and fx:fan { exit: true } if so, staggered in turn (.04 + .11i)/1.1s with .255s power2.in
// Slides up .1 while fading out, and the whole board blurs 8px after .164s over .655s power2.inOut. Camera FOV 30° · distance 4.25, card height is .19 × size of the visible height at that depth.
(() => {
  const DESK = [[0.78, 0.39, 0.34, -23, 0.8], [0.66, 0.27, 0.16, -18, 0.84], [0.5, 0.19, 0, 0, 0.9], [0.34, 0.27, 0.16, 19, 0.84], [0.22, 0.39, 0.34, 23, 0.8]];
  const MOB = [[0.78, 0.56, 0.28, -23, 0.72], [0.68, 0.37, 0.14, -18, 0.76], [0.5, 0.18, 0, 0, 0.82], [0.32, 0.37, 0.14, 19, 0.76], [0.22, 0.56, 0.28, 23, 0.72]];
  const cssVar = (el, n, fb) => getComputedStyle(el).getPropertyValue(n).trim() || fb;
  kfFx.register("fan-cards-gl", (el, { options, reduce }) => {
    const T = window.THREE;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')].slice(0, 5);
    if (!T || !items.length) return;
    let canvas = el.querySelector('canvas[data-fx-part="canvas"]');
    const madeCanvas = !canvas;
    if (!canvas) { canvas = document.createElement("canvas"); canvas.setAttribute("data-fx-part", "canvas"); el.prepend(canvas); }
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return; }
    renderer.setClearColor(0, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 0, 4.25);
    const fam = cssVar(el, "--kf-font-sans", "sans-serif");
    const cards = items.map((it) => {
      const ratio = +it.getAttribute("data-ratio") || 0.75;
      const cv = document.createElement("canvas");
      cv.width = 300; cv.height = Math.round(300 / ratio);
      const g = cv.getContext("2d");
      const tone = it.getAttribute("data-tone"), dark = tone === "dark", mid = tone === "mid";
      g.fillStyle = cssVar(el, dark ? "--kf-contrast-bg" : mid ? "--kf-dim" : "--kf-raised", "transparent");
      g.fillRect(0, 0, cv.width, cv.height);
      g.fillStyle = cssVar(el, dark || mid ? "--kf-contrast-ink" : "--kf-dim", "transparent");
      g.font = `400 14px ${fam}`; g.textAlign = "center"; g.textBaseline = "middle";
      (it.getAttribute("data-label") || "").split(" · ").forEach((s, i, a) => g.fillText(s, cv.width / 2, cv.height / 2 + (i - (a.length - 1) / 2) * 20, cv.width * 0.8));
      const tex = new T.CanvasTexture(cv);
      const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 });
      const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat);
      scene.add(mesh);
      return { mesh, ratio, tex };
    });
    const place = () => {
      const W = el.clientWidth || innerWidth, H = el.clientHeight || innerHeight, small = W <= 767;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      cards.forEach((c, i) => {
        const [fx, fy, z, r, s] = (small ? MOB : DESK)[i];
        const turn = (Math.abs(r) * Math.PI) / 180, u = c.ratio * Math.cos(turn) + Math.sin(turn);
        const hr = small ? Math.min(0.19 * s, ((W / H) * 0.26) / u) : 0.19 * s;
        const g = 2 * Math.tan((15 * Math.PI) / 180) * (4.25 - z);
        const x = (fx - 0.5) * g * (W / H) * 0.98, y = (0.5 - fy) * g * 0.98, h = g * hr;
        c.mesh.geometry.dispose();
        c.mesh.geometry = new T.PlaneGeometry(h * c.ratio, h);
        c.mesh.rotation.z = (r * Math.PI) / 180;
        c.target = y;
        if (!c.shown) { c.mesh.position.set(x, y - 0.12, z - 0.12); c.mesh.scale.setScalar(0.88); }
        else c.mesh.position.set(x, y, z);
      });
    };
    place();
    const tls = [];
    const ac = new AbortController();
    el.addEventListener("fx:fan", (e) => {
      const d = e.detail || {};
      if (d.reveal != null) {
        const c = cards[d.reveal];
        if (!c) return;
        c.shown = true;
        const dur = reduce ? 0 : 0.5272727;
        tls.push(gsap.to(c.mesh.material, { opacity: 1, duration: dur, ease: "power3.out" }), gsap.to(c.mesh.scale, { x: 1, y: 1, z: 1, duration: dur, ease: "power3.out" }), gsap.to(c.mesh.position, { y: c.target, duration: dur, ease: "power3.out" }));
      }
      if (d.exit) {
        const tl = gsap.timeline();
        tls.push(tl);
        cards.forEach((c, i) => {
          const at = reduce ? 0 : (0.04 + 0.11 * i) / 1.1, dur = reduce ? 0 : 0.2545454;
          tl.to(c.mesh.material, { opacity: 0, duration: dur, ease: "power2.in" }, at);
          tl.to(c.mesh.position, { y: c.mesh.position.y + 0.1, duration: dur, ease: "power2.in" }, at);
          tl.to(c.mesh.scale, { x: 0.97, y: 0.97, z: 0.97, duration: dur, ease: "power2.in" }, at);
        });
        tl.to(el, { opacity: 0, filter: "blur(8px)", duration: reduce ? 0 : 0.6545454, ease: "power2.inOut" }, reduce ? 0 : 0.1636364);
      }
    }, { signal: ac.signal });
    const ro = new ResizeObserver(place);
    ro.observe(el);
    const tick = () => renderer.render(scene, camera);
    gsap.ticker.add(tick);
    return () => {
      ac.abort(); ro.disconnect(); gsap.ticker.remove(tick);
      tls.forEach((t) => t.kill());
      cards.forEach((c) => { gsap.killTweensOf([c.mesh.material, c.mesh.position, c.mesh.scale]); c.mesh.geometry.dispose(); c.mesh.material.dispose(); c.tex.dispose(); });
      renderer.dispose();
      gsap.set(el, { clearProps: "opacity,filter" });
      if (madeCanvas) canvas.remove();
    };
  });
})();
