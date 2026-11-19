(() => {
  const { reduce } = PH;
  const W = window.PHWatch;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();

  // Clock drawing — bake the shader first, each section receives fx:frame and draws at that angle.
  if (W) {
    W.warm();
    const sprite = $(".ph-sprite"), spriteDraw = W.seq($(".ph-sprite canvas"), "explode", W.frames.explode);
    sprite.addEventListener("fx:frame", (e) => spriteDraw(e.detail.progress));
    spriteDraw(0);
    // Off-screen section images are drawn when they come one screen ahead — drawing eighteen at once at the start makes the loader lift late on slow devices
    const soon = (el, fn) => {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { rootMargin: "100% 0px" });
      io.observe(el);
    };
    const layerCanvas = $('canvas[data-gl="layers"]'), layerDraw = W.seq(layerCanvas, "layers", W.frames.layers);
    $(".ph-layers").addEventListener("fx:frame", (e) => layerDraw(e.detail.progress));
    soon($(".ph-layers"), () => { layerDraw(0); W.draw($('canvas[data-gl="ring"]'), "ring", 0); });
    soon($(".ph-products"), () => $$('.ph-products canvas[data-gl="spin"]').forEach((c) => W.draw(c, "spin", 0, { variant: c.dataset.variant, night: c.hasAttribute("data-night"), scale: 1.75 })));
    let spinVariant = "blue", spinDraw = W.seq($(".ph-spin canvas"), "spin", W.frames.spin, { variant: spinVariant, scale: 1.6 });
    $(".ph-spin").addEventListener("fx:frame", (e) => spinDraw(e.detail.progress));
    PH.setSpin = (v) => { if (v === spinVariant) return; spinVariant = v; spinDraw = W.seq($(".ph-spin canvas"), "spin", W.frames.spin, { variant: v, scale: 1.6 }); spinDraw(0); };
    soon($(".ph-products"), () => spinDraw(0));
    const cart = $('.ph-cart canvas[data-gl="spin"]');
    $$('[data-open="panel-cart"]').forEach((b) => b.addEventListener("click", () => { if (!cart.dataset.drawn) { cart.dataset.drawn = "1"; W.draw(cart, "spin", 0, { variant: "blue", scale: 1.2 }); } }));
  }
  // When the picture is fully set, lift the loader — the original waits until all frame bundles are received
  requestAnimationFrame(() => PH.markReady());

  // Hero — video panel fixed at 125% (no spacer), curtain fills with power1.in and moves 20% up. Two title lines rise in 1.25s and leave after 3.5s
  const hero = $(".ph-hero"), heroWrap = $(".ph-hero__wrap"), heroTitle = $$(".ph-hero__title > *");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({ trigger: heroWrap, start: "top top", end: "+=125%", pin: true, pinSpacing: false });
    gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } })
      .to($(".ph-hero__overlay"), { autoAlpha: 1, ease: "power1.in" })
      .to(heroWrap, { yPercent: -20 }, "<");
    gsap.set(heroTitle, { autoAlpha: 0, y: 80 });
    const tl = gsap.timeline({ paused: true })
      .to(heroTitle, { autoAlpha: 1, y: 0, duration: 1.25, stagger: 0.15, delay: 0.5, ease: "power2.out" })
      .to(heroTitle, { autoAlpha: 0, y: 60, duration: 0.75, stagger: { from: "end", amount: 0.05 }, ease: "power2.in", delay: 3.5 });
    PH.ready.push(() => PH.onSeen(hero, 0.5, () => tl.play()));
  });
  // Full video — 1s power2.out coming in, .5s power2.inOut going out
  const video = $(".ph-video");
  const videoOpen = (on) => {
    if (on) { PH.stop(); gsap.fromTo(video, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" }); }
    else gsap.to(video, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut", onComplete: PH.start });
    video.setAttribute("aria-hidden", String(!on));
  };
  hero.addEventListener("click", () => videoOpen(true));
  video.addEventListener("click", () => videoOpen(false));

  // Section title — once visible (threshold .5) the line rises and the description follows, overlapping at .75
  const titled = (sec, h, rest, threshold) => {
    if (reduce) return;
    gsap.set(rest, { autoAlpha: 0 });
    const tl = gsap.timeline({ paused: true });
    PH.ready.push(() => {
      tl.add(PH.titleIn(h)).fromTo(rest, { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, ease: "power2.out" }, "-=0.75");
      PH.onSeen(sec, threshold, () => tl.play());
    });
    return tl;
  };
  titled($(".ph-sprite__content"), $(".ph-sprite__h"), $(".ph-sprite__p"), 0.5);

  // Spec panel — pressing a tab raises the panel with .5s power2.out, and when switching, the old text clears in .25s and the new text rises in .5s
  const spec = $(".ph-spec"), specBox = $(".ph-spec__box"), specVeil = $(".ph-spec__veil"), items = $$(".ph-spec__item"), points = $$(".ph-point");
  let active = null, shown = null, busy = false;
  const mark = () => points.forEach((p, i) => { p.classList.toggle("is-active", i === active); p.classList.toggle("is-dim", active !== null && i !== active); });
  const setActive = async (i) => {
    active = i;
    mark();
    if (i === null) {
      gsap.to(specBox, { autoAlpha: 0, y: 20, duration: 0.4, ease: "power2.in" });
      gsap.set([specVeil, ...items], { autoAlpha: 0 });
      shown = null;
      spec.setAttribute("aria-hidden", "true");
      return;
    }
    spec.setAttribute("aria-hidden", "false");
    gsap.set(specVeil, { autoAlpha: 1 });
    gsap.to(specBox, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" });
    busy = true;
    if (shown !== null && shown !== i) await gsap.to(items[shown], { autoAlpha: 0, duration: 0.25, ease: "power2.out" });
    await gsap.fromTo(items[i], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, overwrite: true, duration: 0.5 });
    shown = i;
    busy = false;
  };
  points.forEach((p, i) => p.addEventListener("click", () => setActive(i)));
  specVeil.addEventListener("click", () => setActive(null));
  $(".ph-spec__close").addEventListener("click", () => setActive(null));
  $$(".ph-spec__nav [data-step]").forEach((b) => b.addEventListener("click", () => {
    if (busy || active === null) return;
    setActive((active + +b.dataset.step + points.length) % points.length);
  }));

  // About — the photo grows from −50vh · .5x to its full size starting 300px ahead, and a curtain covers the section above (power1.out, 2 cells)
  const edito = $(".ph-edito");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: edito, start: "top-=300 bottom", end: "top top", scrub: true } })
      .fromTo($(".ph-edito__mediaWrap"), { y: "-50vh", scale: 0.5 }, { y: 0, scale: 1, duration: 2, ease: "power1.out" })
      .fromTo($(".ph-edito__overlay"), { opacity: 0 }, { opacity: 1, delay: 0.25, duration: 2, ease: "power1.out" }, "<");
  });
  if (!reduce) {
    const eh = $(".ph-edito__h"), eb = $(".ph-edito__btn"), its = $$(".ph-edito__item");
    gsap.set(eb, { autoAlpha: 0 });
    its.forEach((it) => gsap.set($(".ph-edito__txt", it), { autoAlpha: 0 }));
    PH.ready.push(() => {
      const tl = gsap.timeline({ paused: true }).add(PH.titleIn(eh)).fromTo(eb, { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, ease: "power2.out" }, "-=0.75");
      its.forEach((it) => {
        const [a, b] = $$("[data-scr]", it);
        tl.add(() => PH.scr(a)?.playIn(), "-=1.25").add(() => PH.scr(b)?.playIn(), "-=0.85")
          .fromTo($(".ph-edito__txt", it), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1, ease: "power2.out" }, "-=0.85");
      });
      PH.onSeen($(".ph-edito__wrap"), 0.25, () => tl.play());
    });
  }

  // Three photos — when visible (threshold .2), from 100% below in 1.25s, .015 stagger
  const gal = $(".ph-gallery__wrap");
  if (!reduce) {
    gsap.set(gal.children, { autoAlpha: 0 });
    PH.ready.push(() => PH.onSeen(gal, 0.2, () => gsap.fromTo(gal.children, { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, duration: 1.25, stagger: 0.015, ease: "power2.out" })));
  }

  // Product — while the section above clears away, the covering veil (.75) drains out with power1.in, and the slider is 1x in the center and .7x on both sides (1.2s power2.out)
  const prod = $(".ph-products"), wrap = $(".ph-products__wrap"), bg = $(".ph-products__bg");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo($(".ph-products__shade"), { autoAlpha: 1 }, { autoAlpha: 0, ease: "power1.in", scrollTrigger: { trigger: prod, start: "top bottom", end: "top top", scrub: true } });
  });
  if (reduce) gsap.set($(".ph-products__shade"), { autoAlpha: 0 });
  const slides = $$(".ph-slide"), draws = slides.map((s) => $(".ph-slide__draw", s)), fulls = slides.map((s) => $(".ph-slide__full", s));
  let cur = 0;
  const place = (instant) => {
    const n = slides.length, half = Math.floor(n / 2);
    gsap.set(slides, { yPercent: -50, top: "50%" });
    slides.forEach((s, i) => {
      let j = i - cur;
      if (j > half) j -= n;
      if (j < -half) j += n;
      const mid = j === 0, near = Math.abs(j) <= 1, d = instant || reduce ? 0 : 1.2;
      gsap.set([draws[i], fulls[i], $(".ph-slide__night", s)], { xPercent: -50, yPercent: -50 });
      s.classList.toggle("is-mid", mid);
      gsap.to(s, { xPercent: -50 + j * 100, scale: mid ? 1 : 0.7, autoAlpha: near ? 1 : 0, zIndex: mid ? 10 : 1, duration: d, ease: "power2.out", overwrite: "auto" });
      gsap.to(draws[i], { autoAlpha: mid ? 0 : 0.24, duration: d, overwrite: "auto" });
    });
    const color = slides[cur].dataset.color;
    bg.dataset.color = color;
    PH.setSpin?.(color);
  };
  const step = (d) => { cur = (cur + d + slides.length) % slides.length; place(); };
  $$(".ph-slider__ctrl [data-dir]").forEach((b) => b.addEventListener("click", () => step(+b.dataset.dir)));
  slides.forEach((s, i) => s.addEventListener("click", () => { if (dragged) return; const j = (i - cur + slides.length) % slides.length; if (j === 1) step(1); else if (j === slides.length - 1) step(-1); }));
  const slider = $(".ph-slider");
  let drag = null, dragged = false;
  slider.addEventListener("pointerdown", (e) => { drag = { x: e.clientX }; dragged = false; });
  addEventListener("pointermove", (e) => {
    if (!drag || dragged) return;
    const dx = e.clientX - drag.x;
    if (dx < -50) { dragged = true; step(1); } else if (dx > 50) { dragged = true; step(-1); }
  });
  addEventListener("pointerup", () => { drag = null; setTimeout(() => (dragged = false)); });
  place(true);
  // Night mode — night gradient over the panel (.75s), clock at .3 brightness, glow dial lights up in 1s
  const nightBtn = $('[data-act="night"]');
  nightBtn.addEventListener("click", () => {
    const on = !wrap.classList.contains("is-night");
    wrap.classList.toggle("is-night", on);
    nightBtn.setAttribute("aria-pressed", String(on));
  });
  // 360 view — the bottom button group turns off over .75s at .15 intervals, the center clock moves to the 360 panel spot in .8s, then the drag-to-rotate panel turns on
  const def = $(".ph-pbottom__def"), seq = $(".ph-pbottom__seq"), spin = $(".ph-spin");
  const fadeOut = (box) => gsap.to(box.children, { autoAlpha: 0, stagger: 0.15, duration: 0.75, ease: "power2.out" }).then(() => gsap.set(box, { display: "none" }));
  const fadeIn = (box) => { gsap.set(box, { display: "flex", pointerEvents: "none" }); return gsap.fromTo(box.children, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.15, duration: 1.25, ease: "power2.out" }).then(() => gsap.set(box, { pointerEvents: "auto" })); };
  const toSpin = async () => {
    wrap.classList.remove("is-night");
    nightBtn.setAttribute("aria-pressed", "false");
    const watch = fulls[cur], target = $(".ph-spin canvas");
    const a = watch.getBoundingClientRect(), b = target.getBoundingClientRect();
    const others = slides.filter((_, i) => i !== cur);
    const tl = gsap.timeline();
    tl.to(others, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 0)
      .to(watch, { x: b.x + b.width / 2 - (a.x + a.width / 2), y: b.y + b.height / 2 - (a.y + a.height / 2), scale: b.width / a.width, duration: 0.8, ease: "power2.out" }, 0);
    gsap.set(spin, { autoAlpha: 1, delay: 0.8 });
    fadeOut(def).then(() => fadeIn(seq));
    await tl;
    gsap.set(slides, { autoAlpha: 0 });
    gsap.set(watch, { x: 0, y: 0, scale: 1 });
    slider.style.pointerEvents = "none";
  };
  const toSlider = async () => {
    gsap.set(spin, { autoAlpha: 0 });
    spin.dispatchEvent(new Event("fx:reset"));
    slider.style.pointerEvents = "";
    fadeOut(seq).then(() => fadeIn(def));
    place(true);
    gsap.from(slides.filter((_, i) => i !== cur), { autoAlpha: 0, duration: 1, ease: "power2.out" });
  };
  $('[data-act="spin"]').addEventListener("click", toSpin);
  $('[data-act="back"]').addEventListener("click", toSlider);
  $('[data-act="reset"]').addEventListener("click", () => spin.dispatchEvent(new Event("fx:reset")));

  // FAQ — sets up eight categories as placeholders. When visible the title line rises and category letters unfold at .05 intervals
  const list = $(".ph-faq__list");
  const cats = ["Category name one", "Category two", "Category name three", "Category four", "Category name five", "Category six", "Category name seven", "Category eight"];
  list.innerHTML = cats.map((c, ci) => `
    <div class="ph-cat">
      <button class="ph-cat__btn ph-mono" type="button" aria-expanded="false"><span class="ph-plus">[+]</span><span data-scr data-scr-hover data-label="Category English name">${c}</span></button>
      <div class="ph-cat__panel" hidden><div class="ph-cat__list">
        ${[1, 2, 3].map((q) => `<div class="ph-q"><button class="ph-q__btn ph-body" type="button" aria-expanded="false"><span>$ here{ci + 1}-${q}Enter the question in a single line.</span><span class="ph-plus ph-mono">[+]</span></button><div class="ph-q__a" hidden><p class="ph-body">Your answer goes here in two or three lines. Answer the question directly, and put any further reading on the last line.</p></div></div>`).join("")}
      </div></div>
    </div>`).join("");
  // Hand the newly made shuffle text over to the shared shuffle
  PH.mountScr?.(list);
  const faqTl = gsap.timeline({ paused: true });
  PH.ready.push(() => {
    if (!reduce) faqTl.add(PH.titleIn($(".ph-faq__h")));
    $$("[data-scr]", list).forEach((el, z) => faqTl.add(() => PH.scr(el)?.playIn(), z * 0.05 + 0.25));
    PH.onSeen($(".ph-faq"), 0.2, () => faqTl.play());
  });
  // Accordion — height 0 → auto and opacity .5s power1.inOut (.1 late), with the rows inside rising from 20px below at .1 interval over .6s
  const fold = (btn, panel, kids) => {
    const tl = gsap.timeline({ paused: true, onStart: () => panel.removeAttribute("hidden"), onReverseComplete: () => panel.setAttribute("hidden", "") })
      .fromTo(panel, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.5, delay: 0.1, ease: "power1.inOut", onUpdate: () => ScrollTrigger.refresh() });
    if (kids) tl.fromTo(kids, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }, 0);
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.querySelector(".ph-plus").textContent = open ? "[-]" : "[+]";
      if (reduce) { panel.toggleAttribute("hidden", !open); return; }
      open ? tl.play() : tl.progress(1).reverse();
    });
  };
  $$(".ph-cat", list).forEach((c) => fold($(".ph-cat__btn", c), $(".ph-cat__panel", c), $$(".ph-q", c)));
  $$(".ph-q", list).forEach((q) => fold($(".ph-q__btn", q), $(".ph-q__a", q)));

  // Engraving — what you write is stamped straight onto the board (12 chars)
  const eng = $(".ph-engrave__in"), engTxt = $(".ph-engrave__txt");
  eng.addEventListener("input", () => (engTxt.textContent = eng.value.toUpperCase() || "00000000"));

  // Color picker in the interest-registration drawer — redraws the chosen color on a small watch
  $$(".ph-cart__colors button").forEach((b) => b.addEventListener("click", () => {
    $$(".ph-cart__colors button").forEach((x) => x.classList.toggle("is-on", x === b));
    const c = $('.ph-cart canvas[data-gl="spin"]');
    if (W && c) W.draw(c, "spin", 0, { variant: b.dataset.variant, scale: 1.2 });
  }));
})();
