// Work catalog LP scene: hero image pops out, per-section background colors, left header behind the hero and fixed recruit button, vertical tabs stacking on the right,
// Stadium image blur scrub, job card entrance and modal slide, talk title and progress dots, HR photo swap, recruiting image, tabloid fan, table-of-contents drawer.
(() => {
  const site = window.ddSite;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const mm = gsap.matchMedia();
  const isNarrow = () => innerWidth <= 1024;

  // ── Background color: changes the backdrop color when a section head touches the top of the screen. Talk sections switch instantly (is-moment) ──
  const bg = $("[data-js=bg]");
  const triggers = $$("[data-js=bg-trigger]");
  const names = [...new Set(triggers.map((t) => `is-${t.dataset.bg}`))];
  const paint = (t) => {
    bg.classList.remove(...names);
    if (t.hasAttribute("data-moment")) {
      bg.classList.add("is-notransition");
      void bg.offsetHeight;
      bg.classList.add(`is-${t.dataset.bg}`);
      requestAnimationFrame(() => bg.classList.remove("is-notransition"));
    } else bg.classList.add(`is-${t.dataset.bg}`);
  };
  triggers.forEach((t) => ScrollTrigger.create({ trigger: t, start: "top top", end: "bottom top", onEnter: () => paint(t), onEnterBack: () => paint(t) }));
  ScrollTrigger.create({ trigger: "[data-js=mv]", start: "top top", end: "bottom top", onEnterBack: () => bg.classList.remove(...names) });

  // ── Behind the hero, the left header (PC) and the fixed hiring button appear in .3s ──
  const side = $("[data-js=side]");
  mm.add("(min-width: 1025px)", () => {
    gsap.fromTo(side, { autoAlpha: 0 }, { autoAlpha: 1, duration: site.reduced ? 0 : 0.3, ease: "power1.out",
      scrollTrigger: { trigger: "#guide", start: "top top", toggleActions: "play none none reverse" } });
  });
  mm.add("(max-width: 1024px)", () => { gsap.set(side, { autoAlpha: 1 }); });
  gsap.fromTo("[data-js=fixedcta]", { autoAlpha: 0, y: "0.9375em" }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power1.out",
    scrollTrigger: { trigger: "#guide", start: "top top", toggleActions: "play none none reverse" } });

  // ── Vertical tabs: stay fixed once the section end touches the bottom of the screen, and at the last (HR) end are pushed up together by the tab height ──
  const allBars = $$("[data-js=navbar]");
  $$(".dd-navwrap").forEach((wrap) => {
    const bars = $$(":scope > [data-js=navbar]", wrap);
    ScrollTrigger.create({
      trigger: wrap,
      start: "bottom bottom",
      onEnter: () => bars.forEach((b) => b.classList.add("is-fixed")),
      onLeaveBack: () => bars.forEach((b) => { b.classList.remove("is-fixed"); gsap.set(b, { y: 0 }); }),
    });
    if (!wrap.classList.contains("is-end")) return;
    const reach = () => Math.max(...allBars.map((b) => (isNarrow() ? 3 * b.offsetHeight : b.offsetHeight)), 0);
    ScrollTrigger.create({
      trigger: wrap,
      start: "bottom bottom",
      end: () => `+=${reach()}`,
      scrub: true,
      invalidateOnRefresh: true,
      onEnter: () => allBars.forEach((b) => b.classList.add("is-fixed")),
      onEnterBack: () => allBars.forEach((b) => b.classList.add("is-fixed")),
      onUpdate: (st) => allBars.forEach((b) => gsap.set(b, { y: -reach() * st.progress })),
      onLeaveBack: () => allBars.forEach((b) => gsap.set(b, { y: 0 })),
    });
  });

  // ── Stadium art: blur goes 0 → 1 while passing the intro paragraph ──
  gsap.fromTo("[data-js=guide-blur]", { "--blur": 0 }, { "--blur": 1, ease: "none",
    scrollTrigger: { trigger: "[data-js=guide-blur-trigger]", start: "top top", end: "bottom top", scrub: true } });

  // ── Job modal: same Splide loop as the original js-guideslider (.5s · no dragging). When opened from a card, it goes to that slot at speed 0 and then restores the original speed ──
  const modal = $("[data-js=guide-modal]");
  const numEl = $("[data-js=guide-num]");
  const guide = new Splide($("[data-js=guide-slider]"), { type: "loop", perPage: 1, perMove: 1, pagination: false, arrows: true, drag: false, speed: 500 });
  const topAll = () => $$("[data-js=guide-slide]", modal).forEach((s) => (s.scrollTop = 0));
  guide.on("moved", () => {
    topAll();
    const s = guide.Components.Slides.getAt(guide.index);
    if (s?.slide.dataset.modal) numEl.textContent = s.slide.dataset.modal;
  });
  guide.mount();
  const jump = (no) => {
    numEl.textContent = no;
    const s = guide.Components.Slides.get().find((x) => x.slide.dataset.modal === no && !x.isClone);
    if (!s) return;
    const speed = guide.options.speed ?? 500;
    guide.options = { ...guide.options, speed: 0 };
    guide.go(s.index);
    requestAnimationFrame(() => (guide.options = { ...guide.options, speed }));
  };
  // Open: the panel shows, the backdrop appears in .4s, and the body appears .1s later over .4s (power2.out). Close hides instantly
  const openModal = (i) => {
    if (root.classList.contains("is-modalopen")) return;
    jump(String(i + 1).padStart(3, "0"));
    topAll();
    root.classList.add("is-modalopen");
    site.lenis?.stop();
    const tl = gsap.timeline().set(modal, { autoAlpha: 1 });
    if (!site.reduced) tl.fromTo(".dd-modal__bg", { alpha: 0 }, { alpha: 1, duration: 0.4, ease: "power2.out" })
      .fromTo(".dd-modal__panel", { alpha: 0 }, { alpha: 1, duration: 0.4, ease: "power2.out" }, "<+.1");
    $("[data-js=guide-close]", modal).focus({ preventScroll: true });
  };
  const closeModal = () => {
    if (!root.classList.contains("is-modalopen")) return;
    root.classList.remove("is-modalopen");
    site.lenis?.start();
    gsap.set(modal, { autoAlpha: 0 });
  };
  $$("[data-js=guide-open]").forEach((b) => b.addEventListener("click", () => openModal(Number(b.dataset.index))));
  $$("[data-js=guide-close]", modal).forEach((b) => b.addEventListener("click", closeModal));

  // ── Contents drawer: backdrop .4s, panel stands up from .95x and -3° in .6s expo.out (on phones it rises 15px) ──
  const gnav = $("[data-js=gnav]");
  const menuBtn = $("[data-js=menu]");
  const openMenu = () => {
    root.classList.add("is-menuopen");
    menuBtn.setAttribute("aria-expanded", "true");
    site.lenis?.stop();
    const tl = gsap.timeline().set(gnav, { autoAlpha: 1 });
    if (site.reduced) return;
    tl.fromTo("[data-js=gnav-bg]", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    // The original rises only at 750px and below (above that it’s .95x and -3°)
    if (matchMedia("(max-width: 750px)").matches) tl.fromTo("[data-js=gnav-main]", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, "<+.1");
    else tl.fromTo("[data-js=gnav-main]", { scale: 0.95, rotate: -3, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: "expo.out" }, "<+.1");
  };
  const closeMenu = () => {
    root.classList.remove("is-menuopen");
    menuBtn.setAttribute("aria-expanded", "false");
    site.lenis?.start();
    gsap.set(gnav, { autoAlpha: 0 });
  };
  menuBtn.addEventListener("click", () => (root.classList.contains("is-menuopen") ? closeMenu() : openMenu()));
  $("[data-js=gnav-close]").addEventListener("click", closeMenu);
  $("[data-js=gnav-bg]").addEventListener("click", closeMenu);
  // Every in-page # link rolls with Lenis over 1.5s, like the original hash_start_onclick (data-position is an extra offset to add)
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const to = a.getAttribute("href").length > 1 && $(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    if (a.matches("[data-js=gnav-link]")) closeMenu();
    if (site.lenis) site.lenis.scrollTo(to, { offset: +(a.dataset.position || 0), duration: 1.5 }); else to.scrollIntoView();
  }));
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (root.classList.contains("is-menuopen")) closeMenu();
    closeModal();
  });

  // ── Interview progress dots: when an article head passes screen center, a ball lands on that dot ──
  const articles = $$("[data-js=spon-article]");
  const dots = $$("[data-js=spon-dot]");
  const activate = (n) => dots.forEach((d) => d.classList.toggle("is-active", d.dataset.progress === n));
  articles.forEach((a) => ScrollTrigger.create({ trigger: a, start: "top center", end: "bottom center", onEnter: () => activate(a.dataset.progress), onEnterBack: () => activate(a.dataset.progress) }));

  // ── HR photos: Splide fade like the original js-hrmvslider (2s cross-fade every 6s, from the end back to the start) ──
  new Splide($("[data-js=hr-slider]"), { type: "fade", rewind: true, speed: 2000, autoplay: true, arrows: false, pagination: false, drag: false, interval: 6000 }).mount();


  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero: after .4s, three art groups scale from 0 to 1 elastically at once (1.2s elastic.out(1,.5), .08s apart), and the speech bubbles start flipping
    const groups = [1, 2, 3].map((g) => $$(`.dd-mv [data-group="${g}"]`));
    gsap.set(groups.flat(), { autoAlpha: 0, scale: 0 });
    const tl = gsap.timeline({ delay: 0.4 }).add(() => $$(".dd-mv .u-toggleimg").forEach((t) => t.classList.add("is-toggle-start")));
    groups.forEach((g, k) => tl.to(g, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "elastic.out(1,0.5)", stagger: 0.08 }, k === 0 ? "+=.1" : "<"));

    // Job cards: rise 30px, .1s apart in order within the row
    const cards = $$("[data-js=guide-item]");
    mm.add("(min-width: 751px)", () => cards.forEach((c, n) => gsap.fromTo(c, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out", delay: (n % 4) * 0.1, scrollTrigger: { trigger: c, start: "0% 70%", once: true } })));
    mm.add("(max-width: 750px)", () => cards.forEach((c) => gsap.fromTo(c, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: c, start: "0% 70%", once: true } })));

    // Talk title: subtitle → the rest at .3s intervals → English letters spring in
    gsap.timeline({ scrollTrigger: { trigger: "[data-js=spon-title]", start: "0% 70%", once: true } })
      .fromTo("[data-js=spon-sub]", { yPercent: 125, skewY: 1.5 }, { yPercent: 0, skewY: 0, duration: 0.7, ease: "power2.out" })
      .fromTo("[data-js=spon-other]", { y: 15, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out", stagger: 0.3 }, "-=.3")
      .fromTo(".dd-spon__en [data-split] > span", { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "elastic.out(1,0.95)", stagger: 0.035 }, "<");

    // HR title
    gsap.timeline({ scrollTrigger: { trigger: "[data-js=hr-title]", start: "0% 70%", once: true } })
      .fromTo("[data-js=hr-en]", { y: 15, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" })
      .fromTo("[data-js=hr-jp] [data-split] > span", { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out", stagger: 0.035 }, "-=.3")
      .fromTo(".dd-hr__large [data-split] > span", { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "elastic.out(1,0.95)", stagger: 0.04 }, "-=1");

    // Careers: title → pictures with 1s elastic.out(1,.5) at .1s each → speech bubbles in line order
    const ills = $$("[data-js=recruit-ill]");
    gsap.set(ills, { autoAlpha: 0, scale: 0 });
    gsap.timeline({ scrollTrigger: { trigger: "[data-js=recruit-mv]", start: "0% 70%", once: true } })
      .fromTo(".dd-recruit__en [data-split] > span", { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "elastic.out(1,0.9)", stagger: 0.035 })
      .fromTo("[data-js=recruit-jp]", { yPercent: 105, skewY: 2 }, { yPercent: 0, skewY: 0, duration: 0.5, ease: "power2.out" }, "<+.4")
      .to(ills, { autoAlpha: 1, scale: 1, duration: 1, ease: "elastic.out(1,0.5)", stagger: 0.1 }, "-=.8");
    $$("[data-js=recruit-item]").forEach((el, n) => gsap.fromTo(el, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out", delay: (n % 3) * 0.1, scrollTrigger: { trigger: el, start: "0% 70%", once: true } }));
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    $$(".dd-mv .u-toggleimg").forEach((t) => t.classList.remove("is-toggle-start"));
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
