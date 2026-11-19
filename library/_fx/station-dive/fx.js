// Instead of scrolling the document, it moves between pinned section panels via stops — wheel and drag nudge the target a little (±.35 at a time, within ±1.3 of the current stop),
// 200ms after release, it goes .38 further in the pushed direction and snaps to the nearest stop, locking for 450ms. Position follows the target each frame by 1 − e^(−1.4·dt).
// For each section, writes opacity from the distance to its stop (1 − smoothstep(|distance|, .12, .4)) and --drift, adds is-in above .6 and removes it below .45.
// Also move with arrows, PageUp/Down, space, Home/End, data-dive-go="Key[:number]" Distant links skip across by covering and then lifting the curtain.
(() => {
  const smooth = (x, a, b) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  kfFx.register("station-dive", (el, { options, reduce }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="station"]')];
    if (!parts.length) return;
    const stations = [];
    parts.forEach((p) => {
      const n = Math.max(1, Math.round(+(p.getAttribute("data-stations") || 1)));
      for (let i = 0; i < n; i++) stations.push({ part: p, key: p.getAttribute("data-key") || "", sub: n > 1 ? i : null });
    });
    const count = stations.length;
    const follow = +(options.follow ?? 1.4), wheel = +(options.wheel ?? 0.0014), touch = +(options.touch ?? 0.0048);
    const step = +(options.step ?? 0.35), reach = +(options.reach ?? 1.3), idle = +(options.idle ?? 200);
    const bias = +(options.bias ?? 0.38), lock = +(options.lock ?? 450);
    const fadeIn = +(options["fade-in"] ?? 0.12), fadeOut = +(options["fade-out"] ?? 0.4);
    const veilIn = +(options["veil-in"] ?? 0.22), veilOut = +(options["veil-out"] ?? 0.55);
    const ignore = options.ignore || "form";
    let held = options.hold === "true";
    let target = 0, current = 0, rest = 0, lastInput = 0, lockUntil = 0, shownKey = null, veil = null, veilTl = null;
    const range = new Map();
    stations.forEach((s, i) => {
      const r = range.get(s.part);
      if (r) r[1] = i; else range.set(s.part, [i, i]);
    });
    const shown = new WeakMap();

    const stationOf = (key, sub = null) => stations.findIndex((s) => s.key === key && (sub === null || s.sub === sub || s.sub === null));

    function apply(e) {
      parts.forEach((p) => {
        const [a, b] = range.get(p);
        const d = e < a ? e - a : e > b ? e - b : 0;
        const w = p.kfWeight ?? 1;
        const o = (1 - smooth(Math.abs(d), fadeIn, fadeOut)) * w;
        const vis = o > 0.01 ? "visible" : "hidden";
        if (p.style.visibility !== vis) p.style.visibility = vis;
        p.style.opacity = o.toFixed(3);
        p.style.setProperty("--drift", d.toFixed(4));
        const on = shown.get(p) || false;
        if (!on && o > 0.6) { shown.set(p, true); p.classList.add("is-in"); }
        else if (on && o < 0.45) { shown.set(p, false); p.classList.remove("is-in"); }
        const live = o > 0.6;
        if (p.inert === live) { p.inert = !live; p.setAttribute("aria-hidden", live ? "false" : "true"); }
      });
      el.style.setProperty("--dive", (e / Math.max(1, count - 1)).toFixed(4));
      const s = stations[Math.round(e)];
      const key = `${s.key}:${s.sub ?? ""}`;
      if (key !== shownKey && Math.abs(e - Math.round(e)) < 0.05) {
        shownKey = key;
        document.querySelectorAll("[data-dive-go]").forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("data-dive-go").split(":")[0] === s.key));
        el.dispatchEvent(new CustomEvent("fx:station", { bubbles: true, detail: { index: Math.round(e), count, key: s.key, sub: s.sub } }));
      }
    }

    function goTo(i, { cut = false } = {}) {
      if (i < 0) return;
      const n = clamp(Math.round(i), 0, count - 1), d = n - current;
      if (cut && Math.abs(d) > 1.5 && !reduce) {
        if (!veil) { veil = document.createElement("div"); veil.className = "fx-dive-veil"; veil.setAttribute("aria-hidden", "true"); el.append(veil); }
        veilTl?.kill();
        veilTl = gsap.timeline()
          .to(veil, { opacity: 1, duration: veilIn, ease: "power2.in" })
          .call(() => { current = n - Math.sign(d) * 0.98; apply(current); })
          .to(veil, { opacity: 0, duration: veilOut, ease: "power2.out" });
      }
      rest = n; target = n; lastInput = 0;
    }

    const obs = window.Observer && Observer.create({
      target: window, type: "wheel,touch", tolerance: 4, preventDefault: true, ignore,
      onChangeY: (o) => {
        if (held) return;
        const now = performance.now();
        if (now < lockUntil) return;
        const isTouch = o.event?.type?.startsWith("touch") || o.event?.pointerType === "touch";
        const dy = isTouch ? -o.deltaY * touch : o.deltaY * wheel;
        target = clamp(target + clamp(dy, -step, step), Math.max(0, rest - reach), Math.min(count - 1, rest + reach));
        lastInput = now;
      },
    });

    const onKey = (ev) => {
      const tag = ev.target instanceof HTMLElement ? ev.target.tagName : "";
      if (held || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      if (ev.key === " " && (tag === "BUTTON" || tag === "A")) return;
      if (["ArrowDown", "PageDown", " "].includes(ev.key)) { ev.preventDefault(); goTo(rest + 1); }
      else if (["ArrowUp", "PageUp"].includes(ev.key)) { ev.preventDefault(); goTo(rest - 1); }
      else if (ev.key === "Home") goTo(0);
      else if (ev.key === "End") goTo(count - 1);
    };
    window.addEventListener("keydown", onKey);

    const onGo = (ev) => {
      const a = ev.target.closest?.("[data-dive-go]");
      if (!a) return;
      ev.preventDefault();
      const [k, sub] = a.getAttribute("data-dive-go").split(":");
      goTo(stationOf(k, sub === undefined ? null : +sub), { cut: true });
    };
    document.addEventListener("click", onGo);

    const tick = (time, deltaMs) => {
      const dt = Math.min(0.1, Math.max(0.001, (deltaMs || 16) / 1000));
      if (lastInput && performance.now() - lastInput > idle) {
        const dir = Math.sign(target - rest), to = clamp(Math.round(target + dir * bias), 0, count - 1);
        if (to !== rest) lockUntil = performance.now() + lock;
        rest = to; target = rest; lastInput = 0;
      }
      const k = reduce ? 1 : 1 - Math.exp(-dt * follow);
      current += (target - current) * k;
      if (Math.abs(target - current) < 4e-4) current = target;
      apply(current);
    };
    el.kfStationDive = {
      get pos() { return current; },
      get rest() { return rest; },
      get target() { return target; },
      count,
      stations,
      stationOf,
      goTo,
      hold(v) { held = !!v; },
    };
    gsap.ticker.add(tick);
    apply(0);

    return () => {
      gsap.ticker.remove(tick);
      obs?.kill();
      veilTl?.kill();
      veil?.remove();
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onGo);
      parts.forEach((p) => { p.style.removeProperty("visibility"); p.style.removeProperty("opacity"); p.style.removeProperty("--drift"); p.classList.remove("is-in"); p.inert = false; p.removeAttribute("aria-hidden"); });
      el.style.removeProperty("--dive");
      delete el.kfStationDive;
    };
  });
})();
