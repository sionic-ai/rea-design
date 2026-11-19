// Work list — a vertical endless loop of rows. The target moves by wheel Δ/(500 × row count), and after .6s of rest it snaps to the nearest row.
// The progress value chases its target with 1 − e^(−4dt) (touch 10). The work picked by the center row is 1, the rest .2 transparent (.4s power1.out). Tapping the picked row again opens the detail.
window.gbSite.boot(() => {
  const site = window.gbSite, $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const items = $$(".js-wl"), infos = $$(".js-wl-info"), tracks = $$(".js-works-track"), bar = document.querySelector(".js-works-bar"), list = document.querySelector(".gb-wl");
  const films = $$(".gb-films canvas");
  const N = items.length;
  if (!N) return;
  list.style.setProperty("--site-bar", `${Math.round(100 / N)}%`);
  const gap = () => parseFloat(getComputedStyle(list).rowGap || "0") || 0;
  let O = items[0].offsetHeight + gap(), J = O * N;
  const wrapY = (y) => gsap.utils.wrap(-J / 2, J / 2, y);
  const place = (p) => { [items, infos].forEach((g) => g.forEach((el, i) => gsap.set(el, { yPercent: -50, y: wrapY(i * O - p * J) }))); };
  const sp = site.split($$(".js-wl-title, .js-wl-info p"));
  const k = site.touch ? 10 : 4;
  let V = 0, U = 0, snap = false, active = 0, timer = 0, leaving = false;
  const fades = items.map((el, i) => gsap.to([el, infos[i]], { opacity: 1, duration: 0.4, ease: "power1.out", paused: true }));
  gsap.set([...items, ...infos], { opacity: 0.2 });
  fades[0].progress(1);
  place(0);
  const mark = () => {
    const t = ((Math.round(U * N) % N) + N) % N;
    if (t === active) return;
    fades[active].reverse(); fades[t].play();
    active = t;
    site.setBg(films[+items[t].dataset.film || 0]);
  };
  const barTo = (p) => { const h = bar.offsetHeight, th = tracks[0].offsetHeight; gsap.set(tracks[0], { y: (h / 2 + th) * wrapP(p) }); gsap.set(tracks[1], { y: -(h / 2 + th) * (1 - wrapP(p)) }); };
  const wrapP = (p) => ((p % 1) + 1) % 1;
  gsap.ticker.add((time, dms) => {
    if (leaving) return;
    if (snap) V = Math.round(V * N) / N;
    const d = V - U;
    if (Math.abs(d) < 1e-5) return;
    U += d * (1 - Math.exp(-k * dms / 1000));
    place(U); barTo(U); mark();
  });
  addEventListener("wheel", (e) => {
    if (site.modalOpen?.()) return;
    V += e.deltaY / (500 * N);
    snap = false;
    clearTimeout(timer);
    timer = setTimeout(() => { snap = true; }, 600);
  }, { passive: true });
  let ty = 0, tt = 0, vel = 0;
  list.addEventListener("touchstart", (e) => { ty = e.touches[0].clientY; tt = e.timeStamp; vel = 0; snap = false; }, { passive: true });
  list.addEventListener("touchmove", (e) => { const y = e.touches[0].clientY, d = ty - y; V += d / J; vel = (vel + d / Math.max(e.timeStamp - tt, 1)) / 2; ty = y; tt = e.timeStamp; }, { passive: true });
  list.addEventListener("touchend", (e) => { if (e.timeStamp - tt > 200) vel = 0; V += (vel * 50) / J; snap = true; }, { passive: true });
  // Pressing an unselected row rotates to that row, and pressing the selected row moves on to detail (the transition is in shared.js)
  list.addEventListener("click", (e) => {
    const a = e.target.closest(".js-wl");
    if (!a) return;
    const n = items.indexOf(a);
    if (n === active) { leaving = true; return; }
    e.preventDefault(); e.stopPropagation();
    let r = n - active;
    r -= Math.round(r / N) * N;
    V += r / N;
    snap = true;
  }, true);
  addEventListener("resize", () => { O = items[0].offsetHeight + gap(); J = O * N; place(U); });

  // First appearance: the chosen row’s words rise from 1.5x its height below, the others from 160% below. The bar is drawn top to bottom
  const words = sp ? sp.words : [...items, ...infos];
  gsap.set(words, site.hide());
  site.setBg(films[+items[0].dataset.film || 0], true);
  site.ready.then(() => gsap.timeline({ defaults: { ...site.D } })
    .to(words, { ...site.show(), stagger: sp ? site.stagger(sp.lines, sp.words) : 0.05 }, 0)
    .fromTo(tracks, { scaleY: 0 }, { scaleY: 1 }, 0)
    .fromTo(list, { "--site-bar-op": "0%" }, { "--site-bar-op": "20%" }, 0));
});
