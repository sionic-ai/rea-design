(() => {
  const stage = document.querySelector(".ad-stage");
  const main = document.querySelector(".ad-main");
  const ui = document.querySelector(".ad-ui");
  const info = document.querySelector(".ad-info");
  const learn = document.querySelector(".ad-learn");
  const speedBtn = document.querySelector(".ad-speed");
  const speedVal = document.querySelector(".ad-speed__val");
  const word = document.querySelector(".ad-title__word");
  const clock = { m: document.querySelector('[data-t="m"]'), s: document.querySelector('[data-t="s"]'), ms: document.querySelector('[data-t="ms"]') };
  if (!stage || !main) return;

  // The last word of the title changes with each kicker (every third time returns to the first word) — in place of the original’s twenty onomatopoeia slots
  const WORDS = ["Thud", "Thunk", "Tick", "Pair", "Exactly", "Thud thud", "Pop", "Tap", "Tap tap", "Soup", "Clack", "King", "Pop", "Rule", "Round", "Chut", "Arrive", "Thump", "Ping", "Bang"];
  const FIRST = word ? word.textContent : "";
  const wrap = gsap.utils.wrap(WORDS);
  let kicks = 0, wordAt = 0, titleAt = 0;

  let fade = { main: 1, ui: 2, uiDelay: 1, sound: 4 };
  gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
    fade = { main: 0, ui: 0, uiDelay: 0, sound: 0 };
    return () => { fade = { main: 1, ui: 2, uiDelay: 1, sound: 4 }; };
  });

  // Turn on the body 1s after the first GL frame
  document.addEventListener("fx:ready", () => gsap.to(main, { autoAlpha: 1, duration: fade.main }), { once: true });

  // Sound — instead of the original audio, an 8-second loop synthesized here (120bpm kick · offbeat hi-hat · low rumble) is repeated with howler
  function loopWav() {
    const rate = 22050, sec = 8, n = rate * sec, d = new Float32Array(n), beat = 0.5;
    let seed = 7;
    const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (let i = 0; i < n; i++) {
      const t = i / rate, inBeat = t % beat, inHalf = (t + beat / 2) % beat;
      const f = 45 + 75 * Math.exp(-inBeat * 30);
      let v = Math.sin(2 * Math.PI * f * inBeat) * Math.exp(-inBeat * 7) * 0.9;
      v += noise() * Math.exp(-inHalf * 60) * 0.12;
      v += (Math.sin(2 * Math.PI * 55 * t) * 0.06 + Math.sin(2 * Math.PI * 82.5 * t) * 0.04) * (0.6 + 0.4 * Math.sin(2 * Math.PI * t / sec));
      d[i] = Math.max(-1, Math.min(1, v));
    }
    const buf = new ArrayBuffer(44 + n * 2), dv = new DataView(buf);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    str(0, "RIFF"); dv.setUint32(4, 36 + n * 2, true); str(8, "WAVE"); str(12, "fmt ");
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, rate, true);
    dv.setUint32(28, rate * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); str(36, "data"); dv.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) dv.setInt16(44 + i * 2, d[i] * 32767, true);
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  }

  // Kick detection: a kick is when the frequency average jumps by more than 7 in one frame and .23s (in playback-speed time) has passed since the last kick. The floor follows downward every four frames.
  const beat = { analyser: null, bins: null, base: 0, last: -1 };
  let howl = null;
  function startSound() {
    if (!window.Howl || howl) return;
    Howler.ctx?.resume?.();
    howl = new Howl({ src: [loopWav()], format: ["wav"], loop: true, volume: 0 });
    howl.play();
    const vol = { v: 0 };
    gsap.to(vol, { v: 0.8, duration: fade.sound, ease: "power2.in", onUpdate: () => howl.volume(vol.v) });
    if (Howler.ctx && Howler.masterGain) {
      beat.analyser = Howler.ctx.createAnalyser();
      beat.analyser.fftSize = 1024;
      beat.bins = new Uint8Array(beat.analyser.frequencyBinCount);
      Howler.masterGain.connect(beat.analyser);
    }
  }
  function onKick() {
    stage.dispatchEvent(new CustomEvent("fx:kick"));
    if (word) word.textContent = kicks % 3 === 0 ? FIRST : wrap(wordAt++);
    kicks++;
    document.title = wrap(titleAt++);
  }
  function listen(elapsed, frames) {
    if (!beat.analyser) return;
    beat.analyser.getByteFrequencyData(beat.bins);
    let sum = 0;
    for (let i = 0; i < beat.bins.length; i++) sum += beat.bins[i];
    const avg = sum / beat.bins.length;
    if (elapsed - beat.last > 0.23 && avg - beat.base > 7) { onKick(); beat.base = avg; beat.last = elapsed; }
    if (frames % 4 === 0 && beat.base - avg > 7) beat.base = avg;
  }

  // Clock — the sped-up time as min:sec:thousandths, every four frames
  const pad = (v, n) => String(v).padStart(n, "0");
  const speedText = (v) => { const t = Math.round(v * 100); return `${Math.floor(t / 100)}:${pad(t % 100, 2)}`; };
  let shown = 1;
  stage.addEventListener("fx:tick", (e) => {
    const { elapsed, scale, frames } = e.detail;
    listen(elapsed, frames);
    if (frames % 4 === 0 && clock.m) {
      clock.m.textContent = pad((elapsed / 60) | 0, 2);
      clock.s.textContent = pad((elapsed % 60) | 0, 2);
      clock.ms.textContent = pad(((elapsed - (elapsed | 0)) * 1000) | 0, 3);
    }
    if (Math.abs(scale - shown) > 1e-4 && speedVal) { shown = scale; speedVal.textContent = speedText(scale); }
  });

  // Entrance — the four corner UIs turn on over 2s after 1s, and the sound swells over 4s
  document.addEventListener("fx:enter", () => {
    gsap.to(ui, { autoAlpha: 1, duration: fade.ui, delay: fade.uiDelay });
    startSound();
  }, { once: true });

  // Phone’s Press to speed up — each press goes 1 · 2 · 4 · 10 · 20x
  const STEPS = [1, 2, 4, 10, 20], stepAt = gsap.utils.wrap(STEPS);
  let step = 0, current = 1, panelOpen = false;
  speedBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panelOpen) return;
    if (current === 1) step = 0;
    current = stepAt(++step);
    stage.dispatchEvent(new CustomEvent("fx:speed", { detail: { value: current } }));
  });

  // When the About panel opens, time slows to .1x (.25x on phone) and press-to-accelerate is locked
  learn?.addEventListener("click", (e) => { e.stopPropagation(); info?.dispatchEvent(new CustomEvent("fx:open")); });
  info?.addEventListener("fx:state", (e) => {
    panelOpen = e.detail.open;
    current = panelOpen ? (innerWidth < 650 ? 0.25 : 0.1) : 1;
    stage.dispatchEvent(new CustomEvent("fx:speed", { detail: { value: current, lock: panelOpen } }));
  });
})();
