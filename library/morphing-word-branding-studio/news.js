// News — category filtering and Sound while reading (the original uses built-in sound — here WebAudio noise is filtered to make rain, wave, wind and fire textures)
(() => {
  const btns = document.querySelectorAll("[data-filter]"), grid = document.querySelector("[data-grid]"), empty = document.querySelector("[data-empty]");
  const pick = (f) => {
    btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === f)));
    let n = 0;
    grid?.querySelectorAll("[data-cat]").forEach((c) => { const on = f === "all" || c.dataset.cat === f; c.hidden = !on; if (on) n++; });
    grid?.classList.toggle("journal-filtered", f !== "all");
    if (empty) empty.hidden = n > 0;
  };
  btns.forEach((b) => b.addEventListener("click", () => pick(b.dataset.filter || "all")));

  const card = document.querySelector("[data-ambient]");
  if (!card) return;
  const toggle = card.querySelector("[data-amb-toggle]"), chips = [...card.querySelectorAll("[data-sound]")];
  const SHAPE = { rain: [2400, 0.6, "highpass"], waves: [380, 0.9, "lowpass"], wind: [900, 4, "bandpass"], fire: [1800, 1.2, "bandpass"] };
  let ctx = null, src = null, filt = null, gain = null, sound = "rain";
  const start = () => {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b = (b + 0.02 * w) / 1.02; d[i] = sound === "rain" || sound === "fire" ? w * 0.4 : b * 3.5; }
    src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const [f, q, type] = SHAPE[sound];
    filt = ctx.createBiquadFilter(); filt.type = type; filt.frequency.value = f; filt.Q.value = q;
    gain = ctx.createGain(); gain.gain.value = 0; gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.2);
    src.connect(filt).connect(gain).connect(ctx.destination); src.start();
  };
  const stop = () => { if (!src) return; gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); const s = src; setTimeout(() => s.stop(), 450); src = null; };
  toggle.addEventListener("click", () => {
    const on = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(on)); card.classList.toggle("playing", on);
    on ? start() : stop();
  });
  chips.forEach((c) => c.addEventListener("click", () => {
    sound = c.dataset.sound;
    chips.forEach((x) => { const sel = x === c; x.setAttribute("aria-pressed", String(sel)); x.classList.toggle("chip--ink", sel); x.classList.toggle("chip--outline", !sel); });
    if (src) { stop(); setTimeout(start, 460); }
  }));
})();
