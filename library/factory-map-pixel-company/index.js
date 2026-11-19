// Home only: hero side pixels, input typewriter, rocket (floats, then crashes once all cards are visible · after landing, a click lifts it off again), factory scene.
// Original values: Hero pixel 65px · appear scale 2 · pointer radius 280 · cooldown 240ms · blink scale 4 / rocket shake 6px · tilt 1.8° · falls .6s after the crash ·
// After landing: 5° tilt, 3px bounce (.18s), 1px (.12s), re-takeoff 1.75s.
(() => {
  const { reduced } = SY;
  const NS = "http://www.w3.org/2000/svg";

  const hero = document.querySelector(".hero");
  // Hero side cell positions follow the original layout (65px cell coordinates)
  const HERO_CELLS = {
    left: [[65, 0], [0, 65], [0, 130], [65, 195], [0, 260], [65, 260], [130, 260], [0, 325], [195, 325], [0, 390], [65, 390], [0, 455], [65, 455], [130, 455]],
    right: [[195, 0], [65, 65], [130, 130], [65, 195], [130, 195], [195, 195], [130, 260], [195, 260], [65, 325], [195, 325], [0, 455], [130, 455], [65, 520], [130, 520], [195, 520]],
  };
  document.querySelectorAll("[data-hero-px]").forEach((el) => {
    const left = el.dataset.heroPx === "left";
    const cells = HERO_CELLS[left ? "left" : "right"].map(([x, y]) => ({ x, y }));
    SY.pixels(el, { cells, cell: 65, w: 260, h: left ? 520 : 585, origin: "top", enterScale: 2, radius: 280, cooldown: 240, pScale: 4, flashes: 1, listen: hero });
  });

  // Typewriter: 45ms per character, stays 2.4s when done, then erases
  const type = document.querySelector("[data-type]");
  if (type) {
    const text = type.dataset.type;
    if (reduced) type.textContent = text;
    else {
      const o = { n: 0 };
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.6, delay: 0.9 })
        .to(o, { n: text.length, duration: text.length * 0.045, ease: "none", onUpdate: () => (type.textContent = text.slice(0, Math.round(o.n))) })
        .to(o, { n: 0, duration: 0.6, ease: "none", delay: 2.4, onUpdate: () => (type.textContent = text.slice(0, Math.round(o.n))) });
    }
  }

  // The ”How the quote is calculated” icon leaves a speech bubble when clicked
  document.querySelectorAll("[data-tip-toggle]").forEach((a) => a.addEventListener("click", () => a.classList.toggle("is-shown")));

  // One extra set so the logo strip doesn’t break on narrow screens
  const row = document.querySelector(".logos__row");
  if (row)
    row.append(
      ...[...row.children].map((li) => {
        const c = li.cloneNode(true);
        c.classList.add("logos__clone", "is-inview");
        c.setAttribute("aria-hidden", "true");
        return c;
      })
    );

  // ── Rocket (newly drawn instead of the original artwork) ──
  // The original has no GSAP and draws each frame’s state (floating→falling→landing→retakeoff→stays 2.4s then falls again) by formula — formulas and values carried over as they are.
  // The original image is drawn at a floating position so the landing is +92, but this image is drawn at the landing position so 92 is subtracted from ty.
  const svg = document.querySelector("[data-rocket]");
  if (svg) {
    svg.innerHTML = `
      <ellipse cx="367" cy="495" rx="295" ry="59" style="fill:var(--site-plate)"/>
      <g class="rk-guy">
        <ellipse cx="205" cy="500" rx="22" ry="6" style="fill:var(--site-plate-2)"/>
        <path class="rk-leg-l" d="M196 438 L193 492" stroke-width="8" stroke-linecap="round" style="stroke:var(--kf-ink)"/>
        <path class="rk-leg-r" d="M210 438 L211 494" stroke-width="8" stroke-linecap="round" style="stroke:var(--kf-ink)"/>
        <rect class="rk-foot-l" x="184" y="490" width="14" height="7" rx="3.5" style="fill:var(--kf-ink)"/>
        <rect class="rk-foot-r" x="206" y="492" width="14" height="7" rx="3.5" style="fill:var(--kf-ink)"/>
        <rect x="188" y="386" width="30" height="56" rx="10" style="fill:var(--site-dark)"/>
        <circle cx="203" cy="372" r="13" style="fill:var(--site-skin)"/>
        <path d="M190 372 q0 -18 14 -17 q13 1 12 11 q-8 -4 -15 -1 q-5 2 -11 7z" style="fill:var(--site-hair)"/>
        <path class="rk-arm-l" d="M192 398 L214 414" stroke-width="7" stroke-linecap="round" style="stroke:var(--site-dark)"/>
        <g class="rk-computer"><path d="M222 402 l26 -14 v20 l-26 14z" style="fill:var(--site-dark-2)"/><path d="M225 404 l20 -11 v14 l-20 11z" class="rk-screen" style="fill:var(--kf-surface)"/></g>
        <path class="rk-arm-r" d="M214 398 L236 410" stroke-width="7" stroke-linecap="round" style="stroke:var(--site-dark)"/>
      </g>
      <g class="rk-rocket">
        <path class="rk-flame-o" d="M420 462 C448 472 452 520 420 556 C388 520 392 472 420 462Z" style="fill:var(--site-highlight)" opacity=".6"/>
        <path class="rk-flame-i" d="M420 466 C438 474 440 506 420 532 C400 506 402 474 420 466Z" style="fill:var(--site-highlight)"/>
        <g class="rk-fins">
          <path d="M362 360 L316 430 L316 466 L362 444Z" style="fill:var(--site-coral)"/>
          <path d="M478 360 L524 430 L524 466 L478 444Z" style="fill:var(--site-pink-mid)"/>
        </g>
        <path d="M390 440 h60 v14 c0 14 -60 14 -60 0Z" style="fill:var(--site-coral)"/>
        <path d="M420 130 C470 180 494 250 488 320 L480 430 C470 452 370 452 360 430 L352 320 C346 250 370 180 420 130Z" style="fill:var(--site-pink-soft)"/>
        <path d="M420 130 C392 175 376 240 380 320 L386 440 C372 436 362 432 360 430 L352 320 C346 250 370 180 420 130Z" style="fill:var(--site-pink-light)"/>
        <path d="M420 130 C446 154 462 176 470 200 C440 214 400 214 370 200 C378 176 394 154 420 130Z" style="fill:var(--site-coral)"/>
        <circle cx="420" cy="290" r="36" style="fill:var(--site-coral)"/><circle cx="420" cy="290" r="26" style="fill:var(--kf-bg)"/>
        <path d="M404 282 a18 18 0 0 1 14 -14" stroke-width="5" stroke-linecap="round" fill="none" style="stroke:var(--kf-surface)"/>
        <path d="M410 400 L410 452 L430 452 L430 400Z" style="fill:var(--site-pink-mid)" opacity=".5"/>
      </g>`;

    const r2 = (n) => (Math.round(n * 100) / 100).toString();
    const clamp01 = (t) => Math.max(0, Math.min(1, t));
    const mix = (a, b, t) => a + (b - a) * t;
    const outQuad = (t) => 1 - (1 - t) * (1 - t);
    const cosIO = (t) => (1 - Math.cos(Math.PI * t)) / 2;
    const sinAt = (t, f, ph = 0) => Math.sin(Math.PI * 2 * f * t + ph);
    const keys = (t, ks, vs) => {
      if (t <= ks[0]) return vs[0];
      for (let i = 1; i < ks.length; i++) if (t <= ks[i]) return mix(vs[i - 1], vs[i], (t - ks[i - 1]) / (ks[i] - ks[i - 1]));
      return vs[vs.length - 1];
    };
    // Clock looping every 4s — stops when off-screen
    const clock = () => {
      let t0 = 0, held = 0, on = false;
      const now = () => (on ? performance.now() / 1e3 - t0 : held);
      return { play() { if (!on) (t0 = performance.now() / 1e3 - held), (on = true); }, pause() { if (on) (held = now()), (on = false); }, wave: (c = 1, o = 0) => Math.sin((now() / 4) * Math.PI * 2 * c + o) };
    };

    const FLOAT = 6, TILT = 1.8, TILT3 = 0.4, LEN = 1.12, OUT_A = 0.6, LAND = 92, LEAN = 5;
    const BOUNCE = [{ h: 3, d: 0.18 }, { h: 1, d: 0.12 }], BOUNCE_LEAN = 0.12, WOB = 0.6, WOB_HZ = 1.6, WOB_DUR = 1;
    const FLICK = 0.75, DROP = 0.6, HIT = 1.1, SETTLE = HIT + 0.3, DONE = SETTLE + WOB_DUR;
    const KT = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.75], K_LEN = [1, 0.35, 1.05, 0.2, 0.75, 0.08, 0.45, 0], K_OA = [1, 0.4, 1, 0.25, 0.8, 0.1, 0.5, 0];
    const K_IA = [1, 0.5, 1, 0.3, 0.9, 0.1, 0.6, 0], K_TY = [0, 2.5, -0.5, 4, 1.5, 6, 5, 5], K_TILT = [0, 0.6, -0.4, 0.8, -0.3, 0.5, 0, 0];
    const UP_RAMP = 0.7, UP_FROM = 0.55, UP_DONE = 1.75, RT = [0, 0.12, 0.22, 0.34, 0.46, 0.58, 0.7], R_LEN = [0, 0.45, 0.15, 0.7, 0.35, 0.95, 1], R_A = [0, 0.7, 0.3, 0.9, 0.5, 1, 1];
    const UP_SHAKE = 0.8, UP_TILT = 0.35, HOLD = 2.4, ITCH_LEAN = 2, ITCH_X = 1.2, ITCH_Y = 0.6, ITCH_TILT = 0.25, ITCH_FLAME = 0.35, ITCH_TAU = 0.18;
    const AUTO_EVERY = 4.5, AUTO_DUR = 1.2, AUTO_AMP = 0.8, AUTO_FROM = 1.5;

    const rocket = svg.querySelector(".rk-rocket");
    const box = rocket.getBBox(), fins = svg.querySelector(".rk-fins").getBBox();
    const R = { center: { x: box.x + box.width / 2, y: box.y + box.height / 2 }, lean: { x: fins.x + fins.width, y: fins.y + fins.height }, lift: box.y - LAND - FLOAT };
    const flame = (sel) => { const el = svg.querySelector(sel), b = el.getBBox(); return { el, x: b.x + b.width / 2, y: b.y }; };
    const outer = flame(".rk-flame-o"), inner = flame(".rk-flame-i");
    const REST = { ty: LAND, tilt: 0, creak: LEAN, oLen: 0, oW: 1, oA: 0, iLen: 0, iW: 1, iA: 0 };
    const sc = (f, w, len) => `translate(${r2(f.x)} ${r2(f.y)}) scale(${r2(w)} ${r2(len)}) translate(${r2(-f.x)} ${r2(-f.y)})`;
    const draw = (s) => {
      const ty = s.ty - LAND;
      const creak = s.creak ? `rotate(${r2(s.creak)} ${r2(R.lean.x)} ${r2(R.lean.y + ty)}) ` : "";
      rocket.setAttribute("transform", `${creak}translate(0 ${r2(ty)}) rotate(${r2(s.tilt)} ${r2(R.center.x)} ${r2(R.center.y)})`);
      outer.el.setAttribute("transform", sc(outer, s.oW, s.oLen));
      outer.el.setAttribute("opacity", r2(s.oA));
      inner.el.setAttribute("transform", sc(inner, s.iW, s.iLen));
      inner.el.setAttribute("opacity", r2(s.iA));
    };
    const W = clock();
    const fly = () => ({
      ty: -R.lift + FLOAT * W.wave(2), tilt: TILT * W.wave() + TILT3 * W.wave(3, 0.8), creak: 0,
      oLen: LEN + 0.1 * W.wave(7) + 0.05 * W.wave(11, 1.3), oW: 1 + 0.04 * W.wave(9, 0.5), oA: OUT_A + 0.1 * W.wave(17, 0.4),
      iLen: LEN + 0.14 * W.wave(13, 0.7) + 0.06 * W.wave(5, 2.1), iW: 1 + 0.06 * W.wave(15, 1.9), iA: 1,
    });
    const bounce = (t) => { let at = 0; for (const b of BOUNCE) { if (t < at + b.d) return b.h * Math.sin(Math.PI * ((t - at) / b.d)); at += b.d; } return 0; };
    const crashAt = (from, t) => {
      const k = Math.min(t, FLICK), len = keys(k, KT, K_LEN), off = keys(k, KT, K_TY), wob = keys(k, KT, K_TILT), a = outQuad(clamp01(t / DROP));
      let ty = from.ty + off, tilt = mix(from.tilt, 0, a) + wob, creak = 0;
      if (t >= DROP) {
        const l = clamp01((t - DROP) / (HIT - DROP));
        ty = mix(from.ty + keys(DROP, KT, K_TY), LAND, l * l);
        tilt = mix(keys(DROP, KT, K_TILT), 0, l);
        creak = LEAN * cosIO(l);
      }
      if (t >= HIT) { const b = bounce(t - HIT); ty = LAND - b; tilt = 0; creak = LEAN + b * BOUNCE_LEAN; }
      if (t >= SETTLE) { const l = Math.min(t, DONE) - SETTLE; creak = LEAN + WOB * Math.exp(-4 * l) * Math.sin(Math.PI * 2 * WOB_HZ * l); }
      return { ty, tilt, creak, oLen: from.oLen * len, oW: mix(from.oW, 1, a), oA: from.oA * keys(k, KT, K_OA), iLen: from.iLen * len, iW: mix(from.iW, 1, a), iA: keys(k, KT, K_IA) };
    };
    const itchAt = (y, x, t) => y <= 0 ? REST : {
      ty: LAND - ITCH_Y * y * Math.abs(sinAt(t, 4)), tilt: ITCH_TILT * y * sinAt(t, 9), creak: LEAN - ITCH_LEAN * y + ITCH_X * x * y,
      oLen: ITCH_FLAME * y * (0.75 + 0.25 * sinAt(t, 7.3)), oW: 1, oA: OUT_A * y,
      iLen: ITCH_FLAME * 1.15 * y * (0.7 + 0.3 * sinAt(t, 9.1, 1)), iW: 1, iA: y * (0.75 + 0.25 * sinAt(t, 5.7, 2)),
    };
    const upAt = (from, to, t) => {
      const o = clamp01(t / UP_RAMP), c = cosIO(clamp01((t - UP_FROM) / (UP_DONE - UP_FROM))), s = o * (1 - c), len = keys(t, RT, R_LEN), a = keys(t, RT, R_A);
      return {
        ty: mix(from.ty, to.ty, c) - UP_SHAKE * s * Math.abs(sinAt(t, 14)), tilt: mix(from.tilt, to.tilt, c) + UP_TILT * s * sinAt(t, 11), creak: from.creak * (1 - cosIO(o)),
        oLen: Math.max(from.oLen, to.oLen * len), oW: to.oW, oA: Math.max(from.oA, to.oA * a), iLen: Math.max(from.iLen, to.iLen * len), iW: to.iW, iA: Math.max(from.iA, to.iA * a),
      };
    };
    // After landing: on mouse devices it shakes and tilts toward the cursor while hovered, on touch devices it shakes once by itself every 4.5s
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const autoItch = (t) => { if (t < AUTO_FROM) return 0; const e = (t - AUTO_FROM) % AUTO_EVERY; return e < AUTO_DUR ? AUTO_AMP * Math.sin(Math.PI * (e / AUTO_DUR)) : 0; };

    let st = { kind: "fly" }, held = 0, since = 0, running = false, raf = 0, last = 0, cur = fly(), itch = 0, over = 0, px = 0;
    const T = () => (running ? held + (performance.now() - since) / 1e3 : held);
    const go = (s) => { st = s; held = 0; since = performance.now(); rocket.style.cursor = s.kind === "landed" ? "pointer" : ""; };
    const step = () => {
      const now = performance.now(), dt = last ? Math.min((now - last) / 1e3, 0.1) : 0;
      last = now;
      const t = T();
      if (st.kind === "fly") cur = fly();
      else if (st.kind === "hold") { cur = fly(); if (t >= HOLD) go({ kind: "crash", from: cur }); }
      else if (st.kind === "crash") t >= DONE ? (go({ kind: "landed" }), (cur = REST)) : (cur = crashAt(st.from, t));
      else if (st.kind === "relaunch") t >= UP_DONE ? (go({ kind: "hold" }), (cur = fly())) : (cur = upAt(st.from, fly(), t));
      else {
        const want = fine ? over : autoItch(t);
        itch += (want - itch) * (1 - Math.exp(-dt / ITCH_TAU));
        if (itch < 0.002 && want === 0) itch = 0;
        cur = itchAt(itch, px, t);
      }
      draw(cur);
    };
    const idle = () => st.kind === "landed" && fine && itch === 0 && over === 0;
    const frame = () => { raf = 0; if (!running) return; step(); if (!idle()) raf = requestAnimationFrame(frame); };
    const wake = () => { if (running && !raf) (last = 0), (raf = requestAnimationFrame(frame)); };
    const play = () => { if (running) return; W.play(); since = performance.now(); last = 0; running = true; step(); if (!idle()) raf = requestAnimationFrame(frame); };
    const pause = () => { if (!running) return; held = T(); W.pause(); running = false; cancelAnimationFrame(raf); raf = 0; };
    const crash = (instant) => { if (st.kind !== "fly") return; go(instant ? { kind: "landed" } : { kind: "crash", from: cur }); if (instant) cur = REST; draw(cur); wake(); };
    rocket.addEventListener("pointermove", (e) => {
      if (st.kind !== "landed" || e.pointerType !== "mouse") return;
      const b = rocket.getBoundingClientRect();
      px = Math.max(-1, Math.min(1, (e.clientX - (b.left + b.width / 2)) / (b.width / 2)));
      over = 1;
      wake();
    });
    rocket.addEventListener("pointerleave", () => ((over = 0), wake()));
    rocket.addEventListener("click", () => { if (st.kind !== "landed") return; over = 0; go({ kind: "relaunch", from: cur }); wake(); });

    // The person next to it: legs bend alternately, and arm and laptop sway together around the chest
    const G = clock();
    const pt = (el, x, y) => { const b = el.getBBox(); return { x: b.x + b.width * x, y: b.y + b.height * y }; };
    const rot = (a, p) => `rotate(${r2(a)} ${r2(p.x)} ${r2(p.y)})`;
    const legOf = (leg, foot, amp, tilt) => { const el = svg.querySelector(leg); return { leg: el, foot: svg.querySelector(foot), hip: pt(el, 0.5, 0.06), ankle: pt(el, 0.5, 1), amp, tilt }; };
    const armOf = (sel, x, y, amp, amp2, sign) => { const el = svg.querySelector(sel); return { el, sh: pt(el, x, y), amp, amp2, sign }; };
    const legs = [legOf(".rk-leg-l", ".rk-foot-l", 4.2, 2.3), legOf(".rk-leg-r", ".rk-foot-r", 3.8, -2)];
    const arms = [armOf(".rk-arm-l", 0.06, 0.4, 1.6, 0.5, 1), armOf(".rk-arm-r", 0.04, 0.2, 1.4, 0.45, -1)];
    const comp = svg.querySelector(".rk-computer"), cb = comp.getBBox(), hands = { x: cb.x + cb.width / 2, y: cb.y + cb.height / 2 };
    const chest = { x: (arms[0].sh.x + arms[1].sh.x) / 2, y: (arms[0].sh.y + arms[1].sh.y) / 2 };
    const bend = (L, e) => {
      const r = e * e * (3 - 2 * e), k = 1 - (L.amp * r) / Math.max(L.ankle.y - L.hip.y, 8), a = L.tilt * r, rad = (a * Math.PI) / 180;
      const dx = 0, dy = (L.ankle.y - L.hip.y) * k;
      const ax = L.hip.x + dx * Math.cos(rad) - dy * Math.sin(rad), ay = L.hip.y + dx * Math.sin(rad) + dy * Math.cos(rad);
      L.leg.setAttribute("transform", `${rot(a, L.hip)} translate(${r2(L.hip.x)} ${r2(L.hip.y)}) scale(1 ${r2(k)}) translate(${r2(-L.hip.x)} ${r2(-L.hip.y)})`);
      L.foot.setAttribute("transform", `translate(${r2(ax - L.ankle.x)} ${r2(ay - L.ankle.y)})`);
    };
    let guyRaf = 0;
    const guy = () => {
      bend(legs[0], Math.max(0, G.wave()));
      bend(legs[1], Math.max(0, G.wave(1, Math.PI * 2 * 0.5)));
      const w = G.wave(), body = `translate(${r2(w * 0.45)} ${r2(w * 0.45 * 0.55)}) ${rot(G.wave() * 1.6 + G.wave(2) * 0.5, chest)}`;
      const a = arms.map((A) => A.sign * (G.wave() * A.amp + G.wave(2) * A.amp2));
      arms.forEach((A, i) => A.el.setAttribute("transform", `${body} ${rot(a[i], A.sh)}`));
      comp.setAttribute("transform", `${body} ${rot((a[0] + a[1]) * 0.45, hands)}`);
      guyRaf = requestAnimationFrame(guy);
    };

    if (reduced) draw(REST);
    else {
      draw(cur);
      new IntersectionObserver(([e]) => {
        if (e?.isIntersecting) { play(); G.play(); if (!guyRaf) guy(); }
        else { pause(); G.pause(); cancelAnimationFrame(guyRaf); guyRaf = 0; }
      }).observe(svg);
      const lg = matchMedia("(min-width: 1024px)");
      const sec = svg.closest(".proto") || svg;
      const check = () => {
        if (st.kind !== "fly") return;
        const r = sec.getBoundingClientRect();
        if (lg.matches ? r.bottom <= innerHeight : r.top <= innerHeight / 2) {
          crash(r.bottom <= 0);
          removeEventListener("scroll", check);
          removeEventListener("resize", check);
        }
      };
      addEventListener("scroll", check, { passive: true });
      addEventListener("resize", check, { passive: true });
      check();
    }
  }

  const bf = document.querySelector(".bf");
  if (bf) SY_factory(bf);
})();
