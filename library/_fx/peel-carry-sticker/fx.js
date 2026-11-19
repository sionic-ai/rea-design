// Peel the sticker with Peel.js, and once more than half is peeled move it to body and attach it to the hand, then throw it on release. After it falls, it is stuck back in place.
(() => {
  kfFx.register("peel-carry-sticker", (n, { options, reduce }) => {
    const art = n.querySelector("[data-fx-part=art]");
    if (!art || reduce) return;
    const back = +(options.back ?? 2500), gravity = +(options.gravity ?? 1600), threshold = +(options.threshold ?? 0.5);
    const out3 = (t) => 1 - (1 - t) ** 3;
    const box = document.createElement("div"), top = document.createElement("div");
    box.className = "peel-box"; top.className = "peel-top";
    art.replaceWith(box); top.append(art); box.append(top);
    let peel = null, w = 0, h = 0, alive = true;
    const setup = () => {
      const Peel = window.Peel;
      w = art.offsetWidth; h = art.offsetHeight;
      if (!Peel || !w || !h) return false;
      box.style.width = `${w}px`; box.style.height = `${h}px`;
      const backL = document.createElement("div"); backL.className = "peel-back";
      const copy = art.cloneNode(true);
      copy.querySelectorAll("[id]").forEach((x) => x.removeAttribute("id"));
      backL.append(copy);
      const bottom = document.createElement("div"); bottom.className = "peel-bottom";
      box.append(backL, bottom);
      peel = new Peel(box, { topShadow: false, backShadow: false, backReflection: false, bottomShadow: false });
      return true;
    };
    let keepClip = "";
    const flat = (on) => {
      if (!peel) return;
      if (on) { keepClip ||= peel.topLayer.style.clipPath; peel.topLayer.style.clipPath = "none"; peel.backLayer.style.visibility = "hidden"; }
      else { if (keepClip) peel.topLayer.style.clipPath = keepClip; peel.backLayer.style.visibility = ""; }
    };
    const rotOf = () => parseFloat(getComputedStyle(n).getPropertyValue("--rot")) || 0;
    const local = (cx, cy) => {
      const r = box.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
      const a = (rotOf() * Math.PI) / 180, s = parseFloat(getComputedStyle(n).scale) || 1, dx = (cx - mx) / s, dy = (cy - my) / s;
      return { x: dx * Math.cos(-a) - dy * Math.sin(-a) + w / 2, y: dx * Math.sin(-a) + dy * Math.cos(-a) + h / 2 };
    };
    const edge = (p) => {
      let dx = p.x - w / 2, dy = p.y - h / 2;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) { dx = 1; dy = 1; }
      const k = Math.min(Math.abs(w / 2 / (dx || 1e-6)), Math.abs(h / 2 / (dy || 1e-6)));
      return { x: w / 2 + dx * k, y: h / 2 + dy * k };
    };
    let state = "idle", corner = { x: 0, y: 0 }, start = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, last = { x: 0, y: 0, t: 0 }, vel = { x: 0, y: 0 };
    const track = (e) => {
      const now = performance.now(), k = Math.max(1, now - last.t) / 16;
      vel = { x: vel.x * 0.5 + ((e.clientX - last.x) / k) * 0.5, y: vel.y * 0.5 + ((e.clientY - last.y) / k) * 0.5 };
      last = { x: e.clientX, y: e.clientY, t: now };
    };
    const ease = (from, ms, done) => {
      const t0 = performance.now();
      const f = (now) => { if (!alive) return; const k = Math.min(1, (now - t0) / ms), q = out3(k); peel.setPeelPosition(from.x + (corner.x - from.x) * q, from.y + (corner.y - from.y) * q); k < 1 ? requestAnimationFrame(f) : done(); };
      requestAnimationFrame(f);
    };
    const down = (e) => {
      if (state !== "idle" || (!peel && !setup())) return;
      e.preventDefault();
      state = "peeling"; n.classList.add("is-peeling"); n.setPointerCapture?.(e.pointerId);
      const p = local(e.clientX, e.clientY);
      corner = edge(p); flat(false);
      peel.corner = peel.getPoint(corner.x, corner.y);
      peel.setPeelPosition(corner.x, corner.y);
      start = p; cur = { ...corner }; last = { x: e.clientX, y: e.clientY, t: performance.now() }; vel = { x: 0, y: 0 };
    };
    const move = (e) => {
      if (state !== "peeling") return;
      track(e);
      const p = local(e.clientX, e.clientY);
      cur = { x: corner.x + (p.x - start.x), y: corner.y + (p.y - start.y) };
      peel.setPeelPosition(cur.x, cur.y);
      if (peel.getAmountClipped() > threshold) carry(e);
    };
    let home = null, pos = { x: 0, y: 0 }, aim = { x: 0, y: 0 }, grab = { x: 0, y: 0 }, rot0 = 0, tilt = 0, lift = 0;
    const paint = () => {
      n.style.left = `${pos.x}px`; n.style.top = `${pos.y}px`;
      n.style.transform = `rotate(${rot0 + tilt}deg) scale(${1 + 0.08 * lift})`;
    };
    const follow = () => {
      if (state !== "carried" || !alive) return;
      pos.x += (aim.x - pos.x) * 0.22; pos.y += (aim.y - pos.y) * 0.22;
      lift += (1 - lift) * 0.15;
      tilt += (Math.max(-16, Math.min(16, vel.x * 1.2)) - tilt) * 0.15;
      paint(); requestAnimationFrame(follow);
    };
    function carry(e) {
      state = "carried"; n.classList.remove("is-peeling");
      ease({ ...cur }, 160, () => flat(true));
      lift = 0;
      const r = n.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      home = { parent: n.parentElement, next: n.nextSibling, style: n.getAttribute("style") ?? "" };
      rot0 = rotOf();
      const sc = parseFloat(getComputedStyle(n).scale) || 1;
      document.body.append(n);
      Object.assign(n.style, { position: "fixed", right: "auto", bottom: "auto", margin: "0", translate: "none", zIndex: "999", animation: "none", transition: "none", cursor: "grabbing" });
      const ow = n.offsetWidth, oh = n.offsetHeight;
      pos = { x: cx - ow / 2, y: cy - oh / 2 };
      const a = (rot0 * Math.PI) / 180, bx = (corner.x - w / 2) * sc, by = (corner.y - h / 2) * sc;
      grab = { x: ow / 2 + bx * Math.cos(a) - by * Math.sin(a), y: oh / 2 + bx * Math.sin(a) + by * Math.cos(a) };
      aim = { x: e.clientX - grab.x, y: e.clientY - grab.y };
      paint(); requestAnimationFrame(follow);
    }
    const docMove = (e) => { if (state === "carried") { track(e); aim = { x: e.clientX - grab.x, y: e.clientY - grab.y }; } };
    let backTimer = 0;
    const drop = () => {
      if (state !== "carried") return;
      state = "falling"; n.style.pointerEvents = "none";
      let x = 0, y = 0, r = rot0 + tilt, vx = Math.max(-900, Math.min(900, vel.x * 40)), vy = Math.max(-500, Math.min(600, vel.y * 40)) - 120;
      const spin = vx * 0.35 + (Math.random() - 0.5) * 120, y0 = pos.y;
      let t0 = performance.now();
      const fall = (now) => {
        if (!alive) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - t0) / 1000)); t0 = now;
        vy += gravity * dt; x += vx * dt; y += vy * dt; vx *= 1 - 0.6 * dt; r += spin * dt;
        n.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${1 + 0.08 * lift})`;
        if (y0 + y < innerHeight + 40) requestAnimationFrame(fall);
        else { n.style.visibility = "hidden"; backTimer = setTimeout(restore, back); }
      };
      requestAnimationFrame(fall);
    };
    const restore = () => {
      if (!home) return;
      home.parent.insertBefore(n, home.next);
      n.setAttribute("style", home.style); n.style.animationDelay = "0s";
      tilt = 0; state = "idle"; home = null;
    };
    const release = () => { if (state === "peeling") { n.classList.remove("is-peeling"); state = "idle"; ease({ ...cur }, 380, () => { if (state === "idle") flat(true); }); } };
    n.addEventListener("pointerdown", down);
    n.addEventListener("pointermove", move);
    n.addEventListener("pointerup", release);
    n.addEventListener("pointercancel", release);
    document.addEventListener("pointermove", docMove);
    document.addEventListener("pointerup", drop);
    document.addEventListener("pointercancel", drop);
    const ro = new ResizeObserver(() => {
      if (!peel) return;
      const nw = art.offsetWidth, nh = art.offsetHeight;
      if (nw !== w || nh !== h) { w = nw; h = nh; box.style.width = `${w}px`; box.style.height = `${h}px`; peel.setupDimensions?.(); peel.setPeelPosition(corner.x, corner.y); }
    });
    ro.observe(art);
    return () => {
      alive = false; clearTimeout(backTimer); ro.disconnect();
      n.removeEventListener("pointerdown", down); n.removeEventListener("pointermove", move);
      n.removeEventListener("pointerup", release); n.removeEventListener("pointercancel", release);
      document.removeEventListener("pointermove", docMove); document.removeEventListener("pointerup", drop); document.removeEventListener("pointercancel", drop);
      if (home) restore();
      box.replaceWith(art);
      n.classList.remove("is-peeling");
    };
  });
})();
