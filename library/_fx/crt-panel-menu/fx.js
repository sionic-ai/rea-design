(() => {
  // Original menu: the panel switches on like a CRT (1px line in the center → screen, brightness 3 → 1, .6s) and on closing folds to a line, then a dot (.4s).
  // On turning on it shows the channel number of the visible section, and when the pointer is over a link the number flickers and changes and the waveform below redraws with a new period.
  // Waveform: a light beam passes from left to right (3s, 2s on phones) drawing a new waveform, and the passed area remains as a faint afterimage.
  let made = 0;
  const grainOnce = () => {
    const root = document.documentElement;
    if (getComputedStyle(root).getPropertyValue("--fx-grain").trim()) return;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (!g) return;
    const img = g.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 40 + Math.random() * 50;
    }
    g.putImageData(img, 0, 0);
    root.style.setProperty("--fx-grain", `url(${c.toDataURL("image/png")})`);
  };
  const wavePath = (w, h, cycles, amp, phase) => {
    let d = "";
    for (let x = 0; x <= w + 2; x += 2) {
      const y = h / 2 - amp * Math.sin(Math.PI * 2 * ((x / w) * cycles) + phase);
      d += `${x ? "L" : "M"}${x} ${Math.round(y * 2) / 2}`;
    }
    return d;
  };

  kfFx.register("crt-panel-menu", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const toggle = part("toggle"), panel = part("panel");
    if (!toggle || !panel) return;
    grainOnce();
    const num = part("channel-num"), wave = part("wave");
    const links = [...panel.querySelectorAll("a[data-channel]")];
    const targets = links.map((a) => {
      const hash = a.hash ? decodeURIComponent(a.hash.slice(1)) : "";
      return hash ? document.getElementById(hash) : null;
    });
    const base = +(options.cycles || 7);
    const narrow = matchMedia(`(max-width: ${options.narrow || "37.5rem"})`);
    const ac = new AbortController();
    const on = { signal: ac.signal };
    const flick = (n) => {
      if (!n) return;
      n.classList.remove("is-on");
      void n.getBoundingClientRect();
      n.classList.add("is-on");
    };

    let cycles = base, now = { cycles, amp: 0.9, slow: 0 }, next = { cycles, amp: 0.85, slow: 0.4 };
    const lines = {};
    const fresh = (k = 1) => ({ cycles, amp: (0.75 + Math.random() * 0.25) * k, slow: next.slow + (Math.random() - 0.5) * 0.8 });
    const draw = (s, fine, slow) => {
      const w = wave.clientWidth, h = wave.clientHeight, a = h * (narrow.matches ? 0.22 : 0.3);
      fine.setAttribute("d", wavePath(w, h, s.cycles, a * s.amp, 0));
      slow.setAttribute("d", wavePath(w, h, 4, a * 0.6, s.slow));
    };
    const redraw = () => {
      if (!wave || !wave.clientWidth) return;
      wave.setAttribute("viewBox", `0 0 ${wave.clientWidth} ${wave.clientHeight}`);
      draw(now, lines.oldFine, lines.oldSlow);
      draw(next, lines.newFine, lines.newSlow);
      draw(next, lines.beamFine, lines.beamSlow);
    };
    if (wave) {
      const id = `fx-cpm-${++made}`;
      wave.innerHTML = `<defs><clipPath id="${id}-old"><rect class="fx-cpm-old" width="100%" height="100%"/></clipPath>`
        + `<clipPath id="${id}-new"><rect class="fx-cpm-new" width="100%" height="100%"/></clipPath>`
        + `<linearGradient id="${id}-fade"><stop offset="0" stop-color="white" stop-opacity="0"/><stop offset="1" stop-color="white" stop-opacity="1"/></linearGradient>`
        + `<mask id="${id}-beam"><rect class="fx-cpm-beam" x="-18%" width="18%" height="100%" fill="url(#${id}-fade)"/></mask></defs>`
        + `<g class="fx-cpm-glow"><g clip-path="url(#${id}-old)"><path class="fx-cpm-slow"/><path class="fx-cpm-fine"/></g>`
        + `<g clip-path="url(#${id}-new)"><path class="fx-cpm-slow"/><path class="fx-cpm-fine"/></g></g>`
        + `<g class="fx-cpm-ray" mask="url(#${id}-beam)"><path class="fx-cpm-slow"/><path class="fx-cpm-fine"/></g>`;
      const p = wave.querySelectorAll("path");
      [lines.oldSlow, lines.oldFine, lines.newSlow, lines.newFine, lines.beamSlow, lines.beamFine] = p;
      wave.querySelector(".fx-cpm-beam").addEventListener("animationiteration", () => {
        now = next;
        next = fresh();
        redraw();
      }, on);
      const ro = new ResizeObserver(redraw);
      ro.observe(wave);
      ac.signal.addEventListener("abort", () => ro.disconnect());
    }

    const tune = (ch, n) => {
      if (!num || num.textContent === ch) return;
      num.textContent = ch;
      flick(num);
      cycles = n;
      now = { ...next, cycles };
      next = fresh(1.3);
      redraw();
      flick(wave);
    };
    const current = () => {
      let ch = links[0]?.dataset.channel ?? "01";
      targets.forEach((t, i) => {
        if (t && t.getBoundingClientRect().top <= innerHeight / 2) ch = links[i].dataset.channel ?? ch;
      });
      return ch;
    };
    const isOpen = () => el.classList.contains("is-open");
    const set = (open) => {
      if (open === isOpen()) return;
      toggle.setAttribute("aria-expanded", String(open));
      panel.inert = !open;
      el.dispatchEvent(new CustomEvent("fx:menu", { bubbles: true, detail: { open } }));
      if (open) {
        el.classList.remove("is-closing");
        el.classList.add("is-open");
        if (num) num.textContent = current();
        panel.scrollTop = 0;
        redraw();
        panel.querySelector("a")?.focus({ preventScroll: true });
        return;
      }
      el.classList.remove("is-open");
      if (!reduce) el.classList.add("is-closing");
    };

    panel.inert = true;
    toggle.setAttribute("aria-expanded", "false");
    panel.addEventListener("animationend", (e) => {
      if (e.target === panel && e.animationName === "fx-cpm-off") el.classList.remove("is-closing");
    }, on);
    toggle.addEventListener("click", () => set(!isOpen()), on);
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) {
        set(false);
        toggle.focus();
      }
    }, on);
    links.forEach((a) => {
      const go = () => tune(a.dataset.channel ?? "01", +(a.dataset.cycles || base));
      a.addEventListener("pointerenter", go, on);
      a.addEventListener("focus", go, on);
    });
    panel.addEventListener("click", (e) => {
      if (e.target instanceof Element && e.target.closest("a[data-channel]")) set(false);
    }, on);

    return () => {
      ac.abort();
      if (isOpen()) el.dispatchEvent(new CustomEvent("fx:menu", { bubbles: true, detail: { open: false } }));
      el.classList.remove("is-open", "is-closing");
      toggle.setAttribute("aria-expanded", "false");
      panel.inert = false;
      if (wave) wave.innerHTML = "";
    };
  });
})();
