// Home page: counts a paragraph into words and image slots, and page scroll progress decides how many slots light up (original: ⌊progress × (slot count + 1)⌋ − 1 > Order)
// When a cell turns on, the word goes .25→1 (.5s), and picture cells play their own activation motion (the original Rive state machine’s Active input)
(() => {
  const text = document.querySelector(".rb-text");
  if (!text) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!window.gsap;
  const M = window.rbMotion;

  // Word wrapping — keep spaces as they are, wrap only the words in a span
  text.querySelectorAll(".rb-words").forEach((el) => {
    const parts = el.textContent.split(/(\s+)/);
    el.textContent = "";
    parts.forEach((p) => {
      if (!p) return;
      if (/^\s+$/.test(p)) return el.append(document.createTextNode(" "));
      const w = document.createElement("span");
      w.className = "rb-w";
      w.textContent = p;
      el.append(w);
    });
  });
  text.querySelectorAll("[data-split]").forEach((el) => {
    const s = el.textContent;
    el.textContent = "";
    [...s].forEach((c) => { const ch = document.createElement("span"); ch.className = "rb-ch"; ch.textContent = c; el.append(ch); });
  });

  const tokens = [...text.querySelectorAll(".rb-w, [data-rb-tok]")].filter((el) => !el.closest(".rb-lead"));
  const total = Number(text.dataset.rbTotal) || tokens.length;
  const state = new Array(tokens.length).fill(false);
  const widgets = new Map();
  const ISLAND_AT = 20;
  const book = text.querySelector(".rb-book");
  const bookLast = book ? tokens.indexOf([...book.querySelectorAll(".rb-w")].pop()) : -1;
  let lit = -1;

  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  };
  const paint = () => {
    lit = Math.floor(progress() * (total + 1)) - 1;
    tokens.forEach((el, i) => {
      const on = lit > i;
      if (on === state[i]) return;
      state[i] = on;
      el.classList.toggle("is-on", on);
      const w = widgets.get(el);
      if (w) w(on);
    });
    if (book) book.classList.toggle("is-lined", lit > bookLast);
    window.rbIsland?.show(lit > ISLAND_AT);
  };
  window.rbIslandWanted = () => lit > ISLAND_AT;

  if (!hasGsap || reduce) {
    tokens.forEach((el) => el.classList.add("is-on"));
    text.querySelectorAll(".rb-disc").forEach((d) => d.classList.add("is-drawn"));
    book?.classList.add("is-lined");
    if (hasGsap) gsap.set(".rb-team, .rb-product", { width: (i, el) => (el.classList.contains("rb-team") ? "var(--width-from)" : 100) });
    if (hasGsap) gsap.set(".rb-team__ring, .rb-score__art, .rb-hand-wave__g, .rb-cal__art, .rb-product__card", { opacity: 1, scale: 1, y: 0, rotate: 0 });
    window.rbIsland?.show(true);
    return;
  }

  const sp = M.spring(0.6, 0.3);
  const ease3 = CustomEase.create("rb-ease", "0.25,0.1,0.35,1");

  // Team faces — on: width opens (.3s), then .1s later the faces go 0→1 with a .03 stagger spring (.6s bounce .3). Off: they fold from the back at .05 stagger, then .1s later width goes to 0 (.3s easeOut)
  const team = text.querySelector(".rb-team");
  if (team) {
    const rings = team.querySelectorAll(".rb-team__ring");
    widgets.set(team, (on) => {
      gsap.killTweensOf([team, ...rings]);
      if (on) {
        gsap.to(team, { width: getComputedStyle(team).getPropertyValue("--width-from").trim() || 172, duration: 0.3, ease: ease3 });
        gsap.fromTo(rings, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: sp.duration, ease: sp.ease, delay: 0.1, stagger: 0.03 });
      } else {
        gsap.to(rings, { opacity: 0, scale: 0, duration: sp.duration, ease: sp.ease, stagger: { each: 0.05, from: "end" } });
        gsap.to(team, { width: 0, duration: 0.3, ease: "power1.out", delay: 0.1 });
      }
    });
    // Name tag: the inner band is pushed to the name line of the hovered face, and the pill width fits that line
    const tip = team.querySelector(".rb-team__tip"), names = team.querySelector(".rb-team__names"), rows = [...team.querySelectorAll(".rb-team__n")];
    const pick = (i) => {
      const r = rows[i];
      names.style.transform = `translateX(${-r.offsetLeft}px)`;
      tip.style.width = `${r.offsetWidth + 40}px`;
    };
    team.querySelectorAll(".rb-team__face").forEach((f, i) => f.addEventListener("pointerenter", () => pick(i)));
    requestAnimationFrame(() => pick(0));
  }

  // Reel thumbnail — css transition only (is-on)
  const reel = text.querySelector(".rb-reel");
  if (reel) widgets.set(reel, () => {});

  // Field word timeline — plays forward when on, rewinds at double speed when off
  const tl = (el, build) => {
    const t = gsap.timeline({ paused: true, onStart: () => el.classList.add("is-drawn"), onReverseComplete: () => el.classList.remove("is-drawn") });
    build(t);
    widgets.set(el, (on) => (on ? t.timeScale(1).play() : t.timeScale(2).reverse()));
  };
  const q = (el, s) => el.querySelector(s);
  const qa = (el, s) => [...el.querySelectorAll(s)];

  text.querySelectorAll(".rb-disc").forEach((d) => {
    if (d.classList.contains("rb-disc--outline")) {
      const ch = qa(d, ".rb-out .rb-ch"), pen = q(d, ".rb-pen");
      tl(d, (t) => {
        t.set(ch, { className: "rb-ch is-ink" }, 0);
        t.to(q(d, ".rb-guides"), { opacity: 1, duration: 0.3, ease: "power1.out" }, 0.1);
        t.fromTo(pen, { opacity: 0, x: 0 }, { opacity: 1, duration: 0.1 }, 0.15);
        t.to(pen, { x: () => d.offsetWidth, duration: ch.length * 0.07, ease: "none" }, 0.15);
        ch.forEach((c, i) => t.set(c, { className: "rb-ch is-line" }, 0.2 + i * 0.07));
        t.to(pen, { opacity: 0, duration: 0.15 }, 0.15 + ch.length * 0.07);
      });
    } else if (d.classList.contains("rb-disc--code")) {
      const code = q(d, ".rb-code"), ch = qa(d, ".rb-ch"), caret = q(d, ".rb-caret");
      tl(d, (t) => {
        t.to(code, { opacity: 1, duration: 0.2 }, 0);
        t.fromTo(caret, { opacity: 0, x: 0 }, { opacity: 1, duration: 0.05 }, 0.2);
        t.to(caret, { x: () => code.offsetWidth, duration: 1.1, ease: "none" }, 0.25);
        ch.forEach((c, i) => {
          const at = 0.25 + (i / ch.length) * 1.1;
          t.to(c, { color: "var(--site-code)", duration: 0.12 }, at);
          t.to(c, { color: "var(--kf-ink)", duration: 0.4 }, at + 0.35);
        });
        t.to(caret, { opacity: 0, duration: 0.15 }, 1.4);
      });
    } else if (d.classList.contains("rb-disc--brand")) {
      const plain = q(d, ".rb-plain"), ch = qa(plain, ".rb-ch"), chrome = q(d, ".rb-brand");
      tl(d, (t) => {
        t.set(plain, { opacity: 1 }, 0);
        t.fromTo(ch, { opacity: 0.25 }, { opacity: 1, duration: 0.1, stagger: 0.04, immediateRender: false }, 0);
        t.to(plain, { opacity: 0, duration: 0.1 }, 0.42);
        t.fromTo(chrome, { opacity: 0, scale: 0.86, y: 4 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2.2)" }, 0.4);
      });
    } else if (d.classList.contains("rb-disc--hand")) {
      const old = q(d, ".rb-hand-old"), hand = q(d, ".rb-hand"), cv = q(d, ".rb-dust");
      const dust = makeDust(cv, old);
      tl(d, (t) => {
        t.fromTo(old, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
        t.fromTo(old, { clipPath: "inset(0 0% 0 0%)" }, { clipPath: "inset(0 0% 0 100%)", duration: 0.9, ease: "none", onUpdate: function () { dust.at(this.progress()); } }, 0.35);
        t.fromTo(hand, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.45, ease: "sine.inOut" }, 1.15);
      });
    } else if (d.classList.contains("rb-disc--video")) {
      const v = q(d, ".rb-vid"), bar = q(d, ".rb-vid__bar");
      tl(d, (t) => {
        t.to(v, { opacity: 1, duration: 0.2 }, 0);
        t.set(v, { className: "rb-vid is-glitch" }, 0.3);
        t.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power1.inOut" }, 0.3);
        t.set(v, { className: "rb-vid" }, 1.1);
      });
    } else if (d.classList.contains("rb-disc--select")) {
      const box = q(d, ".rb-sel__box"), arrow = q(d, ".rb-sel__arrow"), size = q(d, ".rb-sel__size"), word = q(d, ".rb-sel");
      tl(d, (t) => {
        t.set(word, { opacity: 1 }, 0);
        t.fromTo(arrow, { opacity: 0, x: -4, y: 2 }, { opacity: 1, duration: 0.12 }, 0.15);
        t.set(box, { opacity: 1 }, 0.2);
        t.fromTo(box, { width: 0, height: 0 }, { width: () => word.offsetWidth + 12, height: () => word.offsetHeight * 0.83, duration: 0.5, ease: "power2.inOut" }, 0.2);
        t.to(arrow, { x: () => word.offsetWidth + 8, y: () => word.offsetHeight * 0.83, duration: 0.5, ease: "power2.inOut" }, 0.2);
        t.call(() => { size.textContent = `${Math.round(word.offsetWidth + 12)}×${Math.round(word.offsetHeight * 0.83)}`; }, null, 0.7);
        t.fromTo(size, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.8);
        t.to(arrow, { x: "+=24", y: "+=10", opacity: 0, duration: 0.6, ease: "power1.in" }, 1.4);
        t.to(size, { opacity: 0, duration: 0.4 }, 1.6);
      });
    } else if (d.classList.contains("rb-disc--3d")) {
      tl(d, (t) => {
        const st = make3d(q(d, ".rb-3d__cv"), q(d, ".rb-disc__dim"));
        t.to(st, { depth: 1, duration: 0.6, ease: M.spring(0.6, 0.3).ease, onUpdate: st.draw }, 0);
      });
    }
  });

  // Product piece — width 0→100 (.3s) and the phone springs up, and the switch turns on .5s later
  const product = text.querySelector(".rb-product");
  if (product) {
    const card = q(product, ".rb-product__card");
    widgets.set(product, (on) => {
      gsap.to(product, { width: on ? 100 : 0, duration: 0.3, ease: ease3, overwrite: "auto" });
      gsap.to(card, on ? { opacity: 1, y: 0, scale: 1, duration: sp.duration, ease: sp.ease, delay: 0.1, overwrite: "auto" } : { opacity: 0, y: 14, scale: 0.6, duration: 0.2, overwrite: "auto" });
    });
  }
  // Score badge — grows with a spring, the ring fills in 1s and the number counts 00→100
  const score = text.querySelector(".rb-score");
  if (score) {
    const art = q(score, ".rb-score__art"), ring = q(score, ".rb-score__ring"), num = q(score, ".rb-score__num"), n = { v: 0 };
    widgets.set(score, (on) => {
      gsap.killTweensOf([art, ring, n]);
      if (on) {
        gsap.to(art, { scale: 1, duration: sp.duration, ease: sp.ease });
        gsap.to(ring, { strokeDashoffset: 0, duration: 1, ease: "power2.out", delay: 0.15 });
        gsap.to(n, { v: 100, duration: 1, ease: "power2.out", delay: 0.15, onUpdate: () => { num.textContent = String(Math.round(n.v)); } });
      } else {
        gsap.to(art, { scale: 0, duration: 0.25, ease: "power2.in" });
        gsap.set(ring, { strokeDashoffset: 100 });
        n.v = 0;
      }
    });
  }
  // Calendar — as in the original, fills in this month and next month names, and when on, the icon pops up and after .5s flips to next month while a circle hops across
  const cal = text.querySelector(".rb-cal");
  if (cal) {
    const now = new Date(), next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const fmt = (d) => d.toLocaleString("en", { month: "short" }).toUpperCase();
    q(cal, '[data-month="now"]').textContent = fmt(now);
    q(cal, '[data-month="next"]').textContent = fmt(next);
    const art = q(cal, ".rb-cal__art"), mark = q(cal, ".rb-cal__mark");
    const t = gsap.timeline({ paused: true });
    t.to(art, { opacity: 1, y: 0, rotate: 0, scale: 1, duration: sp.duration, ease: sp.ease }, 0);
    t.to(q(cal, '[data-month="now"]'), { yPercent: -100, duration: 0.35, ease: "power2.inOut" }, 0.5);
    t.to(q(cal, '[data-month="next"]'), { yPercent: -100, duration: 0.35, ease: "power2.inOut" }, 0.5);
    t.to(mark, { x: 22, y: 11, duration: 0.5, ease: "power2.inOut" }, 0.6);
    widgets.set(cal, (on) => (on ? t.timeScale(1).play() : t.timeScale(2).reverse()));
  }
  // Hand sticker — pops out and waves twice
  const hand = text.querySelector(".rb-hand-wave");
  if (hand) {
    const g = q(hand, ".rb-hand-wave__g");
    gsap.set(g, { scale: 0, opacity: 1, transformOrigin: "50% 100%" });
    const t = gsap.timeline({ paused: true });
    t.to(g, { scale: 1, duration: sp.duration, ease: sp.ease }, 0);
    t.to(g, { rotate: 14, duration: 0.18, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0.35);
    widgets.set(hand, (on) => (on ? t.timeScale(1).play() : t.timeScale(2).reverse()));
  }

  // App icon stack — original ordered array: only the first three show (top 0, −2, −4, 5°, −3°, 0°), and when a hand hovers the stack the second card lifts 20px,
  // On press: second card −20 → front card vanishes in .125s → front card moved to the back → new front card to 0 (framer default spring 500·25)
  const deck = text.querySelector(".rb-deck");
  if (deck) {
    let cards = qa(deck, ".rb-deck__card");
    const name = q(deck, ".rb-deck__name"), tip = q(deck, ".rb-deck__tip");
    const tr = M.springPhys(500, 25);
    const tilt = (i) => (i === 0 ? 5 : i === 1 ? -3 : 0);
    let hovering = false, busy = false;
    const layout = (instant) => {
      cards.forEach((c, i) => {
        c.classList.toggle("is-top", i === 0);
        c.style.pointerEvents = i === 0 ? "" : "none";
        c.style.zIndex = String(cards.length - i);
        const to = { top: i > 2 ? 0 : -2 * i, opacity: i > 2 ? 0 : 1 };
        if (instant) gsap.set(c, { ...to, rotate: tilt(i) });
        else {
          gsap.to(c, { ...to, duration: 0.3, ease: ease3 });
          gsap.to(c, { rotate: tilt(i), duration: tr.duration, ease: tr.ease });
        }
      });
    };
    const label = (c) => {
      name.textContent = c.dataset.name;
      tip.style.width = `${name.offsetWidth + 32}px`;
    };
    layout(true);
    label(cards[0]);
    const lift = (y) => gsap.to(cards[1], { y, duration: tr.duration, ease: tr.ease, overwrite: "auto" });
    deck.addEventListener("pointerenter", () => { hovering = true; if (!busy) lift(-20); });
    deck.addEventListener("pointerleave", () => { hovering = false; if (!busy) lift(0); });
    cards.forEach((c) => c.addEventListener("pointerenter", () => label(c)));
    deck.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      const [first, second] = cards;
      await gsap.to(second, { y: -20, duration: tr.duration, ease: tr.ease, overwrite: "auto" });
      await gsap.to(first, { opacity: 0, duration: 0.125, ease: ease3 });
      cards = [...cards.slice(1), first];
      gsap.set(first, { y: 0 });
      layout(false);
      await gsap.to(second, { y: 0, duration: tr.duration, ease: tr.ease });
      busy = false;
      lift(hovering ? -20 : 0);
    });
  }

  addEventListener("scroll", paint, { passive: true });
  addEventListener("resize", paint);
  paint();

  // Dust — in the erasing lead-in, gray specks scatter to the upper right and fade out in 1.4s (the original Rive’s particle eraser)
  function makeDust(cv, ref) {
    const ctx = cv.getContext("2d");
    const parts = [];
    let raf = 0, last = 0, lastP = 0;
    const fit = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ink = () => getComputedStyle(document.documentElement).getPropertyValue("--kf-dim").trim() || "gray";
    const loop = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - (last || now)) / 1000));
      last = now;
      const r = cv.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.fillStyle = ink();
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age += dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 6 * dt;
        const a = Math.max(0, 1 - p.age / p.life);
        if (a <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = a;
        ctx.fillRect(p.x, p.y, p.s, p.s * 0.6);
      }
      ctx.globalAlpha = 1;
      raf = parts.length ? requestAnimationFrame(loop) : 0;
    };
    return {
      at(prog) {
        if (prog < lastP) { lastP = prog; return; }
        if (!cv.width) fit();
        const w = ref.offsetWidth, h = ref.offsetHeight, ox = 40, oy = cv.offsetHeight / 2 - h / 2;
        const from = lastP * w, to = prog * w;
        lastP = prog;
        for (let x = from; x < to; x += 2) {
          for (let k = 0; k < 3; k++) {
            parts.push({ x: ox + x + Math.random() * 3, y: oy + h * (0.25 + Math.random() * 0.55), vx: 18 + Math.random() * 40, vy: -10 - Math.random() * 26, s: 1 + Math.random() * 1.6, age: 0, life: 0.8 + Math.random() * 0.8 });
          }
        }
        if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
      },
    };
  }

  // 3D text — the same letters are stamped back to front in layers to build a rainbow thickness. The thickness stretches away from the cursor (tilt follows the cursor, as in the original 3d.riv)
  function make3d(cv, ref) {
    const ctx = cv.getContext("2d");
    const st = { depth: 0, dx: -0.55, dy: 0.83, tx: -0.55, ty: 0.83, draw: () => draw() };
    const css = getComputedStyle(document.documentElement);
    const colors = () => {
      const probe = document.createElement("span");
      cv.parentElement.append(probe);
      const out = [1, 2, 3, 4, 5].map((i) => { probe.style.color = `var(--site-3d-${i})`; return getComputedStyle(probe).color; });
      probe.style.color = "var(--kf-ink)"; out.push(getComputedStyle(probe).color);
      probe.style.color = "var(--kf-bg)"; out.push(getComputedStyle(probe).color);
      probe.remove();
      return out;
    };
    let pal = null;
    const draw = () => {
      if (!pal) pal = colors();
      const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (st.depth <= 0.001) return;
      const fs = parseFloat(getComputedStyle(ref).fontSize);
      ctx.font = `${css.getPropertyValue("--kf-weight-display").trim() || 500} ${fs}px ${getComputedStyle(ref).fontFamily}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const word = ref.textContent, cx = w / 2, cy = h / 2 + fs * 0.06;
      const len = fs * 0.4 * st.depth, steps = Math.max(1, Math.round(len));
      for (let i = steps; i >= 1; i--) {
        ctx.fillStyle = pal[Math.min(4, Math.floor(((i - 1) / steps) * 5))];
        ctx.fillText(word, cx + st.dx * i, cy + st.dy * i);
      }
      ctx.lineWidth = 1.2; ctx.strokeStyle = pal[6];
      ctx.strokeText(word, cx, cy);
      ctx.fillStyle = pal[5];
      ctx.fillText(word, cx, cy);
    };
    // Cursor: thickness tilts away from the cursor starting at the plate center, following .12 per frame
    let raf = 0;
    const ease = () => {
      st.dx += (st.tx - st.dx) * 0.12; st.dy += (st.ty - st.dy) * 0.12;
      draw();
      raf = Math.abs(st.tx - st.dx) + Math.abs(st.ty - st.dy) > 0.002 ? requestAnimationFrame(ease) : 0;
    };
    cv.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = cv.getBoundingClientRect();
      let vx = r.left + r.width / 2 - e.clientX, vy = r.top + r.height / 2 - e.clientY;
      const m = Math.hypot(vx, vy) || 1;
      st.tx = vx / m; st.ty = vy / m;
      if (!raf) raf = requestAnimationFrame(ease);
    });
    cv.addEventListener("pointerleave", () => { st.tx = -0.55; st.ty = 0.83; if (!raf) raf = requestAnimationFrame(ease); });
    document.fonts?.ready.then(draw);
    return st;
  }
})();
