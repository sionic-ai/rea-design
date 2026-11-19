(() => {
  const vt = (window.vt = window.vt || {});
  const root = document.documentElement;
  vt.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  vt.coarse = matchMedia("(pointer: coarse)").matches;

  // Resolves skin variables to real colors for WebGL — values like color-mix are also painted on a 1px canvas and read
  const probe = document.createElement("i");
  probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  vt.color = (value) => {
    if (!probe.isConnected) document.body.appendChild(probe);
    probe.style.color = value.startsWith("--") ? `var(${value})` : value;
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = getComputedStyle(probe).color;
    pix.fillRect(0, 0, 1, 1);
    const d = pix.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  vt.css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  vt.wait = (s) => new Promise((r) => setTimeout(r, s * 1000));

  // Loader: the bar fills following the slower of actual progress (up to 99% until ready) and the minimum 1 second
  vt.progress = 0;
  vt.loader = () => {
    const bar = document.querySelector(".js-loader-bar"), pct = document.querySelector(".js-loader-percent"), t0 = performance.now();
    let ready = false;
    const finished = new Promise((res) => {
      const step = () => {
        const real = ready ? 1 : vt.progress * 0.99;
        const v = Math.min(real, vt.reduce ? 1 : (performance.now() - t0) / 1000);
        if (bar) bar.style.transform = `scaleX(${v})`;
        if (pct) pct.textContent = `${Math.floor(v * 100)}%`;
        if (v >= 1) return res();
        requestAnimationFrame(step);
      };
      step();
    });
    return { finished, markReady: () => (ready = true) };
  };

  // Entry door: ”Enter” turns sound on, ”Without sound” enters as is
  vt.enter = (gate, turnOn) => new Promise((res) => {
    document.querySelectorAll(".js-enter").forEach((b) => b.addEventListener("click", () => {
      if (gate.hasAttribute("data-entered")) return;
      gate.toggleAttribute("data-entered", true);
      if (b.dataset.sound === "on") turnOn?.();
      res();
    }));
  });

  // Header subtitle: types four sentences one character at a time at .045s, holds 2.8s, erases at .02s, then pauses .4s
  const LEADS = ["Your About sentence here.", "Your second sentence goes here.", "Your slightly longer third sentence goes here.", "Your last sentence here. Time does the rest."];
  vt.typeLead = async () => {
    const el = document.querySelector(".js-header-lead");
    if (!el) return;
    if (vt.reduce) { el.textContent = LEADS[0]; return; }
    for (let i = 0; ; i = (i + 1) % LEADS.length) {
      const s = LEADS[i];
      for (let k = 1; k <= s.length; k++) { el.textContent = s.slice(0, k); await vt.wait(0.045); }
      await vt.wait(2.8);
      for (let k = s.length - 1; k >= 0; k--) { el.textContent = s.slice(0, k); await vt.wait(0.02); }
      await vt.wait(0.4);
    }
  };

  // Sound: our own WebAudio synthesis — a low chord of 55·82.5·110Hz filtered by a low-pass (320Hz, Q4) with the filter breathing at .06Hz.
  // Lays a faint band-noise (700Hz) underneath, the faster the box is spun (intensity), the more the filter opens and the brighter the grain gets. On/off .8s/.3s, a 2kHz tick every second
  const S = { VOLUME: 0.35, CUTOFF: 320, FADE_IN: 0.8, FADE_OUT: 0.3, FOLLOW: 0.15, SWELL_FOLLOW: 0.3, TICK: { gain: 0.15, length: 0.03, frequency: 2000, attack: 0.001, decay: 0.006 } };
  const sound = (vt.sound = { on: false, ctx: null });
  const setup = () => {
    const c = (sound.ctx = new AudioContext());
    sound.master = c.createGain(); sound.master.gain.value = 0; sound.master.connect(c.destination);
    sound.swell = c.createGain(); sound.swell.connect(sound.master);
    sound.filter = c.createBiquadFilter(); sound.filter.type = "lowpass"; sound.filter.frequency.value = S.CUTOFF; sound.filter.Q.value = 4; sound.filter.connect(sound.swell);
    sound.osc = [["sine", 55, 0, 0.5], ["sine", 82.5, 6, 0.25], ["triangle", 110, -5, 0.12]].map(([type, f, det, g]) => {
      const o = c.createOscillator(), gn = c.createGain();
      o.type = type; o.frequency.value = f; o.detune.value = det; gn.gain.value = g;
      o.connect(gn).connect(sound.filter); o.start();
      return { o, det };
    });
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = 0.06; lg.gain.value = 120; lfo.connect(lg).connect(sound.filter.frequency); lfo.start();
    const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const n = c.createBufferSource(); n.buffer = buf; n.loop = true;
    sound.band = c.createBiquadFilter(); sound.band.type = "bandpass"; sound.band.frequency.value = 700; sound.band.Q.value = 0.6;
    sound.noise = c.createGain(); sound.noise.gain.value = 0.03;
    n.connect(sound.band).connect(sound.noise).connect(sound.swell); n.start();
    const T = S.TICK, tb = c.createBuffer(1, Math.ceil(c.sampleRate * T.length), c.sampleRate), td = tb.getChannelData(0);
    for (let i = 0; i < td.length; i++) { const t = i / c.sampleRate; td[i] = Math.sin(2 * Math.PI * T.frequency * t) * Math.min(t / T.attack, 1) * Math.exp(-t / T.decay); }
    sound.tickBuf = tb; sound.tickGain = c.createGain(); sound.tickGain.gain.value = T.gain * S.VOLUME; sound.tickGain.connect(c.destination);
  };
  sound.toggle = async () => {
    if (!sound.ctx) setup();
    sound.on = !sound.on;
    const t = sound.ctx.currentTime;
    if (sound.on) { await sound.ctx.resume(); sound.master.gain.setTargetAtTime(S.VOLUME, t, S.FADE_IN); }
    else sound.master.gain.setTargetAtTime(0, t, S.FADE_OUT);
    return sound.on;
  };
  sound.tick = () => {
    if (!sound.on) return;
    const s = sound.ctx.createBufferSource(); s.buffer = sound.tickBuf; s.connect(sound.tickGain); s.start();
  };
  sound.intensity = (e) => {
    if (!sound.on) return;
    const t = sound.ctx.currentTime;
    sound.filter.frequency.setTargetAtTime(S.CUTOFF + e * 2400, t, S.FOLLOW);
    sound.filter.Q.setTargetAtTime(4 + e * 6, t, S.FOLLOW);
    sound.osc.forEach(({ o, det }) => o.detune.setTargetAtTime(det + e * 40, t, S.FOLLOW));
    sound.noise.gain.setTargetAtTime(0.03 + e * 0.12, t, S.FOLLOW);
    sound.band.frequency.setTargetAtTime(700 + e * 1600, t, S.FOLLOW);
    sound.swell.gain.setTargetAtTime(1 + e * 0.3, t, S.SWELL_FOLLOW);
  };
  const btn = document.querySelector(".js-sound"), label = document.querySelector(".js-sound-label");
  vt.toggleSound = async () => {
    const on = await sound.toggle();
    if (label) label.textContent = on ? "On" : "Blink";
    btn?.setAttribute("aria-pressed", String(on));
  };
  btn?.addEventListener("click", vt.toggleSound);
})();
