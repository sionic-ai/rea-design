/* Behavior shared by the whole site — Lenis 1.3.23 (defaults), barba 2.10.3 + prefetch 2.2.0 transition (leaving .4s z+50 transparent, entering 1s from z−50),
   Blur-in reveal observer (bottom 10%), top-right circle frame animation (12×12 grid, 144 frames at 60fps, starts after 4 seconds, rests 3 seconds then repeats),
   Drawer (dialog) and initial-letter index, button color reverts once past the hero. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  const DZ = (window.DZ = { pages: {}, reduce });

  root.style.setProperty("--sbw", `${innerWidth - root.clientWidth}px`);
  const lenis = new Lenis();
  DZ.lenis = window.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ───── Blur fade-in ─────
  let io = null;
  const scrollAnim = (scope) => {
    io?.disconnect();
    const set = new Set(scope.querySelectorAll(".dz-in"));
    scope.querySelectorAll(".dz-in-children").forEach((p) => [...p.children].forEach((c) => { c.classList.add("dz-in"); set.add(c); }));
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("isAnimationStarted"); }), { rootMargin: "10000px 0px -10% 0px", threshold: 0 });
    set.forEach((el) => io.observe(el));
  };

  // ───── Circle frame art — instead of the original art, draw frames on a canvas with the same frame count where the ring opens and closes ─────
  const sprite = (el) => {
    if (!el) return;
    const cols = +el.dataset.spriteCols || 12, rows = +el.dataset.spriteRows || 12, total = Math.min(+el.dataset.spriteTotalFrames || cols * rows, cols * rows);
    const fps = +el.dataset.spriteFps || 60, startDelay = +el.dataset.spriteStartDelay || 0, loopInterval = +el.dataset.spriteLoopInterval || 0;
    const S = 128, c = document.createElement("canvas");
    c.width = S * cols; c.height = S * rows;
    const x = c.getContext("2d");
    x.strokeStyle = getComputedStyle(root).getPropertyValue("--kf-ink").trim();
    x.lineWidth = S * 0.085; x.lineCap = "butt";
    const start = -Math.PI / 3;
    for (let f = 0; f < total; f++) {
      const cx = (f % cols) * S + S / 2, cy = Math.floor(f / cols) * S + S / 2, r = S * 0.42;
      const t = f / (total - 1);
      // 0~.1 intact ring → .1~.65 a gap opens counterclockwise from 1 o’clock → .65~1 redrawn and closed
      let a0 = start, a1 = start + Math.PI * 2;
      if (t > 0.1 && t <= 0.65) a0 = start + ((t - 0.1) / 0.55) * Math.PI * 1.98;
      else if (t > 0.65) { a0 = start; a1 = start + ((t - 0.65) / 0.35) * Math.PI * 2; }
      if (a1 - a0 > 0.01) { x.beginPath(); x.arc(cx, cy, r, a0, a1); x.stroke(); }
    }
    el.style.backgroundImage = `url(${c.toDataURL()})`;
    let fw = 0, fh = 0, cur = -1, el0 = 0, last = null, raf = 0;
    const size = () => { fw = el.clientWidth; fh = el.clientHeight; el.style.backgroundSize = `${fw * cols}px ${fh * rows}px`; };
    const draw = (k, force) => { k = Math.max(0, Math.min(k, total - 1)); if (!force && k === cur) return; el.style.backgroundPosition = `${-(k % cols) * fw}px ${-Math.floor(k / cols) * fh}px`; cur = k; };
    size(); draw(0, true);
    new ResizeObserver(() => { size(); draw(cur, true); }).observe(el);
    if (reduce) return;
    const fd = 1000 / fps, play = fd * total, cycle = play + loopInterval;
    const tick = (ts) => {
      if (last === null) last = ts;
      el0 += ts - last; last = ts;
      const a = el0 - startDelay;
      if (a >= 0) { const p = a % cycle; draw(p >= play ? total - 1 : Math.floor(p / fd)); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };
  sprite(document.querySelector("[data-circle-sprite]"));

  // ───── Drawer ─────
  const dialog = document.querySelector(".dz-dialog");
  const openBtn = document.querySelector(".dz-open");
  openBtn?.addEventListener("click", () => dialog?.showModal());
  dialog?.querySelector(".dz-close").addEventListener("click", () => dialog.close());
  dialog?.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  const drawer = () => {
    const box = dialog?.querySelector(".dz-dialog__inner");
    if (!box) return;
    const groups = [...dialog.querySelectorAll(".dz-member__group[data-initial]")];
    const btns = [...dialog.querySelectorAll("[data-initial-target]")];
    btns.forEach((b) => b.addEventListener("click", () => {
      const g = groups.find((x) => x.dataset.initial === b.dataset.initialTarget);
      if (!g) return;
      const max = box.scrollHeight - box.clientHeight;
      box.scrollTo({ top: Math.max(0, Math.min(max, g.offsetTop - box.clientHeight * 0.01)), behavior: "smooth" });
    }));
    // Turn on the indexes between the first and last character of the visible group
    const update = () => {
      const top = box.scrollTop, bottom = top + box.clientHeight;
      const vis = groups.filter((g) => g.offsetTop + g.offsetHeight > top && g.offsetTop < bottom).map((g) => g.dataset.initial);
      if (!vis.length) return;
      const lo = vis[0].charCodeAt(0), hi = vis[vis.length - 1].charCodeAt(0);
      btns.forEach((b) => { const c = b.dataset.initialTarget.charCodeAt(0); b.classList.toggle("is-active", c >= lo && c <= hi); });
    };
    box.addEventListener("scroll", update, { passive: true });
    new MutationObserver(() => dialog.open && requestAnimationFrame(() => requestAnimationFrame(update))).observe(dialog, { attributes: true, attributeFilter: ["open"] });
  };
  drawer();

  // ───── Page attach ─────
  let cleanups = [];
  const markMember = () => {
    const here = location.pathname.split("/").pop();
    dialog?.querySelectorAll(".dz-member a").forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === here && here === "detail.html" && a.dataset.self === "true"));
  };
  const mount = (container) => {
    const name = container.dataset.barbaNamespace || document.body.dataset.page;
    document.body.dataset.page = name;
    scrollAnim(container);
    const init = DZ.pages[name];
    if (init) { const off = init({ scope: container }); if (typeof off === "function") cleanups.push(off); }
    markMember();
  };
  const unmount = () => { cleanups.splice(0).forEach((f) => { try { f(); } catch (e) { /* Attach the next page */ } }); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  const resetScroll = () => { lenis.stop(); lenis.scrollTo(0, { immediate: true, force: true }); lenis.start(); };

  // The original ease names (power2.InOut · power2.In) can’t be read by GSAP, so it runs on the default curve power1.out — this notes that actual curve
  const LEAVE = { ease: "power1.out", autoAlpha: 0, duration: 0.4, z: 50 };
  const ENTER = { ease: "power1.out", z: -50, autoAlpha: 0, duration: 1 };

  const bootBarba = () => {
    if (!/^https?:$/.test(location.protocol) || !window.barba) return false;
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.init({
      timeout: 5000,
      preventRunning: true,
      transitions: [{
        name: "default-transition",
        leave: (d) => gsap.to(d.current.container, LEAVE),
        afterLeave: () => { io?.disconnect(); unmount(); if (dialog?.open) dialog.close(); },
        beforeEnter: (d) => { resetScroll(); Object.assign(d.current.container.style, { position: "fixed", top: "0", left: "0" }); },
        enter: (d) => gsap.from(d.next.container, ENTER),
      }],
    });
    barba.hooks.afterEnter((d) => mount(d.next.container));
    return true;
  };
  const bootFile = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href$='.html']");
      if (!a || a.target || e.metaKey || e.ctrlKey || reduce) return;
      e.preventDefault();
      if (dialog?.open) dialog.close();
      const c = document.querySelector('[data-barba="container"]');
      gsap.to(c, { ...LEAVE, onComplete: () => { sessionStorage.setItem("dz-nav", "1"); location.href = a.href; } });
    });
  };
  const boot = () => {
    const c = document.querySelector('[data-barba="container"]');
    mount(c);
    if (!bootBarba()) bootFile();
    if (sessionStorage.getItem("dz-nav") === "1" && !reduce) { sessionStorage.removeItem("dz-nav"); gsap.from(c, ENTER); }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
