(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = getComputedStyle(root);

  // Lottie paint: swap our Lottie layer names (c0–c5, cw) for skin colors and load them
  const rgb = (v) => {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = v.trim() || "transparent";
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
  };
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  const resolved = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };
  const PAINT = {
    c0: rgb(resolved("--kf-ink")), cw: rgb(resolved("--kf-bg")), c1: rgb(resolved("--kf-accent")),
    c2: rgb(resolved("--site-lime")), c3: rgb(resolved("--site-mint")), c4: rgb(resolved("--site-blue")), c5: rgb(resolved("--site-orange")),
  };
  probe.remove();
  const paint = (data) => {
    const walk = (layers) => layers.forEach((l) => {
      const col = PAINT[l.nm];
      if (col) (l.shapes || []).forEach((g) => (g.it || []).forEach((s) => { if (s.ty === "fl") s.c.k = col; }));
    });
    walk(data.layers || []);
    return data;
  };
  const cache = new Map();
  // On file:// fetch is blocked, so the same drawing stored in lottie/lottie-data.js is used first
  const loadData = (src) => {
    const name = src.replace(/^.*\//, "").replace(/\.json$/, "");
    if (!cache.has(src)) cache.set(src, window.sslLottie?.[name] ? Promise.resolve(paint(JSON.parse(JSON.stringify(window.sslLottie[name])))) : fetch(src).then((r) => r.json()).then(paint));
    return cache.get(src).then((d) => JSON.parse(JSON.stringify(d)));
  };

  // ── Lottie playback rules (same as the original STUDIO): appear plays once after a delay when 30% visible, autoplay loops, hover restarts from the start when entering the container and stops on leaving ──
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    seen.unobserve(e.target);
    const p = e.target;
    wait(Math.abs(parseInt(p.dataset.delay || "0", 10)) || 0).then(() => p.play?.());
  }), { threshold: [0.3] });
  const ready = (p) => new Promise((res) => {
    if ((p.getLottie?.()?.totalFrames ?? 0) > 0) res();
    else p.addEventListener("ready", () => res(), { once: true });
  });
  const startLottie = async (p) => {
    const src = p.dataset.src;
    if (!src) return;
    const type = p.dataset.playtype || "autoplay";
    await customElements.whenDefined("dotlottie-player");
    let data;
    try { data = await loadData(src); } catch (e) { return; }
    p.load(data);
    await ready(p);
    if (reduce) { p.seek?.("100%"); return; }
    if (type === "autoplay") { p.setLooping?.(true); p.play(); return; }
    if (type === "appear") { seen.observe(p); return; }
    if (type === "hover") {
      const box = p.closest(p.dataset.container || "a") || p;
      let on = false;
      box.addEventListener("mouseenter", async () => { on = true; await wait(parseInt(p.dataset.delay || "0", 10) || 0); if (on) { p.stop(); p.setDirection?.(1); p.play(); } });
      box.addEventListener("mouseleave", () => { on = false; p.stop(); });
    }
  };
  document.querySelectorAll("dotlottie-player[data-src]").forEach((p) => { startLottie(p); });

  // ── Appear (original Studio appear): when even one pixel enters the screen, is-appear is removed, going from hidden to its place ──
  const appear = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    appear.unobserve(e.target);
    const el = e.target;
    el.classList.remove("is-pre");
    // Like the original STUDIO, when the entrance transition ends, remove the entrance duration and curve and return the element to its default transition (.3s)
    if (el.matches(".ssl-rise-x, .ssl-rise-y")) {
      const done = (ev) => { if (ev.target !== el) return; el.classList.remove("ssl-rise-x", "ssl-rise-y", "ssl-rise-y--far"); el.removeEventListener("transitionend", done); };
      el.addEventListener("transitionend", done);
    }
  }));
  if (!reduce) document.querySelectorAll(".is-pre").forEach((el) => appear.observe(el));
  else document.querySelectorAll(".is-pre").forEach((el) => el.classList.remove("is-pre"));

  // Letter entrance: the delay grows 10ms per letter and the duration shrinks so all letters settle together in about 1.2 seconds (original _c131~)
  const X1 = [0, 0.02, 0.04, 0.07, 0.1, 0.13, 0.16], X2 = [0.1, 0.12, 0.15, 0.19, 0.24, 0.3, 0.37];
  const DUR = [1200, 1180, 1150, 1110, 1060, 1000, 930, 850, 710, 610, 500];
  document.querySelectorAll("[data-ssl-chars]").forEach((el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text.trim());
    el.textContent = "";
    const lines = text.split("|");
    lines.forEach((line) => {
      const row = document.createElement("span");
      row.className = "ssl-chars__row";
      row.setAttribute("aria-hidden", "true");
      [...line].forEach((c, i) => {
        const box = document.createElement("span");
        box.className = "ssl-chars__c";
        const inner = document.createElement("span");
        inner.textContent = c === " " ? " " : c;
        const k = Math.min(i, X1.length - 1);
        const delay = 5 * i * (i + 3);
        const dur = i < DUR.length ? DUR[i] : Math.max(200, 1150 - delay);
        inner.style.transition = `translate ${dur}ms cubic-bezier(${X1[k]}, 1, ${X2[k]}, 1) ${delay}ms`;
        box.append(inner);
        row.append(box);
      });
      el.append(row);
    });
    el.classList.add("is-pre");
    if (reduce) el.classList.remove("is-pre"); else appear.observe(el);
  });

  // ── Flow band (original sd-loop-box): duplicates the content up to twice the screen width, runs straight at speed px per second, and stops on hover ──
  document.querySelectorAll("[data-ssl-loop]").forEach((box) => {
    const track = box.querySelector(".ssl-loop__track");
    if (!track) return;
    const base = [...track.children];
    const speed = parseFloat(box.dataset.sslLoop) || 60;
    let anim = null;
    const build = () => {
      track.querySelectorAll("[data-clone]").forEach((n) => n.remove());
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const one = base.reduce((s, n) => s + n.getBoundingClientRect().width + gap, 0);
      if (one <= 0) return;
      let w = one;
      while (w < box.clientWidth + one) {
        base.forEach((n) => { const c = n.cloneNode(true); c.setAttribute("data-clone", ""); c.setAttribute("aria-hidden", "true"); track.append(c); });
        w += one;
      }
      anim?.cancel();
      anim = track.animate([{ transform: "translateX(0)" }, { transform: `translateX(-${one}px)` }], { duration: (one / speed) * 1000, iterations: Infinity, easing: "linear" });
      track.style.setProperty("--ssl-loop", `${one}px`);
      if (reduce) anim.pause();
    };
    // The original band flows even offscreen — only whether it is on screen is shown through the track’s is-on
    let inView = false;
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      track.classList.toggle("is-on", inView);
    }).observe(box);
    if (box.hasAttribute("data-hover-pause")) {
      box.addEventListener("mouseenter", () => anim?.pause());
      box.addEventListener("mouseleave", () => { if (!reduce) anim?.play(); });
    }
    const ro = new ResizeObserver(() => build());
    ro.observe(box);
    document.fonts?.ready.then(build);
  });

  // ── Menu window (phone, tablet): open and close with a button ──
  const modal = document.querySelector(".ssl-modal");
  const setModal = (on) => {
    modal?.classList.toggle("is-open", on);
    document.body.classList.toggle("is-locked", on);
    document.querySelectorAll("[data-ssl-menu]").forEach((b) => b.setAttribute("aria-expanded", String(on)));
  };
  document.querySelectorAll("[data-ssl-menu]").forEach((b) => b.addEventListener("click", () => setModal(!modal?.classList.contains("is-open"))));
  modal?.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-ssl-close]")) setModal(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setModal(false); });

  root.classList.add("js");
})();
