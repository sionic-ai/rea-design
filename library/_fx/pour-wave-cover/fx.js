// Blood swelling cover — a curtain with a 13-point wave leading edge pours from above and covers the screen.
// On a link it covers then navigates, and if the navigated page has even one of this part, the curtain slides down and clears. On a button it covers then retracts.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const KEY = "kf-fx-pour-wave";
  const WAVE = [0.1, 0.25, 1, 0.15, 0, 0.55, 0.1, 0.05, 0.85, 0.2, 0, 0.4, 0.1];
  const inOutQuad = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const front = (y, t, amp) => WAVE.map((v, i) => {
    const edge = i === 0 || i === WAVE.length - 1;
    const swell = 1 + 0.3 * Math.sin(3.1 * t + 2.1 * i);
    return [(i / (WAVE.length - 1)) * 100 + (edge ? 0 : 0.8 * Math.sin(3.7 * t + 0.9 * i)), y + v * amp * swell + 2.5 * Math.sin(2.4 * t + 1.3 * i)];
  });
  const curve = (pts) => {
    const at = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
    let d = "";
    for (let i = 0; i < pts.length - 1; i++) {
      const a = at(i - 1), b = at(i), c = at(i + 1), e = at(i + 2);
      d += `C${(b[0] + (c[0] - a[0]) / 6).toFixed(2)},${(b[1] + (c[1] - a[1]) / 6).toFixed(2)},${(c[0] - (e[0] - b[0]) / 6).toFixed(2)},${(c[1] - (e[1] - b[1]) / 6).toFixed(2)},${c[0].toFixed(2)},${c[1].toFixed(2)}`;
    }
    return d;
  };
  // One overlay per screen — shared by several links
  let veil = null;
  function makeVeil() {
    if (veil) return veil;
    const host = document.createElement("div");
    host.className = "fx-pour-veil";
    host.setAttribute("aria-hidden", "true");
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    const path = document.createElementNS(NS, "path");
    svg.append(path);
    host.append(svg);
    document.body.append(host);
    let p = 0, dir = 0, raf = 0, last = 0, done = null, leaving = false, ms = 750, amp = 18;
    const draw = (t) => {
      const e = inOutQuad(p);
      if (leaving) {
        const pts = front(127 * e - 4.5, t, -amp);
        path.setAttribute("d", `M${pts[0][0]},${pts[0][1].toFixed(2)}${curve(pts)}L100,105L0,105Z`);
      } else {
        const pts = front(127 * e - 22.5, t, amp).reverse();
        path.setAttribute("d", `M0,-5L100,-5L${pts[0][0]},${pts[0][1].toFixed(2)}${curve(pts)}Z`);
      }
    };
    const tick = (now) => {
      const dt = last ? Math.max(1, now - last) : 16;
      last = now;
      p = Math.max(0, Math.min(1, p + (dir * dt) / ms));
      draw(now / 1000);
      if ((dir > 0 && p >= 1) || (dir < 0 && p <= 0)) {
        raf = 0; last = 0; dir = 0;
        const cb = done; done = null; cb?.();
      } else raf = requestAnimationFrame(tick);
    };
    const run = (d, cb) => { dir = d; done = cb || null; if (!raf) raf = requestAnimationFrame(tick); };
    const set = (v) => { cancelAnimationFrame(raf); raf = 0; last = 0; dir = 0; done = null; leaving = false; p = v; draw(0); };
    draw(0);
    veil = {
      host,
      tune: (o) => { ms = Math.max(1, +(o.dur ?? 0.75) * 1000); amp = +(o.amp ?? 18); host.dataset.look = o.look || ""; },
      pour: (cb) => { host.classList.add("is-on"); if (leaving) set(0); run(1, cb); },
      drain: (cb) => run(-1, () => { host.classList.remove("is-on"); cb?.(); }),
      exit: (cb) => { host.classList.add("is-on"); set(0); leaving = true; draw(0); run(1, () => { host.classList.remove("is-on"); cb?.(); }); },
      cover: () => { host.classList.add("is-on"); set(1); },
      clear: () => { set(0); host.classList.remove("is-on"); },
    };
    addEventListener("pageshow", (e) => { if (e.persisted) veil.clear(); });
    return veil;
  }
  // Arrival: if the previous page came in covering, start covered and slide down
  let arrived = false;
  const arrive = (options, reduce) => {
    if (arrived) return;
    arrived = true;
    let look = null;
    try { look = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch {}
    if (look === null || reduce) return;
    const v = makeVeil();
    v.tune({ ...options, look });
    v.cover();
    requestAnimationFrame(() => v.exit());
  };

  kfFx.register("pour-wave-cover", (el, { options, reduce }) => {
    arrive(options, reduce);
    if (reduce) return;
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const v = makeVeil();
      v.tune(options);
      const href = el.getAttribute("href");
      if (el.tagName === "A" && href && !href.startsWith("#") && !el.target && !el.hasAttribute("download")) {
        const url = new URL(el.href, location.href);
        if (url.origin !== location.origin || url.protocol === "mailto:") return;
        e.preventDefault();
        v.pour(() => {
          try { sessionStorage.setItem(KEY, options.look || ""); } catch {}
          location.href = url.href;
        });
        return;
      }
      e.preventDefault();
      v.pour(() => setTimeout(() => v.drain(), +(options.hold ?? 0.4) * 1000));
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  });
})();
