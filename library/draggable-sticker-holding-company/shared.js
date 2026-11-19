(() => {
  const root = document.documentElement;
  const page = document.querySelector(".ax-page");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEY = "ax-nav";
  // The original (framer-motion) advances at most 40ms even when a frame is late — the same rule, so motion does not jump forward when frames lag right after a press
  if (window.gsap) gsap.ticker.lagSmoothing(40, 40);

  // Page transition — as in the original, opening the first page directly skips the fade (initial: false), while sub-pages or a first page reached by navigating turn on after .2s over .2s
  if (page) {
    const came = sessionStorage.getItem(KEY) === "1";
    sessionStorage.removeItem(KEY);
    const home = document.body.dataset.page === "index";
    // Attach the fade-in to the frame after the first paint — if the first paint is late waiting for the font, the fade would finish in the meantime.
    if (home && !came) page.classList.add("is-now");
    else requestAnimationFrame(() => requestAnimationFrame(() => page.classList.add("is-in")));
  }

  // The picture cell is a drawn placeholder, so it is marked loaded right after the first frame — the shimmer fades out in 1s. With real photos, hook onto the img load
  document.querySelectorAll(".ax-img").forEach((box) => {
    const img = box.querySelector("img");
    const done = () => box.classList.add("is-loaded");
    if (img && !img.complete) img.addEventListener("load", done, { once: true });
    else requestAnimationFrame(() => requestAnimationFrame(done));
  });

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !page || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || /^[a-z]+:/i.test(href)) return;
    e.preventDefault();
    sessionStorage.setItem(KEY, "1");
    if (reduce) { location.href = href; return; }
    // Tempo measured from the original — the first page fades right away in .27s (fade of two overlapping panels), sub-pages hold while the next page loads (first change at 240~270ms) then fade in .2s
    const home = document.body.dataset.page === "index";
    const wait = home ? 0 : 200, out = home ? 270 : 200;
    page.style.setProperty("--ax-out", `${out}ms`);
    setTimeout(() => {
      page.classList.remove("is-in", "is-now");
      page.classList.add("is-out");
      setTimeout(() => { location.href = href; }, out);
    }, wait);
  });
  addEventListener("pageshow", (e) => {
    if (e.persisted && page) { page.classList.remove("is-out"); page.classList.add("is-now"); }
  });

  // Sound effects: the original uses eight short sounds (press · release · open · close · forward · back · error). We make new short sounds for the same uses with WebAudio
  let ctx = null;
  const muted = () => root.dataset.muted === "true";
  const TONES = {
    click: [[880, 0.035, 0.12]],
    tap: [[660, 0.04, 0.1]],
    release: [[520, 0.05, 0.1], [780, 0.05, 0.08, 0.04]],
    open: [[520, 0.06, 0.12], [780, 0.08, 0.1, 0.05]],
    close: [[700, 0.06, 0.1], [460, 0.08, 0.1, 0.05]],
    forward: [[620, 0.05, 0.1], [830, 0.05, 0.08, 0.04]],
    back: [[830, 0.05, 0.1], [620, 0.05, 0.08, 0.04]],
    error: [[220, 0.09, 0.12], [200, 0.09, 0.1, 0.1]],
  };
  // Build the audio panel ahead of time — building it on the first press would freeze that frame for over 100ms and make the sticker react late (the original preloads the audio)
  const warm = () => { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { /* Silent Environment */ } };
  if (document.querySelector(".ax-sound")) (window.requestIdleCallback || setTimeout)(warm);
  // Sound plays after the pressed frame is drawn — so waking the audio and building the sound bars don’t hold up the pressed frame, keeping the first motion frame from being delayed
  window.axSfx = (name) => {
    if (muted() || !TONES[name]) return;
    setTimeout(() => play(name), 0);
  };
  const play = (name) => {
    try {
      warm();
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      for (const [f, len, vol, at = 0] of TONES[name]) {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0, now + at);
        g.gain.linearRampToValueAtTime(vol, now + at + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, now + at + len);
        o.connect(g).connect(ctx.destination);
        o.start(now + at); o.stop(now + at + len + 0.02);
      }
    } catch (_) { /* Environments that can’t play sound — skip quietly */ }
  };

  const sound = document.querySelector(".ax-sound");
  if (sound) {
    const svg = sound.querySelector("svg");
    // Each time it toggles (even the first open), redraw the line on the changed side
    const draw = () => { svg.classList.remove("is-drawing"); svg.getBoundingClientRect(); svg.classList.add("is-drawing"); };
    const set = (v) => { root.dataset.muted = String(v); sound.dataset.muted = String(v); draw(); };
    set(localStorage.getItem("ax-muted") === "true");
    sound.querySelector("button").addEventListener("click", () => {
      const v = !muted();
      set(v); localStorage.setItem("ax-muted", String(v));
      document.dispatchEvent(new CustomEvent("ax:state"));
    });
  }
})();
