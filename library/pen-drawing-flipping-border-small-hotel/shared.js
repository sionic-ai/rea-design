// Motion shared by all pages — the original uses jQuery and CSS transitions, so CSS transitions are kept as they are and only classes are added, so the timing side sees the same values.
// jQuery’s fadeIn/Out, slideToggle and animate use the swing curve (= sine.inOut), so it was ported to GSAP at the same length.
(() => {
  const SWING = "sine.inOut";
  const SWITCH_AT = 500;
  const ELEVATION = 377;
  const TICKER_SPEED = 30;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const head = { top: $(".u-head__top"), bottom: $(".u-head__bottom") };
  const nav = $(".u-nav");
  const burger = $(".u-burger");
  const burgerBtn = $(".u-burger__btn");
  const menu = $(".u-menu");
  const logo = $(".u-head .u-logo");
  const toTop = $(".u-totop");
  const foot = $(".u-foot");
  const elev = $("[data-elev]");

  // Arrow line graphic — background images can’t read CSS variables, so the graphic is built with the Skin color and applied as a variable
  const root = document.documentElement, kf = getComputedStyle(root);
  const arrow = (c) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 62 14'><path d='M0 7h60M53 1.5l7 5.5' fill='none' stroke='${c}' stroke-width='1'/></svg>`)}")`;
  root.style.setProperty("--site-arrow-img", arrow(kf.getPropertyValue("--kf-ink").trim()));
  root.style.setProperty("--site-arrow-img-dark", arrow(kf.getPropertyValue("--kf-contrast-ink").trim()));

  // Like jQuery fadeOut, it clears the space when done (display:none), and fadeIn restores the space and then reveals over .4s
  const fade = (el, show, dur = 0.4) => {
    if (!el || el._shown === show) return;
    el._shown = show;
    gsap.killTweensOf(el);
    if (show) {
      el.style.display = "";
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : dur, ease: SWING, clearProps: "opacity" });
    } else {
      gsap.to(el, { opacity: 0, duration: reduce ? 0 : dur, ease: SWING, onComplete: () => (el.style.display = "none") });
    }
  };

  // Pushes neighboring letters aside by the amount the 1.3× horizontally stretched text grows (the original does this only for menu, buttons, drawer and small headers)
  const widen = () => {
    $$(".u-sec__head-md .u-wide, .u-nav .u-wide, .u-btn-main .u-wide, .u-menu .u-wide, .u-wide-pad").forEach((el) => {
      el.style.paddingRight = "0px";
      el.style.paddingRight = `${el.offsetWidth * 0.3}px`;
    });
  };
  widen();
  document.fonts?.ready.then(widen);

  const showHead = () => {
    head.top?.classList.add("on");
    head.bottom?.classList.add("on");
    if (innerWidth < 769) burger?.classList.add("show");
  };
  if (document.readyState === "complete") showHead();
  else addEventListener("load", showHead);

  // News strip — the same three texts joined by full-width spaces, two copies, length = One set width ÷ 30px/s
  $$(".u-ticker__track").forEach((t) => {
    const text = t.textContent.trim();
    const set = Array(3).fill(text).join("　") + "　";
    t.innerHTML = `<span>${set}</span><span>${set}</span>`;
    const w = t.firstElementChild.scrollWidth;
    t.style.setProperty("--ticker-duration", `${w / TICKER_SPEED}s`);
  });

  const clock = $$("[data-clock]");
  const tick = () => {
    const s = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    clock.forEach((c) => (c.textContent = s));
  };
  if (clock.length) { tick(); setInterval(tick, 1000); }

  // Once it passes 100px below the screen, it seeps in one time
  const seep = () => {
    const y = scrollY, h = innerHeight;
    $$(".u-seep:not(.on)").forEach((el) => {
      if (y > el.getBoundingClientRect().top + y - h + 100) el.classList.add("on");
    });
  };

  // At first, like the original, nothing changes until scrolling — shown when visible, hidden at the very top
  let past = false;
  $$("[data-scroll-fade], [data-scroll-fade-pc]").forEach((el) => (el._shown = true));
  if (head.bottom) head.bottom._shown = true;
  if (toTop) toTop._shown = false;
  const onScroll = () => {
    const y = scrollY;
    const over = y > SWITCH_AT;
    if (innerWidth > 768) {
      nav?.classList.toggle("hide", over);
      burger?.classList.toggle("show", over || burger.classList.contains("active"));
    }
    if (over !== past) {
      past = over;
      $$("[data-scroll-fade]").forEach((el) => fade(el, !over));
      if (innerWidth > 480) $$("[data-scroll-fade-pc]").forEach((el) => fade(el, !over));
      logo?.classList.toggle("active", over || menu?.classList.contains("active"));
    }
    if (elev) {
      const max = document.documentElement.scrollHeight - innerHeight;
      elev.textContent = Math.round(ELEVATION * (1 - Math.min(max > 0 ? y / max : 0, 1)));
    }
    seep();
    if (toTop && foot) fade(toTop, y > foot.offsetTop);
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { widen(); onScroll(); });
  onScroll();

  // Burger drawer — the drawer and logo change together and the bottom line hides over .4s. Esc closes it too
  let keep = 0;
  const setMenu = (open) => {
    if (!menu || !burger) return;
    burger.classList.toggle("active", open);
    menu.classList.toggle("active", open);
    logo?.classList.toggle("active", open || scrollY > SWITCH_AT);
    menu.setAttribute("aria-hidden", String(!open));
    burgerBtn?.setAttribute("aria-expanded", String(open));
    burgerBtn?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    fade(head.bottom, !open);
    if (innerWidth < 481) {
      if (open) keep = scrollY;
      document.body.style.overflowY = open ? "hidden" : "";
      if (!open) scrollTo(0, keep);
    }
  };
  burger?.addEventListener("click", () => setMenu(!burger.classList.contains("active")));
  $$(".u-menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && burger?.classList.contains("active") && setMenu(false));

  // Sound button — a placeholder, so there is no sound, only the state (background fill, text) changes
  $$(".u-sound").forEach((b) =>
    b.addEventListener("click", () => {
      const on = b.classList.toggle("off");
      b.querySelector(".u-btn-main__text").textContent = on ? "Sound ON" : "Sound OFF";
      b.setAttribute("aria-label", on ? "Background sound off" : "Background sound on");
    })
  );

  // Collapsible questions — only the pressed one opens in .2s, the rest collapse
  const slide = (panel, open) => {
    gsap.killTweensOf(panel);
    if (open) {
      panel.style.display = "block";
      gsap.from(panel, { height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, duration: reduce ? 0 : 0.2, ease: SWING, clearProps: "height,paddingTop,paddingBottom,marginTop" });
    } else if (panel.style.display === "block") {
      gsap.to(panel, { height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, duration: reduce ? 0 : 0.2, ease: SWING, onComplete: () => { panel.style.display = "none"; gsap.set(panel, { clearProps: "height,paddingTop,paddingBottom,marginTop" }); } });
    }
  };
  $$(".u-aco__label").forEach((label) =>
    label.addEventListener("click", () => {
      const open = !label.classList.contains("open");
      $$(".u-aco__label.open").forEach((o) => { if (o !== label) { o.classList.remove("open"); o.setAttribute("aria-expanded", "false"); slide(o.nextElementSibling, false); } });
      label.classList.toggle("open", open);
      label.setAttribute("aria-expanded", String(open));
      slide(label.nextElementSibling, open);
    })
  );

  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 ? $(id) : document.documentElement;
      if (!target) return;
      e.preventDefault();
      gsap.to(window, { scrollTo: target.getBoundingClientRect().top + scrollY, duration: reduce ? 0 : 0.6, ease: SWING });
    })
  );
  toTop?.addEventListener("click", () => gsap.to(window, { scrollTo: 0, duration: reduce ? 0 : 0.5, ease: SWING }));

  if (!window.Swiper) return;

  // Room slider — centered and infinite, one slot per second every 4 seconds. Runs only while 40% visible and updates the page number only then
  $$(".u-slider-main").forEach((box) => {
    const real = $$(".swiper-slide[data-real]", box).length;
    const pager = box.previousElementSibling?.querySelector(".u-pager__now") || box.closest("section")?.querySelector(".u-pager__now");
    let inView = false;
    const page = (s) => pager && (pager.textContent = (s.realIndex % real) + 1);
    const sw = new Swiper($(".swiper", box), {
      slidesPerView: "auto",
      spaceBetween: 23,
      centeredSlides: true,
      loop: true,
      speed: 1000,
      loopedSlides: real + 2,
      autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
      breakpoints: { 480: { slidesPerView: "auto" }, 0: { slidesPerView: 1 } },
      on: { init() { inView && page(this); }, slideChangeTransitionEnd() { inView && page(this); } },
    });
    new IntersectionObserver((es) => es.forEach((e) => {
      inView = e.isIntersecting;
      if (reduce) return;
      if (inView) { sw.autoplay.start(); page(sw); } else sw.autoplay.stop();
    }), { threshold: 0.4 }).observe(box);
  });

  // Single-photo slider — crossfades over 1s, changes every 4s
  $$(".u-slider-fade").forEach((box) => {
    const pager = box.closest("section")?.querySelector(".u-pager__now");
    new Swiper($(".swiper", box), {
      slidesPerView: 1,
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      speed: 1000,
      autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false, stopOnLastSlide: false },
      on: {
        init() { pager && (pager.textContent = this.realIndex + 1); },
        slideChange() { pager && (pager.textContent = this.realIndex + 1); },
      },
    });
  });

  // Endlessly flowing photo row — 8s per cell at constant speed. At 768 and below the slider is released and stacked vertically
  const loops = [];
  const loopInit = () => {
    $$(".u-slider-loop").forEach((box, i) => {
      const el = box.querySelector(".swiper, .is-normal");
      const wrap = el.firstElementChild;
      loops[i]?.destroy(true, true);
      loops[i] = null;
      if (innerWidth <= 768) {
        el.classList.replace("swiper", "is-normal");
        wrap.classList.replace("swiper-wrapper", "is-normal-wrapper");
        [...wrap.children].forEach((c) => c.classList.replace("swiper-slide", "is-normal-slide"));
        return;
      }
      el.classList.replace("is-normal", "swiper");
      wrap.classList.replace("is-normal-wrapper", "swiper-wrapper");
      [...wrap.children].forEach((c) => c.classList.replace("is-normal-slide", "swiper-slide"));
      loops[i] = new Swiper(el, {
        slidesPerView: "auto",
        spaceBetween: 23,
        loop: true,
        speed: 8000,
        autoplay: reduce ? false : { delay: 0, disableOnInteraction: false, stopOnLastSlide: false },
      });
    });
  };
  if ($(".u-slider-loop")) {
    loopInit();
    let w = innerWidth;
    addEventListener("resize", () => { if (w !== innerWidth) { w = innerWidth; loopInit(); } });
  }
})();
