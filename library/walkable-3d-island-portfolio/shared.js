// Overlay UI outside the world — key input, joystick, sound, notes. The world (index.js) reads it only through window.MF.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Same check as the original: on touch devices, open with joystick · tap and place the camera farther back (7.5)
  const touch =
    navigator.userAgentData?.mobile ||
    /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) ||
    (matchMedia("(pointer: coarse)").matches && !matchMedia("(hover: hover)").matches);

  const keys = { forward: false, backward: false, left: false, right: false };
  const KEYMAP = {
    KeyW: "forward", ArrowUp: "forward", KeyS: "backward", ArrowDown: "backward",
    KeyA: "left", ArrowLeft: "left", KeyD: "right", ArrowRight: "right",
  };
  const handlers = { jump: [], sprint: [], activate: [] };
  const on = (name, fn) => handlers[name].push(fn);
  const emit = (name, v) => handlers[name].forEach((fn) => fn(v));

  addEventListener("keydown", (e) => {
    if (KEYMAP[e.code]) { keys[KEYMAP[e.code]] = true; e.preventDefault(); }
    else if (e.code === "Space") { if (!e.repeat) emit("jump"); e.preventDefault(); }
    else if (e.key === "Shift") emit("sprint", true);
    else if (e.key === "Enter" && !e.target.closest("button")) emit("activate");
  });
  addEventListener("keyup", (e) => {
    if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false;
    else if (e.key === "Shift") emit("sprint", false);
  });
  addEventListener("blur", () => { for (const k in keys) keys[k] = false; });

  const joy = { angle: undefined, el: document.querySelector(".mf-joystick") };
  if (joy.el) {
    const knob = joy.el.querySelector(".mf-joystick__knob");
    let id = null;
    const move = (e) => {
      const r = joy.el.getBoundingClientRect();
      let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const max = r.width / 2, len = Math.hypot(dx, dy);
      if (len > max) { dx *= max / len; dy *= max / len; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      joy.angle = len > 4 ? Math.atan2(-dy, dx) : undefined;
    };
    joy.el.addEventListener("pointerdown", (e) => { id = e.pointerId; joy.el.setPointerCapture(id); joy.el.classList.add("is-active"); move(e); });
    joy.el.addEventListener("pointermove", (e) => e.pointerId === id && move(e));
    const end = () => { id = null; joy.angle = undefined; knob.style.transform = ""; joy.el.classList.remove("is-active"); };
    joy.el.addEventListener("pointerup", end);
    joy.el.addEventListener("pointercancel", end);
  }

  // Played with howler like the original — volumes (wind .09 · running .4 · platform .09 · portal .7 · hammer .5), looping, speed (running 1.1) and distance rules are the original values,
  // Sound files are our own newly made sounds at the original lengths (media/). Opened via file:// the sound files can’t load, so it runs silent.
  const sound = (() => {
    const VOL = { ambient: 0.09, running: 0.4, plate: 0.09, portal: 0.7, hammer: 0.5 };
    let enabled = true, started = false, running = false, made = null;
    // If three.cjs is loaded as a plain script, three’s AudioContext · Audio classes shadow the global names and howler picks those up —
    // The context is built directly from the browser’s own (window.AudioContext), and the HTML5 audio set (new Audio) is not used
    const context = () => {
      if (Howler.ctx) return;
      Howler.html5PoolSize = 0;
      // If the sample rate isn’t 44100, howler discards the context on the first touch and recreates it (as a safeguard for mobile browsers), and this catches the name that gets hidden then
      Howler._mobileUnloaded = true;
      Howler.ctx = new window.AudioContext();
      Howler.masterGain = Howler.ctx.createGain();
      Howler.masterGain.gain.setValueAtTime(enabled ? 1 : 0, Howler.ctx.currentTime);
      Howler.masterGain.connect(Howler.ctx.destination);
      Howler._setup();
    };
    const make = () => (made ??= {
      ambient: new Howl({ src: ["media/ambient.webm"], loop: true, volume: VOL.ambient }),
      running: new Howl({ src: ["media/running.mp3"], loop: true, volume: VOL.running, rate: 1.1 }),
      plate: new Howl({ src: ["media/pressure-plate.mp3"], volume: VOL.plate }),
      portal: new Howl({ src: ["media/portal.mp3"], loop: true, volume: 0 }),
      hammer: new Howl({ src: ["media/hammer.mp3"], volume: 0 }),
    });
    // Original distance rule: distance < At max: min(gain / distance, cap) × sound volume, otherwise 0
    const near = (d, max, gain, cap, vol) => (d < max ? Math.min(gain / d, cap) * vol : 0);
    return {
      start() {
        if (started || !window.Howl || location.protocol === "file:") return;
        context();
        const h = make();
        started = true;
        h.ambient.play();
        h.portal.play();
      },
      get enabled() { return enabled; },
      // If mute is called before the context exists, howler creates one itself and grabs the shadowed name — until then only enabled is remembered and used in context()
      toggle() { enabled = !enabled; if (window.Howler?.ctx) Howler.mute(!enabled); return enabled; },
      run(on) {
        if (!made || on === running) return;
        running = on;
        on ? made.running.play() : made.running.stop();
      },
      hammer(d) { if (!made) return; made.hammer.volume(near(d, 17, 1, 0.2, VOL.hammer)); made.hammer.play(); },
      portalAt(d) { if (made) made.portal.volume(near(d, 13, 2, 0.8, VOL.portal)); },
      plate() { if (!made) return; made.plate.volume(VOL.plate); made.plate.seek(0); made.plate.play(); },
    };
  })();
  document.addEventListener("visibilitychange", () => window.Howler?.ctx && Howler.mute(!sound.enabled || document.visibilityState === "hidden"));

  const btn = document.querySelector(".mf-sound");
  btn?.addEventListener("click", () => btn.setAttribute("aria-pressed", String(sound.toggle())));

  const toastEl = document.querySelector(".mf-toast");
  let toastTween = null;
  const toast = (text) => {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastTween?.kill();
    toastTween = gsap.timeline()
      .to(toastEl, { opacity: 1, duration: 0.3, ease: "power2.out" })
      .to(toastEl, { opacity: 0, duration: 0.3, ease: "power2.in" }, "+=2.2");
  };

  // The world is painted with canvas·WebGL, so CSS variables can’t be used directly — paint the skin (--site-*, or --kf-* if absent) onto a hidden element and read the computed rgb.
  // Relative colors (oklch(from …)) are also resolved by the browser by painting onto one canvas pixel and reading it
  const probe = document.createElement("i");
  probe.hidden = true;
  document.body.append(probe);
  const dot = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const color = (name, alpha = 1) => {
    probe.style.color = `var(--site-${name}, var(--kf-${name}))`;
    dot.clearRect(0, 0, 1, 1);
    dot.fillStyle = getComputedStyle(probe).color;
    dot.fillRect(0, 0, 1, 1);
    const [r, g, b] = dot.getImageData(0, 0, 1, 1).data;
    return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const font = (name, fallback = "--kf-font-display") => {
    const css = getComputedStyle(document.documentElement);
    return css.getPropertyValue(name).trim() || css.getPropertyValue(fallback).trim();
  };

  window.MF = { reduce, touch, keys, joy, on, sound, toast, soundButton: btn, color, font };
})();
