// Home page: pass scroll progress to the 3D map, and hook up hero exit, the step list, feature cell entrance, and FAQ.
// Original values: hero exit = Scroll 0 → .4 of screen with sine.in .7s (subtitle .15s later, y -120/-200) ·
//   Phase boundaries (phase progress) 0 / .191 / .697 / .876 · camera progress = scrollY / (.4 screen + stuck length × 400/356) ·
//   Feature cells scrubbed with 1s power2.out 80px, split by each cell’s share (1/4) with 30% overlap.
(() => {
  const V = window.V;
  const reduced = V.reduced;

  // Feature icon: redraw shapes of the same weight in place of the original’s black isometric icons
  const icons = {
    cube: '<svg viewBox="0 0 96 96"><path d="M48 10 82 29v38L48 86 14 67V29z" fill="currentColor"/><path class="pf" d="M48 24 70 36v24L48 72 26 60V36z"/><path d="M48 32 63 40v16L48 64 33 56V40z" fill="currentColor"/><path class="ps" d="M48 48 63 40M48 48v16M48 48 33 40" stroke-width="2"/></svg>',
    globe: '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3"><circle class="pf" cx="48" cy="40" r="24"/><ellipse cx="48" cy="40" rx="10" ry="24"/><path d="M24 40h48M28 28h40M28 52h40"/><path d="M30 70h36M48 64v6" stroke-width="5"/><path d="M22 18a32 32 0 0 0 4 46" stroke-width="4"/></svg>',
    people: '<svg viewBox="0 0 96 96"><circle cx="34" cy="26" r="10" fill="currentColor"/><circle cx="62" cy="22" r="10" fill="currentColor"/><path d="M16 74c0-18 8-34 18-34s18 16 18 34z" fill="currentColor"/><path class="ps" d="M44 70c0-18 8-34 18-34s18 16 18 34z" fill="currentColor" stroke-width="3"/><path class="ps" d="M24 58l12-6M54 54l12-6" stroke-width="3"/></svg>',
    slabs: '<svg viewBox="0 0 96 96"><path d="M14 30 44 14l10 6-30 16z" fill="currentColor"/><path d="M14 30v34l10 6V36z" fill="currentColor"/><path d="M30 40 60 24l10 6-30 16z" fill="currentColor"/><path d="M30 40v34l10 6V46z" fill="currentColor"/><path d="M46 50 76 34l10 6-30 16z" fill="currentColor"/><path d="M46 50v34l10 6V56z" fill="currentColor"/><path class="ps" d="M24 36v34M40 46v34M56 56v34" stroke-width="2"/></svg>',
  };
  document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = icons[el.dataset.icon]));
  const chev = '<svg viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m1 6.5 5-5 5 5"/></svg>';
  document.querySelectorAll(".faq-item__icon").forEach((el) => (el.innerHTML = chev));

  // ── 3D stage ──
  const canvas = document.querySelector(".v-stage");
  const map = window.VMap(canvas, { reduced });
  gsap.ticker.add((t) => map.frame(t));
  requestAnimationFrame(() => requestAnimationFrame(() => V.stageReady?.()));
  const aim = (e) => map.setPointer((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2);
  addEventListener("pointermove", aim);
  // The original also moves the parallax reference point at the moment of touch — on phones the camera shifts that way from a tap alone, without movement
  addEventListener("pointerdown", aim);

  // ── Hero enter · exit ──
  const hero = document.querySelector(".hero");
  const title = hero.querySelector(".hero__title");
  const sub = hero.querySelector(".hero__subtitle");
  const OUT = { opacity: 0, xPercent: -50, x: 222.2, y: -120, rotateY: -60, rotateX: -35, transformPerspective: 1000, ease: "sine.in", immediateRender: false };
  const IN = { opacity: 1, xPercent: 0, x: 0, y: 0, rotateY: 0, rotateX: 0, transformPerspective: 1000 };
  const heroTl = gsap.timeline({ paused: true });
  heroTl.fromTo(title, IN, { ...OUT, duration: 0.7 }, 0).fromTo(sub, IN, { ...OUT, y: -200, duration: 0.7 }, 0.15);
  let heroLive = false;
  const heroScroll = () => {
    if (!hero.classList.contains("show")) return;
    if (!heroLive) {
      // Turn off entrance CSS transitions at the first scroll so they don’t fight the scrub
      title.style.transition = sub.style.transition = "none";
      heroLive = true;
    }
    const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.4)));
    if (!reduced) heroTl.progress(p);
    hero.classList.toggle("hide", innerWidth <= 820 ? scrollY > 0 : p > 0.15);
  };

  V.ready(() => {
    map.enter();
    canvas.classList.add("is-ready");
    hero.classList.add("show");
  });

  // ── Step list + camera progress ──
  const flow = document.querySelector(".flow");
  const wrap = flow.querySelector(".flow__wrapper");
  const steps = [...flow.querySelectorAll(".flow__step")];
  const START = [0, 0.191, 0.697, 0.876];
  const AIM = [0.11, 0.01, 0.1, 0.13];
  const RANGE = [[0, 0.191], [0.191, 0.697], [0.697, 0.876], [0.876, 1]];
  let forced = null, forcedY = null;
  const flowScroll = () => {
    const vh = innerHeight;
    const len = Math.max(flow.offsetHeight - wrap.offsetHeight, 1);
    const a = vh * 0.4;
    const i = Math.max(0, Math.min(1, (scrollY - a) / len));
    map.setProgress(scrollY / Math.max(a + len * (400 / 356), 1));
    if (forced !== null && Math.abs(scrollY - forcedY) < 8) forced = forcedY = null;
    const active = forced ?? (i < START[1] ? 0 : i < START[2] ? 1 : i < START[3] ? 2 : 3);
    steps.forEach((s, k) => {
      s.classList.toggle("is-active", k === active);
      const [lo, hi] = RANGE[k];
      s.querySelector(".flow__track-fill").style.transform = `scaleY(${i >= hi ? 1 : i > lo ? (i - lo) / (hi - lo) : 0})`;
    });
  };
  steps.forEach((s, k) =>
    s.querySelector(".flow__header").addEventListener("click", () => {
      const len = Math.max(flow.offsetHeight - wrap.offsetHeight, 1);
      forced = k;
      forcedY = innerHeight * 0.4 + (START[k] + AIM[k]) * len;
      V.scrollTo(forcedY, 1.2);
    })
  );
  addEventListener("wheel", () => (forced = forcedY = null), { passive: true });

  // ── Feature cells: while pinned, progress is split per cell and shown one by one ──
  const features = document.querySelector(".features");
  const items = [...features.querySelectorAll(".feature-item__content")];
  const mm = gsap.matchMedia();
  let featureScroll = () => {};
  mm.add("(min-width: 1201px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.set(items, { opacity: 0, y: 80 });
    const tws = items.map((el) => gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power2.out", paused: true }));
    featureScroll = () => {
      const r = features.getBoundingClientRect();
      const u = Math.max(0, Math.min(1, -r.top / (features.offsetHeight - innerHeight)));
      const h = 1 / items.length, f = h * 0.3;
      tws.forEach((tw, k) => {
        const s = k * h - (k > 0 ? f : 0), e = s + h + f;
        tw.progress(Math.max(0, Math.min(1, (u - s) / (e - s))));
      });
    };
    return () => {
      featureScroll = () => {};
      tws.forEach((t) => t.kill());
      gsap.set(items, { clearProps: "opacity,y" });
    };
  });

  const onScroll = () => {
    heroScroll();
    flowScroll();
    featureScroll();
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  gsap.ticker.add(featureScroll);
  onScroll();

  // ── FAQ: measures the height and opens/closes in .6s, several can be open at once ──
  document.querySelectorAll(".faq-item").forEach((item) => {
    const body = item.querySelector(".faq-item__content");
    const btn = item.querySelector(".faq-item__header");
    if (item.classList.contains("is-open")) body.style.maxHeight = body.scrollHeight + "px";
    btn.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      body.style.maxHeight = (open ? 0 : body.scrollHeight) + "px";
      body.offsetHeight;
      body.style.maxHeight = (open ? body.scrollHeight : 0) + "px";
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
    });
  });
})();
