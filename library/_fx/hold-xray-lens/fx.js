// Holding the mouse down briefly (170ms) opens a circle at the cursor, inside which it looks like a flipped blueprint — 16px grid · crosshair · tick ring · coordinates, plus the box · name · font size · note of the visible elements inside.
(() => {
  kfFx.register("hold-xray-lens", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const R0 = +(options.r ?? 150) || 150, hold = +(options.hold ?? 170), grid = +(options.grid ?? 16) || 16;
    const open = +(options.open ?? 0.16) || 0.16, follow = +(options.follow ?? 0.6) || 0.6, idle = +(options.idle ?? 0.3) || 0.3;
    const showCursor = options.cursor !== "off";
    const L = 2 * R0 + 24;
    const cs = (n) => getComputedStyle(el).getPropertyValue(n).trim();
    const mk = (blend) => {
      const c = document.createElement("canvas");
      c.className = "fx-xray-canvas";
      c.setAttribute("aria-hidden", "true");
      if (blend) c.style.mixBlendMode = "difference";
      document.body.appendChild(c);
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = c.height = L * dpr; c.style.width = c.style.height = `${L}px`;
      const ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return [c, ctx];
    };
    const [disc, dctx] = mk(true), [ring, rctx] = mk(false);
    let tx = -1e3, ty = -1e3, x = -1e3, y = -1e3, o = 0, cur = 0, held = false, press = false, timer = 0, raf = 0, sx = 0, sy = 0, overLink = false;
    const notes = () => [...el.querySelectorAll('[data-fx-part="note"]')];
    const draw = () => {
      raf = 0;
      const want = held ? 1 : 0;
      o += (want - o) * (reduce ? 1 : open);
      if (Math.abs(want - o) < 0.002) o = want;
      const k = held || reduce ? follow : idle;
      x += (tx - x) * k; y += (ty - y) * k;
      disc.style.transform = ring.style.transform = `translate3d(${x - L / 2}px, ${y - L / 2}px, 0)`;
      const s = L / 2, r = R0 * o, bg = cs("--kf-bg"), ink = cs("--kf-ink"), ac = cs("--kf-accent"), on = cs("--kf-on-accent"), mono = cs("--kf-font-mono") || "monospace";
      dctx.clearRect(0, 0, L, L); rctx.clearRect(0, 0, L, L);
      if (r > 1) {
        dctx.fillStyle = bg; dctx.beginPath(); dctx.arc(s, s, r, 0, Math.PI * 2); dctx.fill();
        rctx.save(); rctx.beginPath(); rctx.arc(s, s, r, 0, Math.PI * 2); rctx.clip();
        const ox = x - s, oy = y - s;
        rctx.strokeStyle = bg; rctx.globalAlpha = 0.22; rctx.lineWidth = 1; rctx.beginPath();
        for (let g = -((ox % grid) + grid) % grid; g < L; g += grid) { rctx.moveTo(Math.round(g) + 0.5, 0); rctx.lineTo(Math.round(g) + 0.5, L); }
        for (let g = -((oy % grid) + grid) % grid; g < L; g += grid) { rctx.moveTo(0, Math.round(g) + 0.5); rctx.lineTo(L, Math.round(g) + 0.5); }
        rctx.stroke(); rctx.globalAlpha = 1;
        rctx.font = `10px ${mono}`; rctx.textBaseline = "top";
        for (const n of notes()) {
          const b = n.getBoundingClientRect();
          if (!b.width || b.right < x - r || b.left > x + r || b.bottom < y - r || b.top > y + r) continue;
          const nx = b.left - ox, ny = b.top - oy;
          rctx.strokeStyle = bg; rctx.strokeRect(Math.round(nx) + 0.5, Math.round(ny) + 0.5, Math.round(b.width), Math.round(b.height));
          const tag = `${n.dataset.x || ""} ${Math.round(b.width)}×${Math.round(b.height)}`.trim();
          const tw = rctx.measureText(tag).width + 10;
          rctx.fillStyle = ac; rctx.fillRect(nx, ny - 16, tw, 15); rctx.fillStyle = on; rctx.fillText(tag, nx + 5, ny - 13);
          const fs = `${Math.round(parseFloat(getComputedStyle(n).fontSize))}px`;
          rctx.fillStyle = bg; rctx.fillText(n.dataset.note ? `${fs} · ${n.dataset.note}` : fs, nx + 2, ny + 4);
        }
        rctx.strokeStyle = ac; rctx.globalAlpha = 0.55; rctx.beginPath();
        rctx.moveTo(s + 0.5, s - r); rctx.lineTo(s + 0.5, s + r); rctx.moveTo(s - r, s + 0.5); rctx.lineTo(s + r, s + 0.5); rctx.stroke();
        rctx.globalAlpha = 1; rctx.fillStyle = ac; rctx.beginPath(); rctx.arc(s, s, 2.5, 0, Math.PI * 2); rctx.fill();
        rctx.textAlign = "center"; rctx.textBaseline = "middle";
        const t = `x ${Math.round(x)}   y ${Math.round(y + scrollY)}`, w = rctx.measureText(t).width + 12;
        rctx.fillStyle = ink; rctx.fillRect(s - w / 2, s + r - 30, w, 16); rctx.fillStyle = bg; rctx.fillText(t, s, s + r - 22);
        rctx.restore();
        rctx.strokeStyle = ac; rctx.lineWidth = 1.5; rctx.beginPath(); rctx.arc(s, s, r, 0, Math.PI * 2); rctx.stroke();
        rctx.lineWidth = 1; rctx.beginPath();
        for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, n = i % 6 === 0 ? 8 : 4; rctx.moveTo(s + Math.cos(a) * (r + 3), s + Math.sin(a) * (r + 3)); rctx.lineTo(s + Math.cos(a) * (r + 3 + n), s + Math.sin(a) * (r + 3 + n)); }
        rctx.stroke();
      }
      const show = showCursor && !held && !overLink && tx > -500 ? (press ? 1.7 : 1) : 0;
      cur += (show - cur) * (reduce ? 1 : 0.2);
      if (cur > 0.01 && o < 0.2) {
        rctx.strokeStyle = ac; rctx.lineWidth = 1.5; rctx.globalAlpha = Math.min(1, cur);
        rctx.beginPath(); rctx.arc(s, s, 11 * cur + r, 0, Math.PI * 2); rctx.stroke();
        rctx.fillStyle = ac; rctx.beginPath(); rctx.arc(s, s, 2 * Math.min(1, cur), 0, Math.PI * 2); rctx.fill(); rctx.globalAlpha = 1;
      }
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3 || o !== want || Math.abs(show - cur) > 0.01 || held) raf = requestAnimationFrame(draw);
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const inside = (t) => t instanceof Node && el.contains(t);
    const blocked = (t) => t instanceof Element && t.closest("a, button, input, textarea, select, label, [data-no-lens]");
    const ac = new AbortController(), sig = { signal: ac.signal };
    addEventListener("pointermove", (e) => {
      if (!inside(e.target) && !held) { tx = ty = -1e3; ask(); return; }
      tx = e.clientX; ty = e.clientY; overLink = !!blocked(e.target);
      if (press && timer && Math.hypot(tx - sx, ty - sy) > 12) { clearTimeout(timer); timer = 0; press = false; }
      ask();
    }, { passive: true, signal: ac.signal });
    addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || !inside(e.target) || blocked(e.target)) return;
      press = true; sx = tx = e.clientX; sy = ty = e.clientY;
      clearTimeout(timer);
      timer = setTimeout(() => { timer = 0; press = false; held = true; document.documentElement.classList.add("fx-xray-held"); ask(); }, hold);
      ask();
    }, sig);
    const up = () => { press = false; clearTimeout(timer); timer = 0; if (held) { held = false; document.documentElement.classList.remove("fx-xray-held"); } ask(); };
    addEventListener("pointerup", up, sig);
    addEventListener("pointercancel", up, sig);
    addEventListener("blur", up, sig);
    addEventListener("scroll", () => held && ask(), { passive: true, signal: ac.signal });
    return () => { ac.abort(); cancelAnimationFrame(raf); clearTimeout(timer); disc.remove(); ring.remove(); document.documentElement.classList.remove("fx-xray-held"); };
  });
})();
