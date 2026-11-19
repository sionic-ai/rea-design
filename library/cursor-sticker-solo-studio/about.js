// Service intro: pin section that builds a brand board. Same cursor language as the first page’s sentence section (arrow·text·pen·move)
// Four notes are stuck on (2.4s drag) → the notes are sucked into the foundation strip (from 26.8s) → the logo is drawn with guide lines and semicircles (from 33.6s) →
// After the swatches, typeface and tone appear (46~64s) → the board is cleared and four mockups tilt and fly in (74.8s~, 1.4s apart) → the final sticker.
(() => {
  const SX = window.SX;
  const sec = document.querySelector(".bd");
  if (!sec || SX.reduced) return;
  const Q = (s) => sec.querySelector(s), QA = (s) => [...sec.querySelectorAll(s)];
  const split = (el) => {
    const t = el.dataset.t || el.textContent;
    el.dataset.t = t;
    el.innerHTML = [...t].map((c) => `<span style="display:inline-block;white-space:pre">${c}</span>`).join("");
    return [...el.children];
  };
  let tl;
  const build = () => {
    if (tl) { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.revert(); tl.kill(); }
    sec.classList.add("on");
    const pin = Q(".sx-pin"), cur = Q(".sx-cur"), ico = Q(".sx-ico");
    const vw = pin.clientWidth, vh = pin.clientHeight, PR = pin.getBoundingClientRect();
    const R = (el) => { const r = el.getBoundingClientRect(); return { l: r.left - PR.left, t: r.top - PR.top, r: r.right - PR.left, b: r.bottom - PR.top, w: r.width, h: r.height, cx: r.left - PR.left + r.width / 2, cy: r.top - PR.top + r.height / 2 }; };
    tl = gsap.timeline({ defaults: { ease: "power3.out" }, scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 1 } });
    const icon = (n, t) => tl.set(cur, { attr: { "data-i": n } }, t);
    const go = (x, y, t, d, e = "power2.inOut") => tl.to(cur, { x, y, duration: d, ease: e }, t);
    const click = (t) => tl.to(ico, { scale: 0.78, duration: 0.25, ease: "power1.inOut", yoyo: true, repeat: 1 }, t);
    tl.set(cur, { x: vw * 0.9, y: vh * 1.1 }, 0);
    icon("arrow", 0);

    // Intro: two stickers and a paragraph, while the pale giant text behind flows left from start to end
    const a = Q(".sx-st.a"), b = Q(".sx-st.b"), p = Q(".sx-intro .sx-p");
    const ra = R(a), rb = R(b), rp = R(p);
    go(ra.cx, ra.cy, 0, 1.4); click(1.4);
    tl.from(a, { scale: 2.2, rotation: -14, autoAlpha: 0, duration: 2.4, ease: "back.out(2.2)" }, 1.5);
    go(rb.cx + rb.w * 0.2, rb.cy, 2.2, 1.2); click(3.4);
    tl.from(b, { scale: 2.2, rotation: 14, autoAlpha: 0, duration: 2.4, ease: "back.out(2.2)" }, 3.5);
    go(rp.l + rp.w * 0.6, rp.b + 20, 4.2, 1.6);
    tl.from(p, { y: 40, autoAlpha: 0, duration: 2.2 }, 4.8)
      .to(Q(".sx-intro"), { yPercent: -60, autoAlpha: 0, duration: 3, ease: "power2.in" }, 7)
      .fromTo(Q(".sx-bg"), { x: vw * 0.1 }, { x: -vw * 0.7, ease: "none", duration: 96 }, 0)
      .from(Q(".sx-frame"), { autoAlpha: 0, duration: 1.5 }, 8.5);

    // Top-left step chip: one drops in and sticks per step, then drops out when the next chip arrives
    const chips = QA(".sx-chips span"), ts = [9, 24.5, 33, 46, 60, 74];
    ts.forEach((t, i) => {
      tl.fromTo(chips[i], { autoAlpha: 0, y: -30, rotation: -14, scale: 1.3 }, { autoAlpha: 1, y: 0, rotation: 0, scale: 1, duration: 1.4, ease: "back.out(2.4)", immediateRender: false }, t);
      if (i < ts.length - 1) tl.to(chips[i], { autoAlpha: 0, y: 24, duration: 0.8, ease: "power2.in" }, ts[i + 1] - 1);
    });
    gsap.set(chips, { autoAlpha: 0 });

    // Four notes: dragged in from off-screen and pinned
    const notes = QA(".bd-note"), nr = notes.map(R);
    notes.forEach((n, i) => {
      const t = 11 + i * 3.2, r = nr[i], dx = (i % 2 ? 1 : -1) * vw * 0.18, dy = vh * 0.3;
      go(r.cx + dx, r.cy + dy, t - 1.2, 1.1); icon("move", t); click(t);
      tl.from(n, { x: dx, y: dy, autoAlpha: 0, rotation: i % 2 ? 12 : -12, scale: 1.08, duration: 2.4, ease: "power2.inOut" }, t);
      tl.to(cur, { x: r.cx, y: r.cy, duration: 2.4, ease: "power2.inOut" }, t);
    });
    // The base strip lays out from the left and the notes shrink as they get sucked into it
    const base = Q(".bd-base"), rb2 = R(base);
    icon("arrow", 24.8); go(rb2.l, rb2.cy, 24.8, 1.4);
    tl.from(base, { scaleX: 0, transformOrigin: "0% 50%", duration: 3, ease: "power2.inOut" }, 26.6);
    tl.to(cur, { x: rb2.r, y: rb2.cy, duration: 3, ease: "power2.inOut" }, 26.6);
    notes.forEach((n, i) => {
      const r = nr[i];
      tl.to(n, { x: rb2.l + rb2.w * (0.2 + i * 0.2) - r.cx, y: rb2.cy - r.cy, scale: 0.2, rotation: 0, autoAlpha: 0, duration: 1.6, ease: "power2.in" }, 26.8 + i * 0.4);
    });
    // Logo: guide lines → upper semicircle → lower semicircle → dot → name typing
    const mark = Q(".bd-mark"), rm = R(mark);
    tl.fromTo(QA(".bd-guides *"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, stagger: 0.35, ease: "power1.inOut" }, 33.6);
    icon("pen", 34.6); go(rm.l + rm.w * 0.2, rm.cy, 34.6, 1.6);
    tl.from(QA(".bd-anc rect"), { scale: 0, transformOrigin: "50% 50%", duration: 0.6, stagger: 0.8, ease: "back.out(3)" }, 37);
    tl.to(cur, { x: rm.r - rm.w * 0.2, y: rm.cy, duration: 2.4, ease: "power1.inOut" }, 37);
    icon("arrow", 40); go(rm.cx, rm.t + rm.h * 0.3, 40.6, 0.8); click(41.4);
    tl.from(Q(".bd-s1"), { scale: 0, transformOrigin: "50% 100%", duration: 1.4, ease: "back.out(1.8)" }, 41.5);
    go(rm.cx, rm.b - rm.h * 0.15, 42.2, 0.7); click(42.9);
    tl.from(Q(".bd-s2"), { scale: 0, transformOrigin: "50% 0%", duration: 1.4, ease: "back.out(1.8)" }, 43)
      .to(QA(".bd-guides, .bd-anc"), { autoAlpha: 0, duration: 1 }, 44.4);
    const word = Q(".bd-word"), rw = R(word), wc = split(word);
    icon("text", 44.6); go(rw.l, rw.cy, 44, 0.6);
    tl.from(wc, { autoAlpha: 0, duration: 0.05, stagger: 2.2 / wc.length, ease: "none" }, 44.6);
    tl.to(cur, { x: rw.r, y: rw.cy, duration: 2.2, ease: "none" }, 44.6);
    // Color swatches, typefaces, tone of voice
    icon("arrow", 47);
    QA(".bd-sw").forEach((s, i) => {
      const r = R(s), t = 47.6 + i * 1.3;
      go(r.cx, r.cy, t - 0.9, 0.8); click(t);
      tl.from(s, { scale: 0, rotation: -40, autoAlpha: 0, duration: 1.4, ease: "back.out(2.2)" }, t);
    });
    const ty = Q(".bd-type"), rt = R(ty);
    go(rt.l, rt.cy, 53.6, 1); icon("text", 54.6);
    tl.from(QA(".bd-type > div"), { yPercent: 60, autoAlpha: 0, duration: 1.6, stagger: 0.8, ease: "back.out(2)" }, 54.6);
    tl.to(cur, { x: rt.r, y: rt.cy, duration: 2.4, ease: "none" }, 54.6);
    const tone = Q(".bd-tone"), rto = R(tone);
    icon("move", 60.5); go(rto.cx + vw * 0.08, rto.cy + vh * 0.2, 58.5, 1.4); click(60.5);
    tl.from(tone, { x: vw * 0.08, y: vh * 0.2, rotation: 14, autoAlpha: 0, scale: 1.1, duration: 2.4, ease: "power2.inOut" }, 60.5);
    tl.to(cur, { x: rto.cx, y: rto.cy, duration: 2.4, ease: "power2.inOut" }, 60.5);
    icon("arrow", 63.2); go(rto.l + rto.w * 0.3, rto.b + 30, 63.2, 1.4);
    go(vw * 1.05, vh * 0.3, 70, 2.4);
    // The board clears away and four mockups fly in tilted from below. The signboard wobbles elastically
    tl.to(QA(".bd-base, .bd-sws, .bd-type, .bd-tone, .bd-logo"), { autoAlpha: 0, y: 30, duration: 1.6, stagger: 0.15, ease: "power2.in" }, 72.4);
    QA(".bd-mocks > div").forEach((m, i) => tl.from(m, { y: vh * 0.5, rotation: i % 2 ? 18 : -18, autoAlpha: 0, duration: 2.4, ease: "back.out(1.5)" }, 74.8 + i * 1.4));
    tl.from(Q(".bd-sign"), { rotation: -14, transformOrigin: "50% 0%", duration: 3, ease: "elastic.out(1,.35)" }, 77);
    tl.to(QA(".bd-mocks > div"), { autoAlpha: 0.25, duration: 1.4 }, 86.4);
    tl.from(Q(".sx-end .sx-st"), { scale: 2.6, rotation: -18, autoAlpha: 0, duration: 2.4, ease: "back.out(2)" }, 87)
      .from(Q(".sx-end .sx-p"), { y: 30, autoAlpha: 0, duration: 1.6 }, 88.4)
      .to({}, { duration: 4 }, 92);
  };
  const run = () => { build(); ScrollTrigger.refresh(); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(run);
  let lw = innerWidth, rt;
  addEventListener("resize", () => { if (innerWidth === lw) return; lw = innerWidth; clearTimeout(rt); rt = setTimeout(run, 250); });
})();
