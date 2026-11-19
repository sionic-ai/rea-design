// Home page motion: hero carousel (5s), four pinned experience scenes (approach at 2.4x while switching · snap to the scene when stopped · photo every 4s),
// Emotion map (scene color change · points near the cursor), journey step pinning (pushed up in turn · snaps when stopped), app list (scroll position), journal lines (hover).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const main = document.querySelector(".home-main");
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();
  const lenis = () => window.qsSite?.lenis;
  const mm = gsap.matchMedia();

  // ── Hero carousel: every 5 seconds the photo·leaf shadow·dots·name change together (photo .7s, shadow 1.2s) ──
  const car = document.querySelector("[data-carousel]");
  if (car) {
    const slides = [...car.querySelectorAll(".hero-carousel__slide")];
    const shadows = [...car.querySelectorAll(".hero-carousel__shadow")];
    const dots = [...car.querySelectorAll(".hero-carousel__dot")];
    const cap = car.querySelector(".hero-carousel__caption");
    const names = (cap?.dataset.captions || "").split("|");
    let at = slides.findIndex((s) => s.classList.contains("is-active"));
    const show = (i) => {
      at = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle("is-active", k === at); s.setAttribute("aria-hidden", String(k !== at)); });
      shadows.forEach((s, k) => s.classList.toggle("is-active", k === at));
      dots.forEach((d, k) => { d.classList.toggle("is-active", k === at); if (k === at) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
      if (cap && names[at]) cap.textContent = names[at];
    };
    let timer = 0;
    window.qsSite.afterLoad(() => { timer = setInterval(() => { if (!document.hidden) show(at + 1); }, 5000); });
    dots.forEach((d, k) => d.addEventListener("click", () => { clearInterval(timer); show(k); timer = setInterval(() => { if (!document.hidden) show(at + 1); }, 5000); }));
  }

  // ── Experience: the photo slot moves to the next photo every 4 seconds (.7s overlapping crossfade) ──
  const cycles = [...document.querySelectorAll("[data-cycle]")];
  let tick = 0;
  if (cycles.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.qsSite.afterLoad(() => setInterval(() => {
      if (document.hidden) return;
      tick++;
      cycles.forEach((c) => { const s = [...c.children]; s.forEach((f, k) => { const on = k === tick % s.length; f.classList.toggle("is-active", on); f.setAttribute("aria-hidden", String(!on)); }); });
    }, 4000));
  }

  // ── Experience: fixed scene ──
  const exSection = document.querySelector(".experiences");
  const stage = exSection?.querySelector(".experiences__stage");
  if (stage) {
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: "(max-width: 899px)" }, (ctx) => {
      if (!ctx.conditions.motion) return;
      const r = ctx.conditions.mobile ? { step: 0.65, outAt: 0.05, outDur: 0.45, inAt: 0.15, inDur: 0.55 } : { step: 1, outAt: 0.1, outDur: 0.65, inAt: 0.2, inDur: 0.8 };
      const scenes = gsap.utils.toArray(".experience", stage);
      const head = stage.querySelector(".experiences__head");
      const n = scenes.length;
      gsap.set(scenes.slice(1), { autoAlpha: 0, scale: 0.88 });
      const first = scenes[0];
      // From when a section enters at 85% of the screen until it touches the top, the first scene’s two words gather from ±12% and the photo rises from 60px below
      gsap.timeline({ scrollTrigger: { trigger: exSection, start: "top 85%", end: "top top", scrub: true } })
        .from(first.querySelector(".experience__word--left"), { xPercent: -12, autoAlpha: 0 }, 0)
        .from(first.querySelector(".experience__word--right"), { xPercent: 12, autoAlpha: 0 }, 0)
        .from(first.querySelector(".experience__photo"), { y: 60, autoAlpha: 0 }, 0)
        .from([head, first.querySelector(".experience__text")], { autoAlpha: 0 }, 0.3);
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: stage, start: "top top", end: () => `+=${n * innerHeight * r.step}`, pin: true, refreshPriority: 1, scrub: 0.6, invalidateOnRefresh: true } });
      scenes.forEach((s, i) => {
        tl.to(s, { scale: 2.4, duration: 1, ease: "power1.in" }, i);
        tl.to(s, { autoAlpha: 0, duration: r.outDur, ease: "sine.inOut" }, i + r.outAt);
        if (scenes[i + 1]) tl.to(scenes[i + 1], { scale: 1, autoAlpha: 1, duration: r.inDur, ease: "sine.inOut" }, i + r.inAt);
      });
      tl.to(head, { autoAlpha: 0, duration: 0.6 }, n - 0.6);
      // When it stops, it snaps to the nearest scene position in 1.2s
      const snap = () => {
        const st = tl.scrollTrigger, y = scrollY;
        if (!st || !lenis() || y <= st.start || y >= st.end) return;
        const step = (st.end - st.start) / n, to = st.start + Math.round((y - st.start) / step) * step;
        if (Math.abs(to - y) > 2) lenis().scrollTo(to, { duration: 1.2 });
      };
      ScrollTrigger.addEventListener("scrollEnd", snap);
      return () => ScrollTrigger.removeEventListener("scrollEnd", snap);
    });
  }

  // ── Emotion map ──
  const atlas = document.querySelector(".atlas");
  if (atlas && main) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // While the map comes in, the same scene color shifts from ivory to night green, all the way up to the experience·journey headers
      gsap.fromTo(main, { "--scene-bg": v("--kf-bg") }, { "--scene-bg": v("--kf-contrast-bg"), ease: "none", scrollTrigger: { trigger: atlas, start: "top bottom", end: "top 30%", scrub: true } });
      gsap.from(atlas.querySelector(".atlas__inner"), { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: atlas, start: "top 55%", end: "top 10%", scrub: true } });
    });
    const map = atlas.querySelector(".atlas__map");
    const points = [...map.querySelectorAll(".atlas__point")];
    const lines = [...map.querySelectorAll(".atlas__line")];
    const areas = [...map.querySelectorAll(".atlas__area, .atlas__area-label")];
    let active = null, raf = 0;
    const setActive = (id) => {
      if (id === active) return;
      active = id;
      const p = points.find((b) => b.dataset.id === id);
      map.classList.toggle("has-active", !!id);
      points.forEach((b) => { const on = b === p; b.classList.toggle("is-active", on); b.setAttribute("aria-expanded", String(on)); });
      map.querySelectorAll(".atlas__card").forEach((c) => { const on = !!id && c.id === `atlas-card-${id}`; c.classList.toggle("is-visible", on); c.setAttribute("aria-hidden", String(!on)); });
      areas.forEach((a) => a.classList.toggle("is-active", !!p && a.dataset.area === p.dataset.area));
      lines.forEach((l) => l.classList.toggle("is-active", !!id && (l.dataset.a === id || l.dataset.b === id)));
    };
    map.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" || e.target.closest(".atlas__card")) return;
      const r = map.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, sx = r.width / 1600, sy = r.height / 1000;
      // Nearest place within 110px
      let best = null, d = 110;
      points.forEach((b) => { const k = Math.hypot(b.dataset.x * sx - x, b.dataset.y * sy - y); if (k < d) { d = k; best = b.dataset.id; } });
      setActive(best);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const ux = x / sx, uy = y / sy;
        lines.forEach((l) => l.style.setProperty("--near", Math.max(0, 1 - Math.hypot(l.dataset.mx - ux, l.dataset.my - uy) / 260).toFixed(3)));
      });
    });
    map.addEventListener("pointerleave", () => { setActive(null); lines.forEach((l) => l.style.setProperty("--near", 0)); });
    points.forEach((b) => {
      b.addEventListener("focus", () => setActive(b.dataset.id));
      b.addEventListener("click", () => setActive(active === b.dataset.id ? null : b.dataset.id));
    });
  }

  // ── Phone emotion strip: pushing the strip lights up the emotion at center (text grows .5s) and that emotion’s place cards are laid out anew in a row ──
  const compass = document.querySelector(".atlas-compass");
  if (compass) {
    const strip = compass.querySelector(".atlas-compass__strip");
    const deck = compass.querySelector(".atlas-compass__cards");
    const emos = [...strip.children];
    const pts = [...document.querySelectorAll(".atlas__point")];
    let cur = -1, raf = 0;
    const pick = (k) => {
      if (k === cur) return;
      cur = k;
      const area = emos[k].dataset.area;
      emos.forEach((b, j) => { b.classList.toggle("is-active", j === k); b.setAttribute("aria-pressed", String(j === k)); });
      compass.className = `atlas-compass atlas__area-label--${area}`;
      deck.innerHTML = "";
      pts.filter((p) => p.dataset.area === area).forEach((p) => {
        const card = document.getElementById(`atlas-card-${p.dataset.id}`)?.cloneNode(true);
        if (!card) return;
        card.removeAttribute("id");
        card.className = "atlas__card is-visible";
        card.removeAttribute("style");
        card.setAttribute("aria-hidden", "false");
        const slot = document.createElement("div");
        slot.className = "atlas-compass__card";
        slot.append(card);
        deck.append(slot);
      });
      // The card row keeps the center card visible, and the entrance (.6s) runs again
      deck.style.animation = "none"; void deck.offsetWidth; deck.style.animation = "";
      const mid = deck.children[Math.floor(deck.children.length / 2)];
      if (mid) deck.scrollTo({ left: mid.offsetLeft + mid.offsetWidth / 2 - deck.clientWidth / 2 });
    };
    strip.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const c = strip.scrollLeft + strip.clientWidth / 2;
        let best = 0, d = Infinity;
        emos.forEach((b, j) => { const x = b.offsetLeft + b.offsetWidth / 2; if (Math.abs(x - c) < d) { d = Math.abs(x - c); best = j; } });
        pick(best);
      });
    }, { passive: true });
    emos.forEach((b) => b.addEventListener("click", () => strip.scrollTo({ left: b.offsetLeft + b.offsetWidth / 2 - strip.clientWidth / 2, behavior: "smooth" })));
    pick(0);
  }

  // ── Journey: three steps and the last button stay pinned while screens slide up one at a time (text and photo from opposite sides) ──
  const journey = document.querySelector(".journey");
  const jStage = journey?.querySelector(".journey__stage");
  if (jStage) {
    const OFF = [{ text: 1, photo: -1 }, { text: -1, photo: 1 }, { text: 1, photo: -1 }];
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: "(max-width: 899px)" }, (ctx) => {
      if (!ctx.conditions.motion) return;
      const axis = ctx.conditions.mobile ? "xPercent" : "yPercent";
      const steps = gsap.utils.toArray(".journey__step, .journey__final", jStage);
      const n = steps.length;
      const tl = gsap.timeline({ defaults: { ease: "power2.out" }, scrollTrigger: { trigger: jStage, start: "top top", end: () => `+=${n * innerHeight}`, pin: true, refreshPriority: 1, scrub: 0.6, invalidateOnRefresh: true } });
      steps.forEach((s, i) => {
        const o = OFF[i] || { text: 1, photo: 1 };
        const text = s.querySelector(".journey__text, .journey__final-inner");
        const photo = s.querySelector(".journey__photo");
        gsap.set(s, { autoAlpha: 1 });
        tl.fromTo(text, { [axis]: 100 * o.text }, { [axis]: 0, duration: 0.5 }, i);
        if (photo) tl.fromTo(photo, { [axis]: 100 * o.photo }, { [axis]: 0, duration: 0.5 }, i);
        tl.to({}, { duration: 0.5 }, i + 0.5);
      });
      // Drawn while the brass ring line of the last section enters (the original is one line across the page)
      const loop = jStage.querySelector(".journey__loop path");
      if (loop) tl.fromTo(loop, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "none" }, n - 1);
      const snap = () => {
        const st = tl.scrollTrigger, y = scrollY;
        if (!st || !lenis() || y <= st.start || y >= st.end) return;
        const t = (st.end - st.start) / n, k = Math.min(n - 1, Math.max(0, Math.round((y - st.start) / t - 0.5))), to = st.start + (k + 0.5) * t;
        if (!(y >= to && y <= st.start + (k + 1) * t) && Math.abs(to - y) > 2) lenis().scrollTo(to, { duration: 1 });
      };
      ScrollTrigger.addEventListener("scrollEnd", snap);
      return () => ScrollTrigger.removeEventListener("scrollEnd", snap);
    });
  }

  // ── App intro: while the section top passes 25% of the screen and goes a further 25% of the section height, five list items turn on in turn ──
  const app = document.querySelector(".travel-app");
  if (app) {
    const items = [...app.querySelectorAll(".travel-app__item")];
    const screens = [...app.querySelectorAll(".travel-app__screen")];
    const notes = [...app.querySelectorAll(".travel-app__note")];
    let cur = -1, raf = 0;
    const update = () => {
      raf = 0;
      const H = innerHeight, r = app.getBoundingClientRect(), a = 0.25 * H, b = -(0.25 * r.height);
      const p = (a - r.top) / Math.max(1, a - b);
      const i = Math.min(items.length - 1, Math.max(0, Math.round(p * (items.length - 1))));
      if (i === cur) return;
      cur = i;
      items.forEach((it, k) => { it.classList.toggle("is-active", k === i); if (k === i) it.setAttribute("aria-current", "step"); else it.removeAttribute("aria-current"); });
      screens.forEach((s, k) => s.classList.toggle("is-active", k === i));
      notes.forEach((nt, k) => nt.classList.toggle("is-visible", i > k));
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  // ── Journal: while entering, scene color goes from night green to ivory, app text·notices disappear ──
  const journal = document.querySelector(".journal-home");
  if (journal && main) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const st = { trigger: journal, start: "top 85%", end: "top 15%", scrub: true };
      gsap.fromTo(main, { "--scene-bg-2": v("--kf-contrast-bg") }, { "--scene-bg-2": v("--kf-bg"), ease: "none", scrollTrigger: st });
      gsap.to([".travel-app__text", ".travel-app__notes"], { autoAlpha: 0, ease: "none", scrollTrigger: { ...st, end: "top 45%" } });
    });
    const rows = [...journal.querySelectorAll(".journal-home__row")];
    const pick = (row) => rows.forEach((r) => { const on = r === row; r.classList.toggle("is-active", on); r.querySelector(".journal-home__photo")?.setAttribute("aria-hidden", String(!on)); });
    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => pick(row));
      const a = row.querySelector(".journal-home__trigger");
      a.addEventListener("focus", () => pick(row));
      a.addEventListener("click", (e) => { if (!row.classList.contains("is-active") && matchMedia("(hover: none)").matches) { e.preventDefault(); pick(row); } });
    });
  }
})();
