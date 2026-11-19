/* Shared motion for the whole set — Lenis (lerp .09) · loader · header · panel pause/sound · float-up (Reveal y24 .7s) · split-line rise · page transition (.45s exit) */
(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("brand", "0.16,1,0.3,1");
  gsap.defaults({ ease: "expo.out", duration: 0.3 });
  const DUR = { micro: 0.15, ui: 0.3, reveal: 0.7, signature: 1.4, routeOut: 0.45, routeIn: 0.7 };
  const STAGGER = 0.045;

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.09, smoothWheel: true, syncTouch: false, anchors: true, stopInertiaOnNavigate: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Plate — each page shows one plate from plate.js, and the page script changes its shape and camera through window.clPlate */
  const host = document.querySelector(".cl-scene");
  let plate = null;
  if (host && window.BrandPlate && window.THREE) {
    plate = new BrandPlate(host, { preset: host.dataset.preset || "hero", grains: +host.dataset.grains || undefined });
    window.clPlate = plate;
  }

  /* Sound — the board’s frequency as a sine wave (our sound). When on, three bars undulate at a .9s tempo */
  let audio = null;
  const sound = {
    on: false,
    hz: 1117,
    set(on) {
      this.on = on;
      document.querySelectorAll("[data-sound]").forEach((b) => { b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on)); });
      // When on, like the original, bars for the current frequency and volume stand beside the button
      document.querySelectorAll("[data-hz-now], [data-volume]").forEach((el) => (el.hidden = !on));
      try { sessionStorage.setItem("cl-sound", on ? "1" : "0"); } catch (e) {}
      if (on) {
        if (!this.prime()) return;
        audio.ctx.resume();
        audio.gain.gain.setTargetAtTime(0.04, audio.ctx.currentTime, 0.2);
      } else if (audio) audio.gain.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.1);
    },
    prime() {
      if (audio) return true;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      const ctx = new Ctx(), osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = this.hz / 4; gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination); osc.start();
      audio = { ctx, osc, gain };
      return true;
    },
    tune(hz) {
      this.hz = hz;
      document.querySelectorAll("[data-hz-now]").forEach((el) => (el.textContent = `${Math.round(hz).toLocaleString("en-US")} Hz`));
      if (audio) audio.osc.frequency.setTargetAtTime(Math.max(60, hz / 4), audio.ctx.currentTime, 0.1);
    },
  };
  window.clSound = sound;
  document.querySelectorAll("[data-volume]").forEach((v) => v.addEventListener("input", () => { if (audio) audio.gain.gain.setTargetAtTime(0.07 * +v.value, audio.ctx.currentTime, 0.05); }));
  document.querySelectorAll("[data-sound]").forEach((b) => b.addEventListener("click", () => sound.set(!sound.on)));
  document.querySelectorAll("[data-playback]").forEach((b) => b.addEventListener("click", () => {
    const icon = b.querySelector(".cl-play"), label = b.querySelector(".cl-label");
    const paused = icon.dataset.state === "playing";
    icon.dataset.state = paused ? "paused" : "playing";
    if (label) label.textContent = paused ? "Turn panel on" : "Panel stop";
    if (plate) plate.paused = paused;
  }));

  /* Rise-in — from 24px below and transparent over .7s expo.out, once when the heading reaches 88% of the screen */
  const reveal = (el, delay = 0) => {
    if (reduce) return;
    gsap.fromTo(el, { opacity: 0, y: +(el.dataset.distance || 24) }, { opacity: 1, y: 0, duration: DUR.reveal, ease: "expo.out", delay, clearProps: "transform", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  };
  document.querySelectorAll("[data-reveal]").forEach((el) => reveal(el, +(el.dataset.reveal || 0)));
  /* Line-split rise — the title is split into lines and masked, rising from 110% below in .7s expo.out, .09s between lines (header 85%) */
  const splitHeading = (el, opts = {}) => {
    if (reduce) return;
    SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true, aria: "auto", linesClass: "cl-split-line",
      onSplit: (s) => gsap.from(s.lines, { yPercent: 110, duration: DUR.reveal, ease: "expo.out", stagger: 2 * STAGGER, delay: opts.delay || 0, ...(opts.now ? {} : { scrollTrigger: { trigger: el, start: "top 85%", once: true } }) }) });
  };
  document.querySelectorAll("[data-split]:not([data-split='later'])").forEach((el) => splitHeading(el));

  /* Loader — 000 climbs by the share of panel preparation at .6s expo.out while a line is drawn along. When full, after .15s three buttons rise 10px over .7s.
     On entry the top and bottom lines take .25s · numbers rise 24px over .4s after .05s · the panel clears over .45s after .15s */
  let cameRoute = false;
  try { cameRoute = sessionStorage.getItem("cl-route") === "1"; } catch (e) {}
  // Original is a single-page app so the panel stays after the transition and the camera slides from the previous page’s position to the new one by 1 − e^(−3.2t) — an arriving page starts from the previous camera
  if (plate && cameRoute && !reduce) {
    try { const c = JSON.parse(sessionStorage.getItem("cl-route-cam") || "null"); if (c) Object.assign(plate.camNow, c); } catch (e) {}
  }
  // In the original, on a freshly opened page the panel stays empty .5s after first paint then settles in over 1.5s (panel prep) — on pages arrived from elsewhere or behind a gate it is already standing.
  // Text-heavy pages paint before the script runs, so count from first paint (first-paint, or FCP if absent), not from the script
  if (plate && !reduce && !cameRoute && !document.querySelector("[data-preloader]")) {
    const fcp = (performance.getEntriesByName("first-paint")[0] || performance.getEntriesByName("first-contentful-paint")[0] || {}).startTime;
    const wait = fcp != null ? Math.max(0, fcp + 500 - performance.now()) / 1000 : 0.5;
    gsap.fromTo(host, { autoAlpha: 0 }, { autoAlpha: 1, delay: wait, duration: 1.5, ease: "none" });
  }
  const pre = document.querySelector("[data-preloader]");
  const fire = () => { window.clEntered = true; document.dispatchEvent(new CustomEvent("cl:entered")); };
  const enter = (withSound) => {
    if (!pre || pre.dataset.leaving) return;
    pre.dataset.leaving = "1";
    // In the original, the sound button turns on without a transition once the sound engine attaches (about .27s after the press). Build the engine before the exit timeline — building it midway stalls that frame and the exit skips ahead in one go.
    if (withSound) sound.prime();
    if (withSound) setTimeout(() => {
      const pills = document.querySelectorAll("[data-sound]");
      pills.forEach((b) => (b.style.transition = "none"));
      requestAnimationFrame(() => {
        sound.set(true);
        requestAnimationFrame(() => pills.forEach((b) => (b.style.transition = "")));
      });
    }, 40);
    try { sessionStorage.setItem("cl-entered", "1"); } catch (e) {}
    const q = (p) => pre.querySelectorAll(`[data-part="${p}"]`);
    const tl = gsap.timeline({ onComplete: () => { pre.close && pre.open && pre.close(); pre.remove(); lenis && lenis.start(); fire(); } });
    if (reduce) { tl.set(pre, { autoAlpha: 0 }); return; }
    tl.to(q("chrome"), { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, 0)
      .to(q("actions"), { autoAlpha: 0, y: 10, duration: 0.25, ease: "power2.in" }, 0)
      .to([...q("counter"), ...q("line")], { y: -24, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 0.05)
      .to(pre, { autoAlpha: 0, duration: DUR.routeOut, ease: "power2.in" }, 0.15);
  };
  if (pre) {
    let seen = false;
    try { seen = sessionStorage.getItem("cl-entered") === "1"; } catch (e) {}
    if (seen && pre.dataset.preloader !== "always") { pre.remove(); requestAnimationFrame(fire); }
    else {
      const open = () => {
        try { pre.showModal(); } catch (e) { pre.setAttribute("open", ""); }
        lenis && lenis.stop();
      };
      // On the first page arrived at, as in the original the body comes in first (.7s), pauses briefly, then the fully filled gate covers it all at once — 1.7s from the click, regardless of how long the new document takes to appear
      let clickAt = 0;
      try { clickAt = +sessionStorage.getItem("cl-route-t") || 0; } catch (e) {}
      if (cameRoute && !reduce) setTimeout(open, clickAt ? Math.max(0, clickAt + 1700 - Date.now()) : 1150);
      else open();
      const counter = pre.querySelector('[data-part="counter"]'), line = pre.querySelector('[data-part="line"]'), actions = pre.querySelector('[data-part="actions"]');
      const v = { value: 0 };
      // Arriving from another page, the board is already ready so the gate stands fully filled (original: the first page gate after arrival is fully visible within 50ms)
      if (cameRoute) { counter.textContent = "100"; gsap.set(line, { scaleX: 1 }); gsap.set(actions, { autoAlpha: 1 }); }
      else {
      // Ready share — in the original it rises at each shader preparation step. This copy rises in three steps up to the panel’s first frame
      const steps = [0.34, 0.72, 1];
      // The original increments on every pane-ready signal (headless: intensity about .97s · pause .15s · button .37s) — the copy runs three steps at .28s intervals after .15s, and the three buttons appear staggered by .045 each at 1.2s
      steps.forEach((p, i) => gsap.to(v, { value: 100 * p, duration: 0.6, ease: "expo.out", delay: 0.15 + i * 0.28, overwrite: "auto", onUpdate: () => (counter.textContent = String(Math.round(v.value)).padStart(3, "0")) }));
      steps.forEach((p, i) => gsap.to(line, { scaleX: p, duration: 0.6, ease: "expo.out", delay: 0.15 + i * 0.28 }));
      gsap.to(actions, { autoAlpha: 1, duration: 0, delay: 1.2 });
      gsap.fromTo(actions.children, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : DUR.reveal, ease: "expo.out", stagger: STAGGER, delay: 1.2 });
      }
      pre.querySelector("[data-enter-sound]").addEventListener("click", () => enter(true));
      pre.querySelector("[data-enter-muted]").addEventListener("click", () => enter(false));
      pre.addEventListener("cancel", (e) => { e.preventDefault(); enter(false); });
    }
  } else {
    try { if (sessionStorage.getItem("cl-sound") === "1") document.querySelectorAll("[data-sound]").forEach((b) => b.classList.add("is-on")); } catch (e) {}
    requestAnimationFrame(fire);
  }

  /* Page transition — the body slides out 14px upward over .45s power2.in before leaving, and the new page body enters over .7s expo.out */
  const route = document.querySelector(".cl-route");
  if (route && !reduce) {
    let came = false;
    try { came = sessionStorage.getItem("cl-route") === "1"; sessionStorage.removeItem("cl-route"); sessionStorage.removeItem("cl-route-t"); sessionStorage.removeItem("cl-route-cam"); } catch (e) {}
    window.clCame = came;
    if (came) gsap.from(route, { autoAlpha: 0, y: 14, duration: DUR.routeIn, ease: "expo.out", clearProps: "all" });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const here = location.pathname.split("/").pop() || "index.html";
    e.preventDefault();
    if (href.split("#")[0] === here) {
      const id = href.split("#")[1], target = id && document.getElementById(id);
      if (target) lenis ? lenis.scrollTo(target, { offset: innerHeight * 0.05 }) : target.scrollIntoView({ behavior: "smooth" });
      else lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try { sessionStorage.setItem("cl-route", "1"); sessionStorage.setItem("cl-route-t", String(Date.now())); if (plate) sessionStorage.setItem("cl-route-cam", JSON.stringify(plate.camNow)); } catch (err) {}
    if (reduce || !route) { location.href = href; return; }
    if (plate) plate.strike();
    gsap.to(route, { autoAlpha: 0, y: -14, duration: DUR.routeOut, ease: "power2.in", overwrite: "auto", onComplete: () => (location.href = href) });
  });

  window.clShared = { reduce, lenis, DUR, STAGGER, reveal, splitHeading, plate, sound };
})();
