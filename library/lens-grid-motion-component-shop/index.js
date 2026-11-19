/* Home: hero entrance · lens wall, demo stage (circular slider + value plate), bead tabs, cylinder, site pile scrub, reviews · pricing · subscription wall */
(() => {
  const { reduce, shotSVG } = window.AN;
  const mm = gsap.matchMedia();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ── Hero: title lines rise inside a mask (1.2s expo.out, stagger .1) and the wall unfolds along with them ── */
  const copy = $("[data-hero-copy]");
  const wall = window.ANGL?.wall($("[data-hero-gl]"), { count: 24, copyEl: copy, onPick: () => { location.href = "detail.html"; } });
  const h1 = $(".an-h1", copy);
  h1.innerHTML = h1.innerHTML.split(/<br\s*\/?>/i).map((l) => `<span class="an-line"><span>${l}</span></span>`).join("");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline({ delay: 0.45 });
    tl.from($$(".an-line > span", h1), { yPercent: 110, duration: 1.2, stagger: 0.1, ease: "expo.out" })
      .from([$(".an-lead", copy), $(".an-hero__btns", copy)], { autoAlpha: 0, y: 16, duration: 1, stagger: 0.08, ease: "expo.out" }, 0.25)
      .from($(".an-logos .an-small", copy), { autoAlpha: 0, duration: 0.6, ease: "power2.out" }, 0.5)
      .from($$("[data-rise-item]", copy), { yPercent: 100, duration: 0.6, stagger: 0.08, ease: "power2.out" }, 0.5)
      .add(() => wall?.intro(), 0.9);
  });
  if (reduce) wall?.intro();

  /* ── Demo stage: circle perimeter (radius = card width × bend) card is dragged to rotate, when released it snaps to the nearest slot per its length and curve ── */
  const stage = $("[data-demo-stage]"), ringBox = $("[data-demo-ring]");
  const labels = ["Person profile silhouette · orange background · portrait 3:4", "Single red sneaker · dark background · portrait 3:4", "Person profile · purple lighting · portrait 3:4", "Product still life · light gray · portrait 3:4"];
  const cards = Array.from({ length: 8 }, (_, i) => {
    const el = document.createElement("div");
    el.className = "an-demo__card";
    el.innerHTML = `<div class="an-shot ${["is-acc", "is-dark", "is-violet", "is-dark"][i % 4]}" data-label="${labels[i % 4]}">${shotSVG(i + 40)}</div>`;
    ringBox.append(el);
    return el;
  });
  const opt = { dur: 0.6, ease: "elastic.out(1,0.6)", curve: 5, curvem: 9, auto: 0, move: "snap" };
  const ds = { pos: 0, vel: 0, drag: false };
  const n = cards.length;
  const layoutDemo = () => {
    const W = stage.clientWidth, H = stage.clientHeight, cw = cards[0].offsetWidth, ch = cards[0].offsetHeight;
    const R = cw * (W < 700 ? opt.curvem : opt.curve), step = (cw * 1.48) / R;
    const cx = W / 2, cy = H * 0.5 + R;
    cards.forEach((el, i) => {
      const k = gsap.utils.wrap(-n / 2, n / 2, i - ds.pos), a = k * step;
      el.style.transform = `translate(${cx + R * Math.sin(a) - cw / 2}px, ${cy - R * Math.cos(a) - ch / 2}px) rotate(${a}rad)`;
    });
  };
  let tw = null;
  const go = (to) => { tw?.kill(); tw = gsap.to(ds, { pos: to, duration: reduce ? 0 : opt.dur, ease: opt.ease, onUpdate: layoutDemo }); };
  let lx = 0, lt = 0, sx = 0;
  stage.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; ds.drag = true; tw?.kill(); lx = sx = e.clientX; lt = performance.now(); ds.vel = 0; });
  addEventListener("pointermove", (e) => {
    if (!ds.drag) return;
    const now = performance.now(), d = -(e.clientX - lx) / (cards[0].offsetWidth * 1.48);
    ds.pos += d; ds.vel = (d / Math.max(1, now - lt)) * 16; lx = e.clientX; lt = now; layoutDemo();
  });
  addEventListener("pointerup", () => {
    if (!ds.drag) return;
    ds.drag = false;
    if (opt.move === "snap") go(Math.round(ds.pos + ds.vel * 6));
    else { tw?.kill(); tw = gsap.to(ds, { pos: ds.pos + ds.vel * 20, duration: 1, ease: "power3.out", onUpdate: layoutDemo }); }
  });
  $("[data-demo-prev]").addEventListener("click", () => go(Math.round(ds.pos) - 1));
  $("[data-demo-next]").addEventListener("click", () => go(Math.round(ds.pos) + 1));
  let autoT = null;
  const setAuto = () => { clearInterval(autoT); if (opt.auto > 0 && !reduce) autoT = setInterval(() => go(Math.round(ds.pos) + 1), opt.auto * 1000); };
  new ResizeObserver(layoutDemo).observe(stage);

  /* Value panel: the handle is managed by shared.js and receives only changed values */
  const ctl = $("[data-ctl]");
  const EASES = [["power1.out", "Power1"], ["power2.out", "Power2"], ["power3.out", "Power3"], ["power4.out", "Power4"], ["expo.out", "Expo"], ["circ.out", "Circ"], ["sine.out", "Sine"], ["back.out(1.7)", "Back"], ["elastic.out(1,0.6)", "Elastic"], ["bounce.out", "Bounce"], ["none", "Linear"]];
  $("[data-menu=ease]", ctl).innerHTML = EASES.map(([e, l]) => {
    const f = gsap.parseEase(e), d = Array.from({ length: 13 }, (_, i) => `${(i / 12) * 16 + 1},${9 - Math.max(-2, Math.min(1.2, f(i / 12))) * 8}`).join(" ");
    return `<button type="button" data-value="${e}"${e === opt.ease ? ' class="is-on"' : ""}><svg viewBox="0 0 18 10"><polyline points="${d}" fill="none" stroke="currentColor"/></svg>${l}</button>`;
  }).join("");
  ctl.addEventListener("ctl", (e) => {
    const { key, value } = e.detail;
    opt[key] = value;
    if (key === "auto") setAuto(); else layoutDemo();
  });
  window.AN.ctlInit(ctl);

  /* ── Beads: switching tabs rotates the ring so that name goes to the top (1s expo.out), and the bead rolls to another spot on the picture ── */
  const orb = window.ANGL?.orb($("[data-orb-gl]"), { frames: 3 });
  const ringEl = $("[data-orb-ring]"), tags = $$(".an-orb__tag", ringEl);
  const texts = ["Your two lines on how to use the first tool go here. Run it once, then sign in with your account.", "Your how-to for connecting the second tool goes here in two lines. One tap and it’s connected.", "Your two lines go here on attaching to the third tool. The install window opens."];
  const ctas = ["Copy command", "Add to Tool Two", "Add to Tool Three"];
  const rs = { rot: 0 };
  const placeTags = () => {
    const r = ringEl.clientWidth / 2;
    tags.forEach((t, i) => {
      const a = ((-90 + i * 120 + rs.rot) * Math.PI) / 180;
      const x = Math.cos(a) * (r + 18), y = Math.sin(a) * (r + 18);
      t.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
    });
  };
  let tab = 0;
  const setTab = (i) => {
    tab = (i + 3) % 3;
    $$(".an-tabs__b").forEach((b, k) => b.classList.toggle("is-on", k === tab));
    $("[data-tab-text]").textContent = texts[tab];
    window.AN.roll($("[data-tab-cta]"), ctas[tab]);
    let to = -tab * 120;
    while (to - rs.rot > 180) to -= 360;
    while (rs.rot - to > 180) to += 360;
    gsap.to(rs, { rot: to, duration: reduce ? 0 : 1, ease: "expo.out", onUpdate: placeTags });
    orb?.goTo(tab);
  };
  /* Like the original, while on screen it auto-advances to the next tool every 5 seconds, and picking one by hand restarts the count */
  let tabT = null, tabOn = false;
  const tabLoop = () => { clearInterval(tabT); if (tabOn && !reduce) tabT = setInterval(() => setTab(tab + 1), 5000); };
  new IntersectionObserver(([e]) => { tabOn = e.isIntersecting; tabLoop(); }).observe($(".an-agent"));
  $$(".an-tabs__b").forEach((b) => b.addEventListener("click", () => { setTab(+b.dataset.tab); tabLoop(); }));
  $("[data-tab-next]").addEventListener("click", () => { setTab(tab + 1); tabLoop(); });
  new ResizeObserver(placeTags).observe(ringEl);
  const toast = $("[data-toast]");
  let toastT;
  $("[data-tab-cta]").addEventListener("click", () => { toast.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("is-on"), 2000); });

  /* ── Cylinder ── */
  const cyl = window.ANGL?.cylinder($("[data-cyl]"), { count: 8, titles: ["Component Name", "Gallery Name", "Slider Name", "Menu Name"], onPick: () => { location.href = "detail.html"; } });
  $("[data-cyl-prev]").addEventListener("click", () => cyl?.nudge(-1));
  $("[data-cyl-next]").addEventListener("click", () => cyl?.nudge(1));

  /* ── Site stack: behind the front card, narrower cards recede up and down and pile up, and as you scroll the next card comes forward ── */
  const pile = $("[data-pile]"), pcards = $$(".an-pile__card", pile);
  const OFF = [0, 77, 130, 167, 190], SC = [1, 0.88, 0.775, 0.68, 0.6];
  const lerpT = (t, k) => { const a = Math.min(Math.floor(k), 3), f = Math.min(k, 4) - a; return t[a] + (t[a + 1] - t[a]) * f; };
  const ps = { p: 3 };
  const layoutPile = () => {
    pcards.forEach((c, i) => {
      const k = i - ps.p, ak = Math.abs(k), s = lerpT(SC, ak), off = lerpT(OFF, ak);
      c.style.transformOrigin = k < 0 ? "50% 0" : "50% 100%";
      c.style.transform = `translateY(${k < 0 ? -off : off}px) scale(${s})`;
      c.style.zIndex = String(100 - Math.round(ak * 10));
      c.style.visibility = ak > 4 ? "hidden" : "visible";
    });
  };
  layoutPile();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(ps, { p: 4, ease: "none", onUpdate: layoutPile, scrollTrigger: { trigger: pile, start: "top 70%", end: "bottom 30%", scrub: true } });
  });

  /* ── Review transition: outgoing text vanishes upward, incoming text rises from below in .8s expo.out ── */
  const qs = $$(".an-quote__item");
  let qi = 0;
  const showQ = (to) => {
    const from = qs[qi]; qi = (to + qs.length) % qs.length; const nx = qs[qi];
    if (from === nx) return;
    gsap.to(from, { autoAlpha: 0, y: -16, duration: reduce ? 0 : 0.4, ease: "power2.in", onComplete: () => from.classList.remove("is-on") });
    nx.classList.add("is-on");
    gsap.fromTo(nx, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.2, ease: "expo.out" });
  };
  $("[data-q-prev]").addEventListener("click", () => showQ(qi - 1));
  $("[data-q-next]").addEventListener("click", () => showQ(qi + 1));

  /* ── Pricing: the quarter/year pill slides (.5s expo.out) and the value digits roll upward ── */
  const seg = $("[data-seg]"), pill = $(".an-seg__pill", seg);
  let seats = 2;
  const studioBase = { q: 52, y: 43 };
  const setBill = (mode) => {
    $$("button", seg).forEach((b) => b.classList.toggle("is-on", b.dataset.bill === mode));
    const on = $(`[data-bill=${mode}]`, seg);
    gsap.to(pill, { x: on.offsetLeft - 3, width: on.offsetWidth, duration: reduce ? 0 : 0.5, ease: "expo.out" });
    $$("[data-price]").forEach((b) => {
      const [q, y] = b.dataset.price.split("|");
      const v = mode === "q" ? q : y;
      gsap.to(b, { yPercent: -100, duration: reduce ? 0 : 0.25, ease: "power2.in", onComplete: () => { b.textContent = `€${v}`; gsap.fromTo(b, { yPercent: 100 }, { yPercent: 0, duration: reduce ? 0 : 0.5, ease: "expo.out" }); } });
    });
    $$("[data-billed]").forEach((e) => { e.textContent = e.dataset.billed.split("|")[mode === "q" ? 0 : 1]; });
    seg.dataset.mode = mode;
  };
  $$("button", seg).forEach((b) => b.addEventListener("click", () => setBill(b.dataset.bill)));
  requestAnimationFrame(() => { const on = $(".is-on", seg); gsap.set(pill, { x: on.offsetLeft - 3, width: on.offsetWidth }); });
  $$("[data-seat]").forEach((b) => b.addEventListener("click", () => {
    seats = Math.min(20, Math.max(2, seats + +b.dataset.seat));
    $("[data-seats] b").textContent = seats;
    const m = seg.dataset.mode || "q";
    $(".is-studio [data-price]").textContent = `€${Math.round(studioBase[m] * (1 - Math.min(0.4, (seats - 1) * 0.1) / 2))}`;
  }));

  /* ── Subscription wall: slanted preview panels drift diagonally with scroll ── */
  const plane = $("[data-wall-plane]");
  plane.innerHTML = Array.from({ length: 81 }, (_, i) => `<div class="an-shot${i % 4 === 1 ? " is-dark" : ""}">${shotSVG(i + 70)}</div>`).join("");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(plane, { "--drift": "160px" }, { "--drift": "-160px", ease: "none", scrollTrigger: { trigger: ".an-news", start: "top bottom", end: "bottom top", scrub: true } });
  });
})();
