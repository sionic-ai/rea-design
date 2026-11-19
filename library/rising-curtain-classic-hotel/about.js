// Timeline drag — entering the section it slides in from beyond the right screen width over 2.5s power3.inOut (phone 1.5s).
// While dragging, going past the end only follows halfway. On release the last hand speed is reduced by .1 per frame as it glides, then if beyond the end it returns by .2 per frame.
// The photo · year · text in a cell are pushed sideways by flick speed × 6 · 3 · 2.5 and the photo tilts × .1°. Prev · next are .75s power3.out.
(() => {
  const S = window.mpSite;
  const box = document.querySelector("[data-drag]");
  if (!box) return;
  const track = box.querySelector("[data-drag-track]"), items = [...track.children];
  const prev = box.querySelector(".prev"), next = box.querySelector(".next"), dotBox = box.querySelector(".indicator .tg");
  const dots = items.map(() => { const b = document.createElement("button"); b.type = "button"; b.tabIndex = -1; dotBox.append(b); return b; });
  const parts = items.map((it) => [it.querySelector(".img"), it.querySelector(".year"), it.querySelector(".info")]);
  const st = { show: 0, now: 0, start: 0, follow: 0, power: 0, dotX: 0 };
  let touch = false, auto = false, px = 0, lastX = 0, dx = 0, enter = false, shown = false, frame = 0;
  const min = () => -items.at(-1).offsetLeft + (S.lg() ? innerWidth * (10 * 3 + 129 * 2) / 1440 : 0) + parseFloat(getComputedStyle(track).paddingLeft);
  const nearest = () => {
    const pad = parseFloat(getComputedStyle(track).paddingLeft);
    let best = 0, d = 1e9;
    items.forEach((it, i) => { const v = Math.abs(it.offsetLeft - pad - Math.abs(st.now)); if (v < d) { d = v; best = i; } });
    return best;
  };

  new IntersectionObserver(([en]) => {
    enter = en.isIntersecting;
    if (enter && !shown) { shown = true; gsap.to(st, { show: 1, duration: S.reduce ? 0 : S.lg() ? 2.5 : 1.5, delay: 0.1, ease: "power3.inOut" }); }
  }).observe(box);

  box.addEventListener("pointerdown", (e) => { if (auto) return; touch = true; px = lastX = e.clientX; st.start = st.now; document.body.style.userSelect = "none"; box.style.cursor = "grabbing"; });
  addEventListener("pointermove", (e) => { dx = e.clientX - lastX; lastX = e.clientX; });
  addEventListener("pointerup", () => { if (!touch) return; touch = false; st.start = st.now; st.follow = dx; document.body.style.userSelect = ""; box.style.cursor = ""; });

  const go = (back) => {
    if (auto) return;
    auto = true;
    const pad = parseFloat(getComputedStyle(track).paddingLeft);
    const i = gsap.utils.clamp(0, items.length - 1, nearest() + (back ? -1 : 1));
    const to = gsap.utils.clamp(min(), 0, -(items[i].offsetLeft - pad));
    gsap.to(st, { now: to, duration: S.reduce ? 0 : 0.75, ease: "power3.out", onComplete: () => { auto = false; st.start = st.now; st.follow = 0; } });
  };
  prev.addEventListener("click", () => go(true));
  next.addEventListener("click", () => go(false));

  gsap.ticker.add(() => {
    if (!enter) return;
    const lo = min(), hi = 0, was = st.now;
    if (touch) {
      let n = st.start + (lastX - px);
      if (n > hi) n = hi + (n - hi) * 0.5;
      if (n < lo) n = lo + (n - lo) * 0.5;
      st.now = n;
    } else if (!auto) {
      st.follow += (0 - st.follow) * 0.1;
      st.start += st.follow;
      const n = st.start + st.follow;
      if (n > hi) st.now += (hi - st.now) * 0.2;
      else if (n < lo) st.now += (lo - st.now) * 0.2;
      else st.now = gsap.utils.clamp(lo, hi, n);
      if (n > hi || n < lo) st.start = st.now;
    }
    next.classList.toggle("is-off", st.now <= lo + 1);
    prev.classList.toggle("is-off", st.now >= hi - 1);
    if (frame++ % 2 === 0) { const id = nearest(); dots.forEach((d, i) => d.classList.toggle("is-on", i === id)); st.dotX += (Math.max(0, 16 * (id - 3)) - st.dotX) * 0.1; gsap.set(dotBox, { x: -st.dotX }); }
    st.power += (was - st.now - st.power) * 0.1;
    gsap.set(track, { x: st.now + gsap.utils.interpolate(innerWidth, 0, st.show) });
    if (!S.reduce) parts.forEach(([img, year, info]) => {
      gsap.set(img, { x: st.power * 2 * 3, rotation: st.power * 0.1 });
      gsap.set(year, { x: st.power * 2 * 1.5 });
      gsap.set(info, { x: st.power * 2 * 1.25 });
    });
  });
})();
