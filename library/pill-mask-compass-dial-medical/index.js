// First page: pill-mask Hero · callout words appearing · fixed surpass scene · bar transition → compass dial · audio story
(() => {
  const { reduce } = CP;
  const mm = gsap.matchMedia();

  /* ── Hero ── video size by frame f: 0~1 1.1x, 1→2 .5x, 2→3 .8x and 10% up, 5→7 .4x and 10% down (original onProgress values) */
  const hero = document.querySelector(".hp-hero");
  const media = hero.querySelector(".hp-hero__media");
  const lines = (sel, which) => [...hero.querySelectorAll(`.hp-hero__type.${which} .hp-hero__slot${sel} .hp-hero__line`)];
  const phone = () => innerWidth <= 600;
  if (!reduce) {
    gsap.set(media, { scale: 1.1, filter: "blur(8px)", transformOrigin: "center center" });
    gsap.to(media, { filter: "blur(0px)", duration: 1.8, ease: "power2.out", delay: 0.2 });
  }
  let past = false;
  CP.mask(hero, {
    frames: "HERO_MATTE_FRAMES", target: hero.querySelector(".cp-mask__reveal"), end: "+=200%", scrub: true,
    onProgress: (p, f) => {
      let s = 1.1, y = 0;
      if (f >= 1 && f <= 2) s = 1.1 - (f - 1) * 0.6;
      if (f >= 2 && f <= 3) { const n = f - 2; s = 0.5 + 0.3 * n; y = -10 * n; }
      if (f >= 2 || past) {
        past = true;
        const e = Math.max(0, Math.min(1, f - 2));
        if (!phone()) {
          gsap.set([...lines(".is-top", "is-white"), ...lines(".is-mid", "is-white"), ...lines(".is-top", "is-behind"), ...lines(".is-mid", "is-behind")], { opacity: 1 - e, y: 0 });
        }
        gsap.set(hero.querySelectorAll(".hp-hero__type.is-behind .hp-hero__line"), { color: `color-mix(in oklab, var(--kf-ink) ${30 + 70 * e}%, transparent)` });
      }
      if (f > 3) { s = 0.8; y = -10; }
      if (f >= 5) { const n = Math.min(1, (f - 5) / 3); s = 0.8 - 0.4 * n; y = -10 + 20 * n; }
      gsap.set(media, { scale: s, yPercent: y });
    },
  });
  const pause = hero.querySelector(".hp-hero__pause");
  pause.addEventListener("click", () => {
    const on = pause.classList.toggle("is-paused");
    hero.classList.toggle("is-paused", on);
    pause.setAttribute("aria-label", on ? "Hero video play" : "Hero video paused");
    pause.innerHTML = on ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7l8 5-8 5z" fill="currentColor"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="7" width="2.4" height="10" rx="1" fill="currentColor"/><rect x="13.6" y="7" width="2.4" height="10" rx="1" fill="currentColor"/></svg>';
  });

  /* Callout: words go opacity 0, y 30 → .7s staggered .06 with power2.out, and from .2s before the end the icon grows width 0→1em and left 12px over .5s */
  const icons = {
    sprout: '<path d="M12 21V11M12 11c0-4 3-6 7-6 0 4-3 6-7 6zM12 13c0-3-2-5-6-5 0 3 2 5 6 5z" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
    wave: '<path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    person: '<circle cx="12" cy="7" r="3.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M4 21v-3a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v3" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  };
  const statement = document.querySelector("[data-reveal]");
  statement.querySelectorAll("i[data-icon]").forEach((i) => { i.setAttribute("aria-hidden", "true"); i.innerHTML = `<svg viewBox="0 0 24 24">${icons[i.dataset.icon]}</svg>`; });
  if (!reduce) {
    const iconEls = [...statement.querySelectorAll("i[data-icon]")];
    const split = new SplitText(statement, { type: "words", wordsClass: "callout__w" });
    const words = split.words.filter((w) => !w.querySelector("i") || w.textContent.trim());
    const fs = parseFloat(getComputedStyle(statement).fontSize);
    gsap.set(words, { opacity: 0, y: 30 });
    gsap.set(iconEls, { width: 0, marginLeft: 0, opacity: 0 });
    const tl = gsap.timeline({ paused: true, onComplete: () => gsap.set(iconEls, { clearProps: "width,marginLeft" }) });
    tl.to(words, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power2.out" })
      .to(iconEls, { width: fs, marginLeft: 12, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.2");
    ScrollTrigger.create({ trigger: statement, start: "top 80%", once: true, onEnter: () => tl.play() });
  }

  /* ── Overcome ── contour lines (our own drawing): isolines of a noise field as curves wobbled line by line ── */
  const topo = document.querySelector(".plateau__topo");
  {
    let d = "";
    for (let k = 0; k < 46; k++) {
      const base = -40 + k * 24, a1 = 18 + (k % 7) * 3, ph = k * 0.37;
      let p = "";
      for (let x = -40; x <= 1640; x += 20) {
        const y = base + Math.sin(x / 210 + ph) * a1 + Math.sin(x / 83 + ph * 2.1) * 7 + Math.cos(x / 390 - k * 0.21) * 34;
        p += `${p ? "L" : "M"}${x} ${y.toFixed(1)}`;
      }
      d += p;
    }
    topo.innerHTML = `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.1"/>`;
  }
  mm.add("(min-width: 1001px) and (prefers-reduced-motion: no-preference)", () => {
    const sec = document.querySelector(".plateau");
    const top = sec.querySelector(".plateau__top"), bottom = sec.querySelector(".plateau__bottom");
    const body = sec.querySelector(".plateau__body"), intro = sec.querySelector(".plateau__intro");
    const cards = [...sec.querySelector(".plateau__cards").children];
    const eyebrows = [...sec.querySelectorAll(".fig-card__eyebrow")];
    const bg = sec.querySelector(".plateau__bg");
    gsap.set(body, { opacity: 0 });
    const b = Math.min(0.25 * innerWidth, 800);
    const gap = bottom.getBoundingClientRect().top - top.getBoundingClientRect().bottom;
    gsap.set(top, { x: b, y: 80 });
    gsap.set(bottom, { x: -b, y: -gap + 80 });
    const k = cards.length;
    cards.forEach((c, i) => gsap.set(c, { y: `${70 + 8 * i}svh` }));
    const e0 = k === 2 ? 78 : 88.6, t0 = k === 2 ? 10 : 30.28;
    eyebrows.forEach((el, i) => {
      const a = e0 - (e0 - t0) * (k > 1 ? i / (k - 1) : 0) - 30.28 - (70 + 8 * i);
      gsap.set(el, { y: `${a + 10 * (i > 0 && i < k - 1)}svh`, opacity: 0 });
    });
    const tl = gsap.timeline({ defaults: { duration: 1 }, scrollTrigger: { trigger: sec, start: "top top", end: "+=200%", pin: true, scrub: 0.5 } });
    tl.fromTo(top, { x: b, y: 80 }, { x: 150, y: -30, duration: 0.2, ease: "none" }, 0)
      .fromTo(bottom, { x: -b, y: -gap + 80 }, { x: -150, y: 30, duration: 0.2, ease: "none" }, 0)
      .to(eyebrows, { opacity: 0.4, duration: 0.1, ease: "none" }, 0.1)
      .to(eyebrows, { opacity: 1, ease: "none", duration: 0.5 }, 0.2)
      .to(body, { opacity: 1, duration: 0.15, ease: "none" }, 0.1)
      .to(intro, { y: "-110vh", ease: "none", duration: 0.7 }, 0.2)
      .to(cards, { y: 0, ease: "none", duration: 0.7 }, 0.2)
      .to(eyebrows, { y: 0, ease: "none", duration: 0.5 }, 0.2);
    const drift = gsap.to(bg, { y: "-9%", x: "5%", scale: 1.08, duration: 14, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true });
    ScrollTrigger.create({ trigger: sec, start: "top 90%", once: true, onEnter: () => drift.play() });
  });

  /* ── 36-bar transition ── original TransitionAnimation(iso-bar): half screen first (top 50%)·+=270% · hold .09 · just appears at the first 15% · dial .4s at 92.7% */
  const wrap = document.querySelector(".dial-wrap");
  const over = wrap.querySelector(".dial-stage__over");
  const H = (0.91 * 220 + 50) / 270;
  let shown = false;
  const showDial = (on, ms) => {
    if (on === shown) return;
    shown = on;
    over.style.transition = ms ? `opacity ${ms}ms ease` : "none";
    over.style.opacity = on ? "1" : "0";
    over.inert = !on;
  };
  over.inert = true;
  const st = CP.mask(wrap.querySelector(".dial-stage"), {
    frames: "ISO_BAR_FRAMES", target: wrap.querySelector(".dial-stage__rose"), trigger: wrap, pin: false,
    start: "top 50%", end: "+=270%", scrub: 0.5, dwell: 0.09, fadeIn: true,
    onProgress: (p) => showDial(p >= H, p >= H ? 400 : 600),
  });
  if (!st) showDial(true, 0);

  /* Compass dial — 26 ticks · radius 418 · within cos 80° of the cursor direction width 8→55 · crosshair (N/E/S/W) · ±5° 6s sine yoyo */
  const svg = document.querySelector(".dial__svg");
  const NS = "http://www.w3.org/2000/svg";
  let dialKill = null;
  const buildDial = () => {
    dialKill?.();
    svg.replaceChildren();
    const big = innerWidth >= 800;
    const count = 26, R = big ? 418 : 200, minH = big ? 92 : 53, maxH = minH, minW = 8, maxW = big ? 55 : 25;
    const cosI = Math.cos((80 * Math.PI) / 180);
    const labelSize = 0.055 * R, M = R + 38, P = big ? 2.5 * labelSize : 0, A = big ? M + P : R + maxH / 2;
    svg.setAttribute("width", Math.round(2 * A)); svg.setAttribute("height", Math.round(2 * A));
    svg.setAttribute("viewBox", `${-A} ${-A} ${2 * A} ${2 * A}`);
    const g = document.createElementNS(NS, "g"); g.setAttribute("class", "dial__ticks"); svg.append(g);
    const ticks = Array.from({ length: count }, (_, i) => {
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", -minW / 2); r.setAttribute("y", -R); r.setAttribute("width", minW); r.setAttribute("height", minH); r.setAttribute("rx", minW / 2);
      r.setAttribute("fill", "currentColor"); r.setAttribute("transform", `rotate(${(360 / count) * i})`);
      g.append(r); return r;
    });
    const cross = document.createElementNS(NS, "g"); svg.append(cross);
    if (big) {
      const inner = M - 172;
      [[0, -1, "N", "middle", 0, -(M + 16)], [1, 0, "E", "start", M + 16, 0.35 * labelSize], [0, 1, "S", "middle", 0, M + 16 + 0.7 * labelSize], [-1, 0, "W", "end", -(M + 16), 0.35 * labelSize]].forEach(([dx, dy, t, an, lx, ly]) => {
        const l = document.createElementNS(NS, "line");
        l.setAttribute("x1", dx * inner); l.setAttribute("y1", dy * inner); l.setAttribute("x2", dx * M); l.setAttribute("y2", dy * M);
        l.setAttribute("stroke", "currentColor"); l.setAttribute("stroke-width", 2); l.setAttribute("stroke-linecap", "round"); l.setAttribute("opacity", 0.5);
        const tx = document.createElementNS(NS, "text");
        tx.setAttribute("x", lx); tx.setAttribute("y", ly); tx.setAttribute("text-anchor", an); tx.setAttribute("font-size", labelSize);
        tx.setAttribute("letter-spacing", "0.12em"); tx.setAttribute("fill", "currentColor"); tx.setAttribute("opacity", 0.5); tx.style.fontFamily = "var(--kf-font-mono)"; tx.textContent = t;
        cross.append(l, tx);
      });
    }
    const draw = (x, y) => {
      ticks.forEach((r, i) => {
        const ang = ((2 * Math.PI) / count) * i;
        const s = Math.max(0, (Math.sin(ang) * x + -Math.cos(ang) * y - cosI) / (1 - cosI));
        const h = minH + (maxH - minH) * s, w = minW + (maxW - minW) * s;
        r.setAttribute("x", -w / 2); r.setAttribute("width", w); r.setAttribute("height", h); r.setAttribute("rx", w / 2);
      });
    };
    if (reduce) { draw(0, 0); return; }
    gsap.set(g, { rotation: -5, svgOrigin: "0 0" });
    const sway = gsap.to(g, { rotation: 5, svgOrigin: "0 0", duration: 6, ease: "sine.inOut", yoyo: true, repeat: 10 });
    if (!big) {
      const s = { angle: 0 };
      const spin = gsap.to(s, { angle: 2 * Math.PI, duration: 5, ease: "none", repeat: 10 });
      const tick = () => draw(Math.sin(s.angle), -Math.cos(s.angle));
      gsap.ticker.add(tick);
      dialKill = () => { gsap.ticker.remove(tick); spin.kill(); sway.kill(); };
      return;
    }
    const v = { x: 0, y: 0 };
    const tick = () => draw(v.x, v.y);
    gsap.ticker.add(tick);
    const host = svg.closest(".dial");
    const move = (e) => {
      const b = svg.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2), d = Math.hypot(dx, dy) || 1;
      gsap.to(v, { x: dx / d, y: dy / d, duration: 0.4, ease: "power2.out", overwrite: true });
    };
    const leave = () => gsap.to(v, { x: 0, y: 0, duration: 0.8, ease: "power2.out", overwrite: true });
    host.addEventListener("mousemove", move); host.addEventListener("mouseleave", leave);
    dialKill = () => { gsap.ticker.remove(tick); sway.kill(); gsap.killTweensOf(v); host.removeEventListener("mousemove", move); host.removeEventListener("mouseleave", leave); };
  };
  buildDial();
  let lastW = innerWidth;
  addEventListener("resize", () => { if ((innerWidth >= 800) !== (lastW >= 800)) buildDial(); lastW = innerWidth; });

  /* ── Audio story ── title, body, link and pill rise 24px from below in sequence at .6s stagger .15 · playback uses wavesurfer (3 bars, gap 4, radius 2, height 32) */
  const stories = document.querySelector(".stories");
  const fadeEls = [stories.querySelector("h2"), stories.querySelector(".stories__text p"), stories.querySelector(".stories__text .cp-link-mono"), ...stories.querySelectorAll(".story:not(.is-more)"), stories.querySelector(".stories__more")];
  if (!reduce) gsap.timeline({ scrollTrigger: { trigger: stories, start: "top 80%", once: true } }).from(fadeEls, { opacity: 0, y: 24, duration: 0.6, ease: "power2.out", stagger: 0.15 });

  const silentWav = (sec) => {
    const rate = 8000, n = Math.round(rate * sec), buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, "data"); v.setUint32(40, n, true);
    new Uint8Array(buf, 44).fill(128);
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  };
  const cssColor = (name) => { const s = document.createElement("span"); s.style.color = `var(${name})`; document.body.append(s); const c = getComputedStyle(s).color; s.remove(); return c; };
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  let current = null;
  stories.querySelectorAll(".story").forEach((li, idx) => {
    const play = li.querySelector(".story__play"), time = li.querySelector(".story__time"), dur = +li.dataset.dur;
    let ws = null;
    const stop = () => { ws?.pause(); li.classList.remove("is-playing"); };
    play.addEventListener("click", () => {
      if (current && current !== li) current.dispatchEvent(new Event("cp-stop"));
      current = li;
      li.classList.add("is-open");
      if (!ws && window.WaveSurfer) {
        const peaks = Array.from({ length: 160 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.37 + idx) * Math.cos(i * 0.11)));
        ws = WaveSurfer.create({
          container: li.querySelector(".story__wave"), height: 32, barWidth: 3, barGap: 4, barRadius: 2, normalize: true, cursorWidth: 0,
          waveColor: cssColor("--kf-line"), progressColor: cssColor("--kf-dim"), url: silentWav(dur), peaks: [peaks], duration: dur,
        });
        ws.on("timeupdate", (t) => (time.textContent = fmt(t)));
        ws.on("finish", () => { li.classList.remove("is-playing"); });
      }
      if (li.classList.contains("is-playing")) stop();
      else { ws?.play(); li.classList.add("is-playing"); }
    });
    li.addEventListener("cp-stop", stop);
  });
  stories.querySelector("[data-more]").addEventListener("click", (e) => {
    const more = [...stories.querySelectorAll(".story.is-more")];
    more.forEach((m) => (m.hidden = false));
    e.currentTarget.closest(".stories__more").hidden = true;
    if (!reduce) gsap.from(more, { opacity: 0, y: 24, duration: 0.6, ease: "power2.out", stagger: 0.15 });
    ScrollTrigger.refresh();
  });

  CP.fadeUps();
})();
