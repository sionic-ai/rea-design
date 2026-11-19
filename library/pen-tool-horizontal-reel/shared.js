// Across the whole screen — reel scroll (wide screens Lenis horizontal·infinite·wheel 2.2x, narrow screens vertical), drag to flip, tool cursor, click sound, list cover, contact box.
// index.js uses these via window.GS
(() => {
  const root = document.documentElement;
  const WIDE = "(min-width: 900px) and (min-aspect-ratio: 1/1) and (min-height: 520px)";
  const wide = matchMedia(WIDE).matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const reel = document.getElementById("reel");
  const track = reel.querySelector(".gs-track");
  const clone = track.querySelector(".gs-hero--clone");
  const GS = (window.GS = { wide, reduce, fine, reel, track, clone });
  gsap.registerPlugin(ScrollTrigger, SplitText);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  // Like the original, when the wide/narrow panel switches, it reopens on the same section
  matchMedia(WIDE).addEventListener("change", () => { try { sessionStorage.setItem("gs.at", String(GS.at || 0)); } catch {} location.reload(); });

  const lenis = (GS.lenis = wide
    ? new Lenis({
        wrapper: reel, content: track, orientation: "horizontal", gestureOrientation: "both",
        lerp: reduce ? 1 : 0.075, wheelMultiplier: 2.2, smoothWheel: true, infinite: true, syncTouch: true, syncTouchLerp: reduce ? 1 : 0.08,
        virtualScroll: (e) => {
          const ev = e.event;
          if ("touches" in ev && ev.touches.length > 1) return false;
          if (ev.type.startsWith("touch") && Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.deltaY *= 1.5;
          return true;
        },
      })
    : new Lenis({ lerp: reduce ? 1 : 0.1, smoothWheel: !reduce, allowNestedScroll: true }));
  lenis.stop();
  GS.limit = () => (wide ? track.scrollWidth - innerWidth : clone.offsetTop);
  GS.pos = () => (wide ? lenis.scroll : scrollY);
  GS.scrollToEl = (el, o = {}) => wide ? lenis.scrollTo(el.offsetLeft, o) : lenis.scrollTo(el, o);
  lenis.on("scroll", ScrollTrigger.update);

  // ── Drag to flip (wide screen, mouse) ──
  let drag = null;
  if (wide && fine) {
    reel.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.pointerType !== "mouse" || e.target.closest("a, button, input, textarea, label")) return;
      drag = { x: e.clientX, s: lenis.targetScroll, moved: false };
    });
    addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; root.classList.add("is-dragging"); }
      if (drag.moved) lenis.scrollTo(drag.s - dx * 1.4, { lerp: 0.18 });
    }, { passive: true });
    addEventListener("pointerup", () => { if (drag?.moved) setTimeout(() => root.classList.remove("is-dragging"), 0); drag = null; });
  }

  // ── Click sound: short sine drop + triangle drop + band noise, tanh saturation and compression, then .55 ──
  const SOUND = "gs.sound";
  const soundOn = () => { try { return localStorage.getItem(SOUND) !== "off"; } catch { return true; } };
  let ac = null, out = null, noise = null;
  const audio = () => {
    if (ac) return ac;
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return null;
    ac = new A();
    const shaper = ac.createWaveShaper(), curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) { const x = (i / (curve.length - 1)) * 2 - 1; curve[i] = Math.tanh(x * 2.4) / Math.tanh(2.4); }
    shaper.curve = curve;
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -10; comp.knee.value = 6; comp.ratio.value = 8; comp.attack.value = 0.002; comp.release.value = 0.2;
    out = ac.createGain(); out.gain.value = 0.55;
    shaper.connect(comp).connect(out).connect(ac.destination);
    out.inlet = shaper;
    noise = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.2), ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
    return ac;
  };
  GS.click = (power = 1) => {
    if (!soundOn() || reduce) return;
    const a = audio();
    if (!a) return;
    if (a.state === "suspended") a.resume();
    const t = a.currentTime + 0.005, j = 0.94 + Math.random() * 0.12, inlet = out.inlet;
    const voice = (type, f0, f1, fall, peak, attack, len) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f0 * j, t); o.frequency.exponentialRampToValueAtTime(f1 * j, t + fall);
      g.gain.setValueAtTime(1e-4, t); g.gain.exponentialRampToValueAtTime(peak * power, t + attack); g.gain.exponentialRampToValueAtTime(1e-4, t + len);
      o.connect(g).connect(inlet); o.start(t); o.stop(t + len + 0.02);
    };
    voice("sine", 150, 38, 0.42, 1, 0.008, 0.85);
    voice("triangle", 240, 70, 0.18, 0.45, 0.004, 0.3);
    const src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain();
    src.buffer = noise; bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 0.7;
    g.gain.setValueAtTime(0.5 * power, t); g.gain.exponentialRampToValueAtTime(1e-4, t + 0.09);
    src.connect(bp).connect(g).connect(inlet); src.start(t); src.stop(t + 0.12);
  };
  const soundBtn = document.querySelector(".gs-top__sound");
  const paintSound = () => { const on = soundOn(); soundBtn.textContent = on ? "Sound on" : "Sound off"; soundBtn.setAttribute("aria-pressed", String(on)); };
  soundBtn.addEventListener("click", () => { try { localStorage.setItem(SOUND, soundOn() ? "off" : "on"); } catch {} paintSound(); });
  paintSound();
  addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" && e.target.closest("a, button, .gs-plate")) GS.click(e.target.closest(".gs-plate") ? 0.6 : 1); }, { passive: true });

  // ── Tool cursor: plus over links·buttons, eyedropper over photos (puts the color underneath in a chip), hand when dragging, pen elsewhere ──
  const cur = document.querySelector(".gs-cursor");
  if (fine && !reduce) {
    root.classList.add("has-cursor");
    const chip = cur.querySelector(".gs-cursor__swatch i"), hex = cur.querySelector(".gs-cursor__swatch b"), note = cur.querySelector(".gs-cursor__note");
    let x = -100, y = -100, sample = "", over = null;
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY; over = e.target;
      // Spots go in right away without waiting for the frame, only tool changes are checked per frame
      cur.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      cur.classList.add("is-on");
    }, { passive: true });
    document.addEventListener("pointerleave", () => cur.classList.remove("is-on"));
    document.addEventListener("fx:develop-sample", (e) => { sample = e.detail.hex; if (sample) { chip.style.background = sample; hex.textContent = sample; } });
    gsap.ticker.add(() => {
      const tool = root.classList.contains("is-dragging") ? "hand" : over?.closest?.("a, button") ? "add" : sample && over?.closest?.(".gs-plate") ? "drop" : "pen";
      if (cur.dataset.tool !== tool) cur.dataset.tool = tool;
      const n = soundOn() && GS.filmCover > 0.3 && navigator.userActivation?.hasBeenActive === false ? "Click for sound" : "";
      if (note.textContent !== n) note.textContent = n;
    });
  }

  // ── List Cover ──
  const index = document.querySelector(".gs-index");
  const setIndex = (v) => {
    index.hidden = !v;
    root.classList.toggle("is-index", v);
    requestAnimationFrame(() => index.classList.toggle("is-open", v));
    v ? lenis.stop() : GS.ready && lenis.start();
  };
  document.querySelector(".gs-top__index").addEventListener("click", () => setIndex(index.hidden));
  index.querySelector(".gs-ix__close").addEventListener("click", () => setIndex(false));
  index.querySelectorAll("[data-jump]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    setIndex(false);
    const el = document.getElementById(a.dataset.jump);
    if (el) GS.scrollToEl(el, { immediate: true, force: true });
  }));

  // ── Contact Box ──
  const modal = document.querySelector(".gs-modal");
  const form = modal.querySelector(".gs-modal__form"), send = modal.querySelector(".gs-modal__send"), status = modal.querySelector(".gs-modal__status");
  const setModal = (v) => {
    modal.hidden = !v;
    root.classList.toggle("is-modal", v);
    v ? lenis.stop() : GS.ready && lenis.start();
    if (v) modal.querySelector("input")?.focus({ preventScroll: true });
  };
  document.querySelector(".gs-top__contact").addEventListener("click", () => setModal(true));
  document.querySelector(".gs-outro__open").addEventListener("click", (e) => { e.preventDefault(); setModal(true); });
  modal.querySelector(".gs-modal__scrim").addEventListener("click", () => setModal(false));
  modal.querySelector(".gs-modal__close").addEventListener("click", () => setModal(false));
  form.addEventListener("input", () => send.setAttribute("aria-disabled", String(!/.+@.+\..+/.test(form.querySelector('input[type="email"]').value))));
  form.addEventListener("submit", (e) => { e.preventDefault(); if (send.getAttribute("aria-disabled") === "true") return; status.textContent = "Sent — one line of guidance after sending goes here."; form.reset(); send.setAttribute("aria-disabled", "true"); });
  modal.querySelector(".gs-modal__copy").addEventListener("click", (e) => { e.preventDefault(); status.textContent = "Address copied."; });
  addEventListener("keydown", (e) => { if (e.key !== "Escape") return; if (!modal.hidden) setModal(false); else if (!index.hidden) setIndex(false); });
})();
