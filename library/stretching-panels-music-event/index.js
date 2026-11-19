// First page scenes: key visual (a ball of clumped city pieces), player (CD rolls to swap · play · waveform), concentric rotating text, event countdown.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Hero art: a neon collage of city fragments clustered into a ball ───────── */
  // The original is a 3D-rendered collage image. Redrawn at the same position and size with building fragments on a sphere surface, neon lines crossing, and a red channel offset
  const art = document.querySelector(".mt-visual__art");
  const S = art.width || 640;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // Canvas colors are read from skin variables — --site-* are expressions built from other variables, so paint them on a hidden element and take the computed color
  const probe = document.body.appendChild(Object.assign(document.createElement("i"), { hidden: true }));
  const col = (v) => ((probe.style.color = `var(${v})`), getComputedStyle(probe).color);
  const NEON = ["--kf-accent", "--site-neon-pink", "--site-hover-2", "--site-bar-2", "--site-bar-1", "--kf-surface", "--site-bar-5", "--site-bubble-1a", "--site-neon-orange"].map(col);
  const SKY = col("--site-night-sky"), INK = col("--kf-ink"), INK85 = col("--site-ink-85");
  probe.remove();
  const base = document.createElement("canvas");
  base.width = base.height = S;
  (() => {
    const g = base.getContext("2d");
    const c = S / 2;
    const R = S * 0.39;
    g.save();
    g.beginPath();
    g.arc(c, c, R, 0, Math.PI * 2);
    g.fillStyle = SKY;
    g.fill();
    g.clip();
    // From back faces to front faces — at each point on the orthographically projected sphere, a building piece flattened by the slope
    const pts = [];
    for (let i = 0; i < 1500; i++) {
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      pts.push({ x: r * Math.cos(th), y: u, z: r * Math.sin(th) });
    }
    pts.sort((a, b) => a.z - b.z);
    for (const p of pts) {
      if (p.z < -0.2) continue;
      const face = Math.max(0.15, p.z);
      const w = (10 + rnd() * 30) * face;
      const h = (10 + rnd() * 40) * face;
      const x = c + p.x * R;
      const y = c + p.y * R;
      g.globalAlpha = 0.35 + face * 0.65;
      g.fillStyle = NEON[Math.floor(rnd() * NEON.length)];
      g.fillRect(x - w / 2, y - h / 2, w, h);
      if (rnd() < 0.5) {
        g.fillStyle = SKY;
        const k = Math.max(2, w / 4);
        for (let yy = y - h / 2 + 2; yy < y + h / 2 - 2; yy += k * 1.6) g.fillRect(x - w / 2 + 2, yy, w - 4, k * 0.6);
      }
    }
    g.globalAlpha = 1;
    // Bright center pillar and round signboard
    for (let i = 0; i < 18; i++) {
      const x = c + (rnd() - 0.5) * R * 1.1;
      const y = c + (rnd() - 0.5) * R * 1.1;
      g.beginPath();
      g.arc(x, y, 4 + rnd() * 9, 0, Math.PI * 2);
      g.fillStyle = NEON[Math.floor(rnd() * NEON.length)];
      g.fill();
      g.lineWidth = 2;
      g.strokeStyle = INK;
      g.stroke();
    }
    g.restore();
    // Neon line (laser) crossing the sphere
    g.lineCap = "round";
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI;
      const off = (rnd() - 0.5) * R * 1.6;
      const dx = Math.cos(a) * R * 1.35;
      const dy = Math.sin(a) * R * 1.35;
      const ox = -Math.sin(a) * off;
      const oy = Math.cos(a) * off;
      g.strokeStyle = NEON[Math.floor(rnd() * 4)];
      g.globalAlpha = 0.55 + rnd() * 0.45;
      g.lineWidth = 1 + rnd() * 2.5;
      g.beginPath();
      g.moveTo(c + ox - dx, c + oy - dy);
      g.lineTo(c + ox + dx, c + oy + dy);
      g.stroke();
    }
    g.globalAlpha = 1;
    // Two white rings around the ball
    g.strokeStyle = INK85;
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(c, c, R * 1.04, R * 0.98, -0.2, 0, Math.PI * 2);
    g.stroke();
    g.lineWidth = 1.2;
    g.beginPath();
    g.ellipse(c, c, R * 1.12, R * 1.06, 0.3, 0, Math.PI * 2);
    g.stroke();
    // Red channel only, shifted 6px right — color misregistration in the original art
    const img = g.getImageData(0, 0, S, S);
    const d = img.data;
    const src = new Uint8ClampedArray(d);
    for (let y = 0; y < S; y++) {
      for (let x = S - 1; x >= 6; x--) {
        const i = (y * S + x) * 4;
        const j = (y * S + x - 6) * 4;
        d[i] = src[j];
        d[i + 3] = Math.max(src[i + 3], src[j + 3]);
      }
    }
    g.putImageData(img, 0, 0);
  })();
  // Bake the drawn plate into an image — when swapping in the real key visual, just change this img’s src and the glitch still applies
  art.src = base.toDataURL("image/png");

  // When the comment cursor pops out: like the original, the picture pops to 1.15x in .15s ease-in, and PowerGlitch glitches once for .15s
  window.mt.glitch = () => {
    if (reduce || !window.PowerGlitch) return;
    PowerGlitch.glitch(art, { timing: { iterations: 1 }, glitchTimeSpan: { start: 0, end: 0.15 } });
    art.style.transform = "scale(1.15)";
    setTimeout(() => (art.style.transform = "scale(1)"), 150);
  };

  /* ── Player ─────────────────────────────────────── */
  // As in the original, play with Howler (html5 audio) and hook that audio node into an AnalyserNode (fftSize 256 · smoothing .8) to draw frequency bars.
  // Audio doesn’t use the original files — for each track, a beat sound (low drum, high ping, hi-hat noise) of placeholder length is generated here as WAV
  const LENGTHS = [261, 386, 359, 392, 293, 338, 402, 295, 335, 464, 196, 195, 242, 217, 249, 317, 226, 208, 198, 309];
  const items = [...document.querySelectorAll(".mt-track")];
  const tracks = items.map((li, i) => ({
    title: li.dataset.title,
    artist: li.lastChild.textContent.trim(),
    // Track lengths (seconds) are the lengths of the original 20 audio tracks (measured from 128kbps file size) — when real audio is attached, change src to that file
    duration: LENGTHS[i % LENGTHS.length],
  }));
  const $ = (s) => document.querySelector(s);
  const now = $(".mt-now");
  const trackEl = $(".mt-player__track");
  const artistEl = $(".mt-player__artist");
  const playBtn = $(".mt-pbtn--play");
  const fill = $(".mt-progress__fill");
  const tNow = $(".mt-progress__now");
  const tDur = $(".mt-progress__dur");
  const cdWrap = $(".mt-cd-wrap");
  const loadingEl = $(".mt-cd__loading");
  let cd = $(".mt-cd");
  let index = 0;
  let playing = false;
  let loading = false;
  let sound = null;
  let swapping = null;
  const fmt = (s) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  const pad = (n) => String(n + 1).padStart(2, "0");

  const RATE = 22050;
  // Compute just one bar (four beats) and copy it to fill the song’s length — computing minutes of audio per sample freezes the screen for hundreds of ms after pressing
  const placeholder = (sec, n) => {
    const len = Math.round(sec * RATE), buf = new ArrayBuffer(44 + len), v = new DataView(buf), pcm = new Uint8Array(buf, 44);
    const str = (o, t) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF"); v.setUint32(4, 36 + len, true); str(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, RATE, true); v.setUint32(28, RATE, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); str(36, "data"); v.setUint32(40, len, true);
    const beat = 60 / (118 + (n % 5) * 6), bar = Math.min(len, Math.round(beat * 4 * RATE));
    let seed = n + 1;
    for (let i = 0; i < bar; i++) {
      const t = i / RATE, b = t % beat, half = (t + beat / 2) % beat;
      seed = (seed * 16807) % 2147483647;
      const kick = Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-b * 30)) * b) * Math.exp(-b * 9);
      const ding = Math.sin(2 * Math.PI * (440 + Math.floor(t / beat) * 110) * t) * Math.exp(-b * 5) * 0.35;
      const hat = (seed / 2147483647 - 0.5) * Math.exp(-half * 60) * 0.5;
      pcm[i] = 128 + Math.round(Math.max(-1, Math.min(1, (kick + ding + hat) * 0.3)) * 127);
    }
    for (let o = bar; o < len; o += bar) pcm.copyWithin(o, 0, Math.min(bar, len - o));
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  };

  // While playing the CD turns once every 4s. When stopped it rests at that angle
  let spin = null;
  const setSpin = () => {
    if (reduce) return;
    if (!spin) spin = gsap.to(cd, { rotation: "+=360", duration: 4, ease: "none", repeat: -1, paused: true });
    playing ? spin.play() : spin.pause();
  };

  const render = () => {
    const t = tracks[index];
    const pos = (sound && sound.seek()) || 0, dur = (sound && sound.duration()) || t.duration;
    now.textContent = `${pad(index)} ${t.title}`;
    trackEl.textContent = t.title;
    artistEl.textContent = t.artist;
    tDur.textContent = fmt(dur);
    tNow.textContent = fmt(pos);
    fill.style.width = (pos / dur) * 100 + "%";
    items.forEach((li, i) => li.classList.toggle("is-active", i === index));
    playBtn.classList.toggle("is-playing", playing);
    playBtn.setAttribute("aria-pressed", String(playing));
    // While the audio loads, a red LOADING... blinks at 0.2s
    loadingEl.classList.toggle("is-on", loading);
  };

  // When the track changes, the old CD rolls 100% sideways out (180°) and the new CD rolls in from the opposite side — 0.6s ease-in-out
  const swapDisc = (next, dir) => {
    if (swapping) {
      clearTimeout(swapping.timer);
      swapping.old.remove();
      swapping.fresh.removeAttribute("style");
    }
    const old = cd;
    const fresh = old.cloneNode(true);
    fresh.removeAttribute("style");
    fresh.querySelector(".mt-cd__art").dataset.label = `Track ${pad(next)} Cover · square artwork printed on a CD face · cropped to a circle`;
    if (spin) {
      spin.kill();
      spin = null;
    }
    if (reduce) {
      old.replaceWith(fresh);
      cd = fresh;
      return;
    }
    const from = dir === "prev" ? 1 : -1;
    Object.assign(fresh.style, { position: "absolute", top: "0", left: from * 100 + "%", width: "100%", opacity: "0", transform: `rotate(${from * 180}deg)`, transition: "all 0.6s ease-in-out" });
    old.style.transition = "all 0.6s ease-in-out";
    cdWrap.insertBefore(fresh, loadingEl);
    requestAnimationFrame(() => {
      old.style.transform = `translateX(${-from * 100}%) rotate(${-from * 180}deg)`;
      old.style.opacity = "0";
      Object.assign(fresh.style, { left: "0", opacity: "1", transform: "rotate(0deg)" });
    });
    cd = fresh;
    swapping = {
      old,
      fresh,
      timer: setTimeout(() => {
        old.remove();
        fresh.removeAttribute("style");
        swapping = null;
        setSpin();
      }, 600),
    };
  };

  // Waveform: 128 faint bars on the bottom (height 10~40% random), and while playing, analyzer frequency bars on top — the color is the player cell text color
  const wave = $(".mt-wave__canvas");
  const wctx = wave.getContext("2d");
  let ac = null, analyser = null, data = null, source = null, raf = 0;
  const size = () => {
    const dpr = devicePixelRatio || 1, r = wave.getBoundingClientRect();
    wave.width = r.width * dpr;
    wave.height = r.height * dpr;
    return { w: r.width, h: r.height, dpr };
  };
  const drawBack = () => {
    const { w, h, dpr } = size(), bw = w / 128;
    wctx.clearRect(0, 0, wave.width, wave.height);
    wctx.fillStyle = getComputedStyle(wave).color;
    wctx.globalAlpha = 0.1;
    for (let i = 0; i < 128; i++) {
      const bh = (0.3 * Math.random() + 0.1) * h;
      wctx.fillRect(i * bw * dpr, (h - bh) * dpr, (bw - 1) * dpr, bh * dpr);
    }
    wctx.globalAlpha = 1;
  };
  const drawLive = () => {
    raf = 0;
    // The original also stops the bars at phone width (768 or less) and in hidden tabs
    if (!analyser || !playing || innerWidth <= 768 || document.hidden) return;
    raf = requestAnimationFrame(drawLive);
    analyser.getByteFrequencyData(data);
    drawBack();
    const { w, h, dpr } = size(), bw = w / data.length;
    wctx.fillStyle = getComputedStyle(wave).color;
    for (let i = 0; i < data.length; i++) {
      const bh = (data[i] / 255) * h;
      wctx.fillRect(i * bw * dpr, (h - bh) * dpr, (bw - 1) * dpr, bh * dpr);
    }
  };
  const setupWave = () => {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (!analyser) {
        analyser = ac.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        data = new Uint8Array(analyser.frequencyBinCount);
        analyser.connect(ac.destination);
      }
      const node = sound && sound._sounds[0] && sound._sounds[0]._node;
      if (node && !node.__mt) {
        node.__mt = true;
        source = ac.createMediaElementSource(node);
        source.connect(analyser);
      }
    } catch (e) {
      analyser = null;
    }
  };
  drawBack();
  addEventListener("resize", drawBack);

  const unload = () => {
    if (!sound) return;
    const url = [].concat(sound._src)[0];
    sound.unload();
    sound = null;
    URL.revokeObjectURL(url);
  };
  const loadAndPlay = () => {
    if (loading) return;
    if (sound && sound.state() === "loaded") {
      sound.play();
      playing = true;
      render();
      setSpin();
      if (!raf) drawLive();
      return;
    }
    loading = true;
    render();
    if (ac && ac.state === "suspended") ac.resume();
    const t = tracks[index], at = index;
    // So the screen doesn’t freeze while placeholder audio is generated — the chosen track color and CD spin are drawn first, then the audio is made on the next frame
    requestAnimationFrame(() => setTimeout(() => {
    if (at !== index || !loading) return;
    sound = new Howl({
      src: [placeholder(t.duration, at)],
      format: ["wav"],
      html5: true,
      onload: () => {
        loading = false;
        render();
        setTimeout(() => {
          setupWave();
          if (ac && ac.state === "suspended") ac.resume();
          sound.play();
          playing = true;
          render();
          setSpin();
          if (!raf) drawLive();
        }, 100);
      },
      onloaderror: () => { loading = false; render(); },
      onend: () => select(index + 1, "next", true),
    });
    }, 0));
  };
  const select = (i, dir = "next", autoplay = playing) => {
    const n = (i + tracks.length) % tracks.length;
    if (n !== index) swapDisc(n, dir);
    unload();
    loading = false;
    index = n;
    playing = false;
    render();
    if (!swapping) setSpin();
    if (autoplay) loadAndPlay();
  };

  playBtn.addEventListener("click", () => {
    if (loading && !playing) return;
    if (playing) {
      sound && sound.pause();
      playing = false;
      cancelAnimationFrame(raf);
      raf = 0;
      render();
      setSpin();
    } else loadAndPlay();
  });
  $(".mt-pbtn--prev").addEventListener("click", () => select(index - 1, "prev"));
  $(".mt-pbtn--next").addEventListener("click", () => select(index + 1, "next"));
  [".mt-pbtn--share", ".mt-pbtn--down"].forEach((s) => $(s).addEventListener("click", (e) => e.preventDefault()));
  items.forEach((li, i) => {
    const go = () => select(i, i < index ? "prev" : "next", true);
    li.addEventListener("click", go);
    li.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go()));
  });
  $(".mt-progress__bar").addEventListener("click", (e) => {
    if (!sound) return;
    const r = e.currentTarget.getBoundingClientRect();
    sound.seek(((e.clientX - r.left) / r.width) * sound.duration());
    render();
  });
  // Original updateProgress: during playback, updates the current position and progress bar each frame
  gsap.ticker.add(() => {
    if (!playing || !sound) return;
    tNow.textContent = fmt(sound.seek() || 0);
    fill.style.width = ((sound.seek() || 0) / (sound.duration() || 1)) * 100 + "%";
  });
  render();

  /* ── Concentric rotating text ──────────────────────────────── */
  // From the innermost, one turn per 20 · 16.7 · 13.3 · 10 · 6.7s, with the direction alternating on each ring
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".mt-ring__turn").forEach((g) => {
      gsap.to(g, { rotation: 360 * +g.dataset.dir, svgOrigin: "200 200", duration: +g.dataset.dur, ease: "none", repeat: -1 });
    });
  });

  /* ── Countdown ────────────────────────────────────── */
  document.querySelectorAll(".mt-countdown").forEach((el) => {
    const target = new Date(el.dataset.target).getTime();
    const tick = () => {
      const left = target - Date.now();
      if (left < 0) {
        el.innerHTML = `<p>${el.dataset.over}</p>`;
        return false;
      }
      const d = Math.floor(left / 864e5);
      const h = Math.floor((left % 864e5) / 36e5);
      const m = Math.floor((left % 36e5) / 6e4);
      const s = Math.floor((left % 6e4) / 1e3);
      const p2 = (n) => String(n).padStart(2, "0");
      el.innerHTML = `<p>${p2(d)}days :</p><p>${p2(h)}h :</p><p>${p2(m)}min :</p><p>${p2(s)}sec</p>`;
      return true;
    };
    if (tick()) setInterval(tick, 1000);
  });
})();
