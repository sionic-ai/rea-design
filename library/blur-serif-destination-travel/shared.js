// Shared across the whole site — like the original default.js, it finds the devices on screen and attaches to them (blocking navigation isn’t used in the original either, so links navigate normally).
// Blur reveal, the side photos on list hover and the flipping marquee are handled by Motion parts (blur-rise-reveal · hover-side-photos · scroll-flip-marquee).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The original loads smooth scroll, scroll effects and the cursor only on a wide screen + a pointer device + no reduced-motion setting
  const rich = matchMedia("(min-width: 960px) and (hover: hover) and (pointer: fine)").matches && !reduce;

  // The original animation module loads only under the above condition — otherwise no blur-in entrance, visible from the start
  if (!rich) $$('[data-fx~="blur-rise-reveal"]').forEach((el) => { el.dataset.fx = el.dataset.fx.replace("blur-rise-reveal", "").trim(); if (!el.dataset.fx) el.removeAttribute("data-fx"); });

  /* ───── Smooth scroll — Lenis 1.3.4 defaults ───── */
  if (rich && window.Lenis) {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ───── Header bar — cream background past 100px. The mega menu opens to the plate height on hover and closes on scroll ───── */
  const head = $(".rd-head"), bg = $(".dd-bg");
  const scrolled = () => head.classList.toggle("is-scrolled", scrollY > 100);
  scrolled();
  addEventListener("scroll", () => requestAnimationFrame(scrolled), { passive: true });
  const dds = $$(".dd");
  let busy = false, bt;
  const closeDd = () => { document.body.classList.remove("dd-open"); dds.forEach((d) => d.classList.remove("is-active")); bg && (bg.style.height = "0"); };
  const onScroll = () => { busy = true; closeDd(); clearTimeout(bt); bt = setTimeout(() => (busy = false), 250); };
  ["scroll", "wheel", "touchmove"].forEach((e) => addEventListener(e, onScroll, { passive: true }));
  dds.forEach((d) => {
    const panel = $(".dd-panel", d), link = d.firstElementChild;
    const open = () => {
      if (busy) return;
      document.body.classList.add("dd-open");
      dds.forEach((o) => o !== d && o.classList.remove("is-active"));
      d.classList.add("is-active");
      bg.style.height = `${panel.scrollHeight + head.offsetHeight}px`;
    };
    link.addEventListener("mouseenter", open);
    link.addEventListener("focus", open);
    d.addEventListener("mouseleave", closeDd);
  });
  $(".dd-backdrop")?.addEventListener("click", closeDd);

  /* Drawer menu (below 960) — slides in from the left in .6s, the second tier is pushed in from the right */
  const menu = $(".rd-menu");
  const setMenu = (on) => { document.body.classList.toggle("menu-open", on); $$(".rd-burger").forEach((b) => b.setAttribute("aria-expanded", on)); if (!on) $$("ul[data-level='2']", menu).forEach((u) => u.classList.remove("active")); };
  $$(".rd-burger").forEach((b) => b.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open"))));
  $$("[data-menu-close]").forEach((b) => b.addEventListener("click", () => setMenu(false)));
  $$("[data-sub]", menu).forEach((b) => b.addEventListener("click", () => $(`ul[data-level='2'][data-of='${b.dataset.sub}']`, menu)?.classList.add("active")));
  $$("[data-back]", menu).forEach((b) => b.addEventListener("click", () => b.closest("ul").classList.remove("active")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); closeDd(); } });

  /* ───── ‹View› cursor — follows with power3 quickTo, and at the right edge of the screen or the bottom 10% it jumps to the opposite side in .9s ───── */
  const cur = $(".rd-cursor");
  if (cur && rich) {
    const label = $("p", cur);
    gsap.set(cur, { xPercent: 0, yPercent: 0 });
    const qx = gsap.quickTo(cur, "x", { ease: "power3" }), qy = gsap.quickTo(cur, "y", { ease: "power3" });
    let hit = null, txt = "";
    addEventListener("mousemove", (e) => {
      const w = cur.offsetWidth + 16;
      let xp = 0, yp = 0;
      if (e.clientX > innerWidth - w) xp = -100;
      if (e.clientY > innerHeight * 0.9) yp = -120;
      if (hit) { const t = hit.getAttribute("data-cursor"); if (t !== txt) { label.textContent = t; txt = t; } }
      gsap.to(cur, { xPercent: xp, yPercent: yp, duration: 0.9, ease: "power3" });
      qx(e.clientX); qy(e.clientY);
    });
    $$("[data-cursor]").forEach((t) => t.addEventListener("mouseenter", () => { hit = t; const s = t.getAttribute("data-cursor"); if (s !== txt) { label.textContent = s; txt = s; } }));
  }

  /* ───── Scroll choreography (wide screens only) ───── */
  if (rich) {
    // While the hero text and background leave the screen, shift down 300px
    $$(".hero").forEach((h) => [$(".hero__main", h), $(".hero__bg", h)].filter(Boolean).forEach((t) => gsap.to(t, { y: 300, ease: "none", scrollTrigger: { trigger: h, start: "top top", end: "bottom top", scrub: true } })));
    // Photo montage: front photo 5% → −5%, back photo −5% → 5%
    $$(".montage").forEach((m) => {
      const pair = [[$(".montage__a", m), 5, -5], [$(".montage__b .ph", m), -5, 5]];
      pair.forEach(([el, a, b]) => el && gsap.fromTo(el, { yPercent: a }, { yPercent: b, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } }));
    });
    // Video section — from when its center touches the screen bottom, inset 20% → 0, then the panel moves 30% up
    $$(".home-video").forEach((v) => {
      const clip = $(".home-video__clip", v), box = $(".home-video__box", v);
      gsap.set(clip, { clipPath: "inset(20%)" });
      gsap.to(clip, { clipPath: "inset(0%)", ease: "none", scrollTrigger: { trigger: v, start: "center bottom", end: "bottom bottom", scrub: true } });
      gsap.to(box, { yPercent: 30, ease: "none", scrollTrigger: { trigger: v, start: "bottom bottom", end: "bottom top", scrub: true } });
    });
    $$(".journey__img").forEach((i) => gsap.to($(".ph", i), { yPercent: 20, ease: "none", scrollTrigger: { trigger: i, start: "top bottom", end: "bottom top", scrub: true } }));
  }


  /* ───── About drawer (wide screens) — holds the screen, and on the right, sections folded into vertical strips unfold one by one to the left with each screen-height of scroll.
     Handwriting in the unfolding section starts at 5px blur per letter over 2s expo.out (.02 stagger), the title starts 40px below with 20px blur over 2s expo.out ───── */
  $$(".drawers").forEach((sec) => {
    const inner = $(".drawers__in", sec), ds = $$(".drawer", sec), n = ds.length;
    if (!rich || n < 2) return;
    const chars = (el) => {
      const out = [];
      [...el.childNodes].forEach((t) => {
        if (t.nodeType !== 3) return;
        const f = document.createDocumentFragment();
        t.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) return f.append(w);
          const wd = document.createElement("span");
          wd.style.cssText = "display:inline-block;white-space:nowrap";
          [...w].forEach((c) => { const ch = document.createElement("span"); ch.style.display = "inline-block"; ch.textContent = c; wd.append(ch); out.push(ch); });
          f.append(wd);
        });
        t.replaceWith(f);
      });
      return out;
    };
    gsap.matchMedia().add("(min-width: 960px)", () => {
      const T = () => $(".drawer__title", ds[0]).offsetWidth, W = () => inner.offsetWidth, H = () => innerHeight;
      const size = () => { gsap.set(ds, { width: W() - T() * (n - 1) }); sec.style.height = `${H() * (n + 1)}px`; };
      size();
      const made = [];
      ds.forEach((d, i) => {
        if (!i) return;
        const tw = gsap.fromTo(d, { x: () => W() - T() * (n - i) }, { x: () => T() * i, ease: "none", scrollTrigger: { trigger: sec, start: () => `${H() * i} 50%`, end: () => `${H() * (i + 1)} 50%`, scrub: true, invalidateOnRefresh: true } });
        const hd = $(".hand", d), h = $(".drawer__h", d);
        const cs = hd ? chars(hd) : [];
        gsap.set(cs, { autoAlpha: 0, filter: "blur(5px)" });
        gsap.set(h, { autoAlpha: 0, y: 40, filter: "blur(20px)" });
        const st = ScrollTrigger.create({ trigger: sec, start: () => `${H() * (i + 0.5)} 50%`, once: true, onEnter: () => {
          gsap.to(cs, { autoAlpha: 1, filter: "blur(0px)", duration: 2, ease: "expo.out", stagger: 0.02 });
          gsap.to(h, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 2, ease: "expo.out" });
        } });
        made.push(tw, st);
      });
      addEventListener("resize", size);
      ScrollTrigger.refresh();
      return () => { removeEventListener("resize", size); sec.style.height = ""; made.forEach((m) => (m.scrollTrigger || m).kill?.()); gsap.set(ds, { clearProps: "all" }); };
    });
  });

  /* ───── Slider (Swiper 11) ───── */
  if (window.Swiper) {
    const { Swiper } = window;
    // Destinations — background slides sideways (creative), front fades over as it changes, title y −80 · photo 1.3× parallax, 1.5s, 6-second autoplay
    $$(".dest").forEach((s) => {
      const pag = $(".dest__pag", s), titles = $$(".dest__slide", s).map((x) => x.dataset.title);
      const back = new Swiper($(".dest__bg", s), { loop: true, allowTouchMove: false, followFinger: false, parallax: true, speed: 1500, effect: "creative", creativeEffect: { prev: { translate: ["-100%", 0, -1] }, next: { translate: ["100%", 0, 0] } } });
      new Swiper($(".dest__main", s), {
        loop: true, followFinger: false, parallax: true, speed: 1500, effect: "fade", fadeEffect: { crossFade: true },
        autoplay: reduce ? false : { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true },
        navigation: { prevEl: $(".dest__prev", s), nextEl: $(".dest__next", s) },
        pagination: { el: pag, clickable: true, renderBullet: (i, cls) => `<button class="${cls}"><span class="progress-indicator"></span><span class="label">${titles[i]}</span></button>` },
        controller: { control: back },
        on: { autoplayTimeLeft(sw, t, p) { pag.style.setProperty("--progress", 1 - p); } },
      });
    });
    // Stay — centered, sides at .5 opacity, .5s
    $$(".stays__main").forEach((m) => new Swiper(m, { slidesPerView: 1, centeredSlides: true, loop: true, parallax: true, speed: 500, effect: "creative", creativeEffect: { limitProgress: 2, prev: { opacity: 0.5, translate: ["-100%", 0, 0] }, next: { opacity: 0.5, translate: ["100%", 0, 0] } }, navigation: { prevEl: $(".stays__prev", m.parentElement), nextEl: $(".stays__next", m.parentElement) }, breakpoints: { 720: { slidesPerView: 1.5 }, 960: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } } }));
    // Reviews — exit and enter by 80px up and down while fading, .5s
    $$(".reviews").forEach((r) => new Swiper($(".swiper", r), { loop: true, speed: 500, effect: "creative", creativeEffect: { prev: { translate: [0, -80, 0], opacity: 0 }, next: { translate: [0, 80, 0], opacity: 0 } }, navigation: { prevEl: $(".rv-prev", r), nextEl: $(".rv-next", r) } }));
    // Card row — from 1.1 cards visible up to 3 on wide screens
    $$(".card-carousel").forEach((c) => new Swiper(c, { spaceBetween: 12, slidesPerView: 1.1, navigation: { prevEl: $(`.cc-prev[data-for='${c.id}']`), nextEl: $(`.cc-next[data-for='${c.id}']`) }, breakpoints: { 600: { spaceBetween: 14, slidesPerView: 1.5 }, 800: { spaceBetween: 16, slidesPerView: 2 }, 1000: { spaceBetween: 18, slidesPerView: 2.5 }, 1200: { spaceBetween: 20, slidesPerView: 3 } } }));
    // Video testimonials — 1.5 slides → 4 slides
    $$(".vreviews").forEach((v) => new Swiper(v, { slidesPerView: 1.5, spaceBetween: 12, centerInsufficientSlides: true, navigation: { prevEl: $(".vr-prev"), nextEl: $(".vr-next") }, breakpoints: { 600: { spaceBetween: 14, slidesPerView: 2 }, 800: { spaceBetween: 16, slidesPerView: 3 }, 1000: { spaceBetween: 18, slidesPerView: 3.5 }, 1200: { spaceBetween: 20, slidesPerView: 4 } } }));
    // Photo strip (stay detail) — centered, auto-advances every 1.5s
    $$(".gallery").forEach((g) => new Swiper(g, { loop: true, slidesPerView: "auto", spaceBetween: 12, centeredSlides: true, slideToClickedSlide: true, autoplay: reduce ? false : { delay: 1500, disableOnInteraction: false }, navigation: { prevEl: $(".gal-prev", g.parentElement), nextEl: $(".gal-next", g.parentElement) }, breakpoints: { 600: { spaceBetween: 14 }, 800: { spaceBetween: 16 }, 1000: { spaceBetween: 18 }, 1200: { spaceBetween: 20 } } }));
  }

  /* ───── Tabs · accordion (.5s) ───── */
  $$(".tabs").forEach((t) => {
    const btns = $$(".tabs__btn", t), panes = $$(".tabs__pane", t);
    btns.forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      btns.forEach((x) => x.classList.toggle("active", x === b));
      panes.forEach((p) => p.classList.toggle("active", p.id === b.dataset.pane));
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }));
  });
  $$("[data-acc]").forEach((acc) => $$(".acc-item", acc).forEach((it) => {
    const trig = $(".acc-trigger", it), panel = $(".acc-panel", it);
    trig.addEventListener("click", () => {
      const on = !it.classList.contains("is-active");
      it.classList.toggle("is-active", on);
      trig.setAttribute("aria-expanded", on);
      gsap.to(panel, { height: on ? "auto" : 0, duration: reduce ? 0 : 0.5, ease: "power1.inOut", onComplete: () => ScrollTrigger.refresh() });
    });
  }));
  $$(".card__fav").forEach((f) => f.addEventListener("click", (e) => { e.preventDefault(); f.classList.toggle("is-on"); }));
  $(".rd-foot__toplink")?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener("load", () => ScrollTrigger.refresh());
})();
