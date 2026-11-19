// Hero — flip through the five chosen works with a wheel. One step = The current word exits to -150% with inQuint(.85), and after .85 the next word enters from 160% below with outQuint.
// Steps are chained on one timeline and progress chases the target by 1 − e^(−1.5dt), wrapping from the end back to the start. The wheel needs over 30 accumulated for one step, touch needs 40px.
window.gbSite.boot(() => {
  const site = window.gbSite, $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const works = $$(".js-work"), roles = $$(".js-roles"), tracks = $$(".js-home-track"), bar = document.querySelector(".js-home-bar");
  const panel = document.querySelector(".js-panel")._film, footer = document.querySelector(".js-home-footer");
  const films = $$(".gb-films canvas");
  const N = works.length, D = site.D;
  const spWork = works.map((w) => site.split($$(".js-work-title, .js-work-info", w)));
  const spRole = roles.map((r) => site.split($$("p", r)));
  const spFoot = site.split(footer);
  const wordsOf = (sp, el) => (sp ? sp.words : [el]);
  const linesOf = (sp) => (sp ? sp.lines : []);
  const workW = works.map((w, i) => wordsOf(spWork[i], w)), roleW = roles.map((r, i) => wordsOf(spRole[i], r));
  const stag = (i) => site.stagger(linesOf(spWork[i]), workW[i]);

  // Steps timeline
  const q = gsap.timeline({ paused: true, defaults: { ...D, lazy: false } });
  let t = 0;
  works.forEach((w, r) => {
    const next = (r + 1) % N, label = `step-${r}`, after = `${label}+=${D.duration}`;
    if (r > 0) gsap.set(w, { pointerEvents: "none" });
    q.addLabel(label, t)
      .to(workW[r], { yPercent: -150, ease: "inQuint", stagger: stag(r) }, label)
      .to(roleW[r], { yPercent: -150, ease: "inQuint", stagger: stag(r) }, label)
      .set(w, { pointerEvents: "none" }, after)
      .set(works[next], { pointerEvents: "auto" }, after);
    if (r < N - 1) q.from(workW[next], { yPercent: 160, ease: "outQuint", stagger: stag(next) }, after).from(roleW[next], { yPercent: 160, ease: "outQuint", stagger: stag(next) }, after);
    else q.set([...workW[0], ...roleW[0]], { yPercent: 160 }, after).to(workW[0], { yPercent: 0, ease: "outQuint", stagger: stag(0) }, after).to(roleW[0], { yPercent: 0, ease: "outQuint", stagger: stag(0) }, after);
    t = q.duration();
  });
  const total = q.duration();
  q.to(tracks[0], { y: () => bar.offsetHeight, duration: total, ease: "none" }, 0).from(tracks[1], { y: () => -bar.offsetHeight, duration: total, ease: "none" }, 0);
  const labels = Object.entries(q.labels).map(([name, time]) => ({ name, time })).sort((a, b) => a.time - b.time);
  const wrap = (x) => ((x % 1) + 1) % 1;
  let U = 0.0001, H = U, W = 0, active = 0, K = 0, kTimer = 0, frozen = false;
  q.progress(U);

  // First reveal: the current work word, role and footer text rise from 160% below, and the progress bar is drawn top to bottom
  const show = gsap.timeline({ paused: true, defaults: { ...D } })
    .fromTo([...workW[0], ...roleW[0]], site.hide(), { ...site.show(), stagger: stag(0) }, 0)
    .fromTo(wordsOf(spFoot, footer), site.hide(), { ...site.show(), stagger: site.stagger(linesOf(spFoot), wordsOf(spFoot, footer)) }, 0)
    .fromTo(tracks, { scaleY: 0 }, { scaleY: 1 }, 0)
    .fromTo(document.querySelector(".gb-home"), { "--site-bar-op": "0%" }, { "--site-bar-op": "20%" }, 0);
  gsap.set([...workW[0], ...roleW[0], ...wordsOf(spFoot, footer)], site.hide());
  site.ready.then(() => show.play());

  // When the current work changes, swap the blurred video behind the screen and the video slot
  const settle = () => {
    const at = U * total;
    let i = labels.length - 1;
    while (i >= 0 && labels[i].time + D.duration > at) i--;
    const n = i < 0 ? 0 : (i + 1) % N;
    if (n === active) return;
    active = n;
    site.setBg(films[n]);
    panel.set(n);
  };
  const moving = () => { let d = H - U; d -= Math.round(d); return Math.abs(d) > 0.35 * W; };
  const step = (dir) => {
    const at = H * total;
    let r = labels.length - 1;
    while (r > 0 && labels[r].time > at + 1e-4) r--;
    let d = labels[(r + dir + N) % N].time / total - H;
    d -= Math.round(d);
    W = Math.abs(d);
    H = wrap(H + d);
  };
  gsap.ticker.add((time, dms) => {
    if (frozen) return;
    let d = H - U;
    d -= Math.round(d);
    d = Math.floor(d * 1e4) / 1e4;
    if (d === 0) return;
    U = wrap(U + d * (1 - Math.exp(-1.5 * dms / 1000)));
    q.progress(U);
    settle();
  });
  addEventListener("wheel", (e) => {
    if (site.modalOpen?.()) return;
    clearTimeout(kTimer);
    kTimer = setTimeout(() => { K = 0; }, 200);
    if (moving()) { K = 0; return; }
    if (Math.sign(e.deltaY) !== Math.sign(K)) K = 0;
    K += e.deltaY;
    if (Math.abs(K) < 30) return;
    K = 0;
    step(Math.sign(e.deltaY));
  }, { passive: true });
  let ty = 0, armed = false;
  addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; armed = true; }, { passive: true });
  addEventListener("touchmove", (e) => { if (!armed) return; const d = ty - e.touches[0].clientY; if (Math.abs(d) < 40 || moving()) return; armed = false; step(Math.sign(d)); }, { passive: true });
  addEventListener("touchend", () => { armed = false; }, { passive: true });
  // On leaving, set to the nearest step to match .85 inOutQuint
  document.addEventListener("click", (e) => {
    if (!e.target.closest("a[href$='.html']")) return;
    frozen = true;
    const lab = labels[active === 0 ? 0 : active] || labels[0];
    let d = lab.time / total - U;
    d -= Math.round(d);
    const o = { p: U };
    gsap.to(o, { p: U + d, duration: 0.85, ease: "inOutQuint", onUpdate: () => { U = wrap(o.p); q.progress(U); } });
  }, true);
});
