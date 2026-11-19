// Machinery shared by all pages — draws the header, menu cover, footer and first-open cover, and attaches text splitting, Locomotive (lerp .06), barba transitions,
// Attaches the idle-triggered clock · accordion · Contact input · inview. Devices that differ per page (Hero slide · list strip · detail gallery) are registered in window.miPages and
// Re-attached on the new section after the transition (barba doesn’t run the new page’s scripts).
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = () => innerWidth < 768;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  window.miPages = window.miPages || {};

  const MENU = [
    ["index.html", "Top", "home"],
    ["product.html", "Product Line", "product"],
    ["about.html", "About Studio", "about"],
    ["article.html", "News", "article"],
    ["contact.html", "Contact", "contact"],
  ];
  const MARK = '<path fill="currentColor" d="M2 47V20C2 10.6 7.6 4 15 4s13 6.6 13 16v27h-8V20.5c0-4.6-2.1-8-5-8s-5 3.4-5 8V47Zm22 0V22c0-9.4 5.2-16 12-16s10 6.2 10 14v27h-7V20.8c0-4-1.4-7-3.5-7S32 17 32 21.4V47Z"/><circle fill="currentColor" cx="41.5" cy="3.5" r="3.5"/>';
  const logoFull = `<svg class="mi-logo-full" viewBox="0 0 284 49" aria-hidden="true">${MARK}<text class="mi-logo-type" x="64" y="33" textLength="220" lengthAdjust="spacing" fill="currentColor" style="font: 400 19px var(--kf-font-display)">STUDIO NAME</text></svg><svg class="mi-logo-mark" viewBox="0 0 48 49" aria-hidden="true">${MARK}</svg>`;
  const logoType = (fill) => `<svg viewBox="0 0 1824 142" aria-hidden="true">${fill || ""}<text x="0" y="139" textLength="1824" lengthAdjust="spacing" fill="${fill ? "url(#mi-grad)" : "currentColor"}" style="font: 400 190px var(--kf-font-display)">STUDIO NAME</text></svg>`;
  const gradDefs = '<defs><linearGradient id="mi-grad" x1="0" y1="0" x2="0" y2="6"><stop offset="0" style="stop-color: var(--site-grad-1)"/><stop offset=".2" style="stop-color: var(--site-grad-1)"/><stop offset=".4" style="stop-color: var(--site-grad-2)"/><stop offset=".6" style="stop-color: var(--site-grad-2)"/><stop offset=".8" style="stop-color: var(--site-grad-1)"/><stop offset="1" style="stop-color: var(--site-grad-1)"/><animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="0 -5" dur="40s" repeatCount="indefinite"/></linearGradient></defs>';

  function drawChrome() {
    const header = $('[data-slot="header"]');
    if (header && !header.children.length) {
      header.innerHTML = `
  <h1 class="mi-header__logo"><a href="index.html" aria-label="Home" data-label="Brand logo — mark + wide-spaced English name">${logoFull}</a></h1>
  <ul class="mi-header__list">${MENU.map(([h, t]) => `<li><a href="${h}"><span class="mi-word mi-word-pop js-word js-hover">${t}</span></a></li>`).join("")}</ul>
  <ul class="mi-header__lang"><li class="is-active"><a href="#">KO</a></li><li><a href="#">EN</a></li><li><a href="#">JA</a></li></ul>
  <small class="mi-header__copy" data-label="Month · year label"><span class="mi-word mi-word-in js-word" data-order="4">Mon</span><br><span class="mi-word mi-word-in js-word" data-order="5">©0000</span></small>
  <button class="mi-header__toggle" type="button" aria-label="Open Menu"></button>
  <div class="mi-nav" data-slot="nav-drawer">
    <div class="mi-nav__main"><div class="mi-nav__inner">
      <div class="mi-nav__list"><div class="mi-nav__list-in">
        <p class="mi-nav__top"><a href="index.html"><span class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="1">TOP</span></a></p>
        <ul class="mi-nav__gnav">
          <li><a href="product.html"><span class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="1">PRODUCT LINE</span><sup class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="4">(00)</sup></a></li>
          <li><a href="about.html"><span class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="2">ABOUT STUDIO</span></a></li>
          <li><a href="article.html"><span class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="3">NEWS</span><sup class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="4">(00.0.0000)</sup></a></li>
          <li><a href="contact.html"><span class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="4">CONTACT</span></a></li>
        </ul>
        <ul class="mi-nav__snav">
          <li><a href="#"><span class="mi-word mi-word-navin mi-word-pop js-word js-hover" data-order="3">Social Link</span></a></li>
          <li><a href="#"><span class="mi-word mi-word-navin mi-word-pop js-word js-hover" data-order="4">Privacy Policy</span></a></li>
          <li><a href="#"><span class="mi-word mi-word-navin mi-word-pop js-word js-hover" data-order="5">Terms &amp; Conditions</span></a></li>
        </ul>
      </div></div>
      <div class="mi-nav__image" data-white-flag>
        <a class="mi-nav__image-in" href="detail.html"><div class="mi-nav__image-main">
          <div class="mi-nav__info"><h2 class="mi-nav__info-title"><span class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="2">FIGURE NAME</span></h2><p class="mi-nav__info-caption"><span class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="3">‘Caption Line’ - SERIES NAME</span></p></div>
          <div class="mi-nav__photo"><div class="mi-photo" style="--character: var(--site-tone-1)" data-label="Latest figure full body · dark interior warm lighting · portrait arch 1776:2418"></div></div>
          <div class="mi-nav__button"><span class="mi-btn mi-btn-in"><span class="mi-word mi-word-in mi-word-roll js-word js-hover" data-order="btn">EXPLORE</span></span></div>
        </div></a>
      </div>
    </div></div>
    <div class="mi-nav__bg" style="--nav-color: var(--site-tone-1)"><div class="mi-nav__bg-image"><div class="mi-photo" style="--character: var(--site-tone-1)" data-label="Same figure photo (blurred)"></div></div></div>
    <button class="mi-nav__door" type="button" aria-label="View photo side"></button>
  </div>`;
    }
    const footer = $('[data-slot="footer"]');
    if (footer && !footer.children.length) {
      footer.innerHTML = `
  <h2 class="mi-footer__logo" data-label="Brand text logo (screen width)">${logoType(gradDefs)}</h2>
  <nav class="mi-footer__nav">
    <ul>${MENU.map(([h, t]) => `<li><a href="${h}"><span class="mi-word mi-word-pop js-word js-hover">${t}</span></a></li>`).join("")}</ul>
    <p class="mi-footer__sns"><a href="#"><span class="mi-word mi-word-pop js-word js-hover">Social Link</span></a></p>
    <ul><li><a href="#"><span class="mi-word mi-word-pop js-word js-hover">Privacy Policy</span></a></li><li><a href="#"><span class="mi-word mi-word-pop js-word js-hover">Terms &amp; Conditions</span></a></li></ul>
  </nav>`;
    }
    if (!$(".mi-cover")) {
      const cover = document.createElement("div");
      cover.className = "mi-cover";
      cover.setAttribute("aria-hidden", "true");
      cover.innerHTML = `<div class="mi-cover__logo">${logoType()}</div>`;
      body.append(cover);
    }
  }

  // Each letter goes in its own span — the order (--i) is used by CSS as the delay. Over 16 letters uses a long-line delay
  function splitWords(scope = document) {
    $$(".js-word", scope).forEach((w) => {
      const chars = [...w.textContent];
      w.dataset.word = w.textContent;
      w.textContent = "";
      chars.forEach((ch, i) => {
        const s = document.createElement("span");
        s.textContent = ch;
        s.style.setProperty("--i", i + 1);
        w.append(s);
      });
      w.classList.remove("js-word");
      if (chars.length > 15) w.classList.add("is-long");
    });
  }

  // The roll hover holds .5s more after release, and when any inner animation·transition ends it’s released .1s later so the next hover plays again (the original listens to both)
  function hoverLinger(scope = document) {
    $$(".js-hover", scope).forEach((w) => {
      const t = w.closest("a, button") || w;
      if (t.dataset.miHover) return;
      t.dataset.miHover = "1";
      let timer;
      t.addEventListener("mouseenter", () => { t.classList.add("is-hover"); clearTimeout(timer); });
      t.addEventListener("mouseleave", () => { clearTimeout(timer); timer = setTimeout(() => t.classList.remove("is-hover"), 500); });
      const release = () => { clearTimeout(timer); timer = setTimeout(() => t.classList.remove("is-hover"), 100); };
      t.addEventListener("animationend", release);
      t.addEventListener("transitionend", release);
    });
  }

  const setVh = () => body.style.setProperty("--vh", `${(sp() ? innerHeight : root.clientHeight || innerHeight) / 100}px`);

  // Smooth scroll — original locomotive-scroll 4.1.1 · lerp .06 · phones and tablets use default scroll
  const doc = $(".mi-doc");
  let loco;
  function initLoco() {
    gsap.registerPlugin(ScrollTrigger);
    if (!window.LocomotiveScroll || !doc) return;
    loco = new LocomotiveScroll({ el: doc, smooth: !reduce, smartphone: { smooth: false }, tablet: { smooth: false }, lerp: 0.06 });
    window.miLoco = loco;
    loco.on("scroll", ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(doc, {
      scrollTop(v) { return arguments.length ? loco.scrollTo(v, { duration: 0, disableLerp: true }) : loco.scroll.instance.scroll.y; },
      getBoundingClientRect() { return { top: 0, left: 0, width: innerWidth, height: innerHeight }; },
      pinType: doc.style.transform ? "transform" : "fixed",
    });
    ScrollTrigger.addEventListener("refresh", () => loco.update());
    ScrollTrigger.refresh();
  }
  const scrollTo = (target, sec = 1) => {
    setTimeout(() => root.classList.remove("is-nav", "is-door"), 10);
    if (loco) loco.scrollTo(target, { duration: 1000 * sec, offset: sp() ? -50 : -100, disableLerp: sec === 0 });
    else if (target === 0 || target === "top") window.scrollTo(0, 0);
  };
  window.miScrollTo = scrollTo;
  const scrollY = () => (loco ? loco.scroll.instance.scroll.y : window.scrollY);

  // ───────── Menu overlay ─────────
  function initNav() {
    const toggle = $(".mi-header__toggle");
    const door = $(".mi-nav__door");
    const main = $(".mi-nav__list");
    const image = $(".mi-nav__image");
    const copy = $(".mi-header__copy");
    if (!toggle) return;
    let t;
    toggle.addEventListener("click", () => {
      if (root.classList.contains("is-nav")) {
        root.classList.remove("is-nav", "is-door", "is-lang");
        t = setTimeout(() => {
          main.classList.remove("is-active");
          image.classList.remove("is-active");
          if (!$(".mi-home")) copy.classList.remove("is-active");
        }, 200);
        loco && loco.start();
      } else {
        clearTimeout(t);
        root.classList.add("is-nav");
        copy.classList.add("is-active");
        if (!sp()) image.classList.add("is-active");
        main.classList.add("is-active");
        loco && loco.stop();
      }
    });
    door && door.addEventListener("click", () => {
      root.classList.remove("is-lang");
      if (root.classList.contains("is-door")) {
        root.classList.remove("is-door");
        main.classList.add("is-active");
        image.classList.remove("is-active");
      } else {
        root.classList.add("is-door");
        main.classList.remove("is-active");
        image.classList.add("is-active");
      }
      copy.classList.remove("is-active");
      setTimeout(() => copy.classList.add("is-active"), 30);
    });
    $(".mi-header__lang").addEventListener("touchend", () => root.classList.add("is-lang"));
    $$(".mi-header__lang a").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  }

  // ───────── Idle clock — after 10s without interaction or when the mouse leaves the window, the header line drops out and a clock appears (list · detail) ─────────
  const clock = { t1: 0, t2: 0, off: null };
  const pad = (n) => String(n).padStart(2, "0");
  function initClock(scope) {
    if (!$(".mi-clock", scope)) return;
    const page = () => window.miPage || {};
    const fire = () => {
      if (!root.classList.contains("is-open")) page().autoPlay && page().autoPlay();
      if (!root.classList.contains("is-changing")) root.classList.add("is-clock");
      clearTimeout(clock.t1);
    };
    const reset = () => {
      root.classList.remove("is-clock");
      clearTimeout(clock.t1);
      clock.t1 = setTimeout(fire, 1e4);
    };
    const tick = () => {
      const d = new Date();
      const h = d.getHours();
      const parts = {
        zone: h < 12 ? "AM" : "PM",
        hour: pad(h % 12 || 12),
        minutes: pad(d.getMinutes()),
        date: d.toLocaleDateString("en-US", { weekday: "long" }),
        month: d.toLocaleDateString("en-US", { month: "long" }),
        day: String(d.getDate()),
        year: String(d.getFullYear()),
      };
      $$("[data-clock]").forEach((n) => { n.textContent = parts[n.dataset.clock]; });
    };
    tick();
    clock.t2 = setInterval(tick, 1e3);
    const host = $(".mi-root");
    const onBlur = () => { reset(); clearTimeout(clock.t1); };
    ["mousedown", "touchstart", "mousemove", "touchmove"].forEach((ev) => host.addEventListener(ev, reset, { passive: true }));
    // Only when leaving the window — moving to an overlay directly under body like scrollbars or annotation buttons isn’t leaving (the original shows no clock then either)
    const onLeave = (e) => { if (!e.relatedTarget) fire(); };
    host.addEventListener("mouseleave", onLeave);
    addEventListener("blur", onBlur);
    clock.off = () => {
      ["mousedown", "touchstart", "mousemove", "touchmove"].forEach((ev) => host.removeEventListener(ev, reset));
      host.removeEventListener("mouseleave", onLeave);
      removeEventListener("blur", onBlur);
    };
    reset();
  }
  function stopClock() {
    clearTimeout(clock.t1);
    clearInterval(clock.t2);
    clock.off && clock.off();
    clock.off = null;
  }

  // ───────── After the News hero passes, header bar text turns ink-colored ─────────
  function initNews(scope) {
    const kv = $(".mi-news-kv", scope);
    if (!kv) return;
    ScrollTrigger.create({
      scroller: doc, trigger: kv, start: "top top", end: "bottom 5%",
      onLeave: () => root.classList.add("is-notfv"),
      onEnterBack: () => root.classList.remove("is-notfv"),
    });
  }

  // ───────── Accordion — jQuery slideDown·slideUp defaults (.4s swing = sine.inOut). Height and top/bottom padding open together from 0 ─────────
  function initAccordion(scope) {
    $$(".js-accordion", scope).forEach((item) => {
      const title = $(".js-accordion-title", item);
      const bodyEl = $(".js-accordion-body", item);
      const dur = reduce ? 0 : 0.4;
      const done = () => { gsap.set(bodyEl, { clearProps: "height,paddingTop,paddingBottom,overflow" }); loco && loco.update(); };
      title.addEventListener("click", () => {
        const open = item.classList.contains("is-active");
        gsap.killTweensOf(bodyEl);
        if (open) {
          item.classList.remove("is-active");
          title.classList.remove("is-active");
          bodyEl.classList.remove("is-active");
          setTimeout(() => gsap.to(bodyEl, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden", duration: dur, ease: "sine.inOut", onComplete: () => { bodyEl.style.display = "none"; done(); } }), 10);
        } else {
          gsap.set(bodyEl, { clearProps: "height,paddingTop,paddingBottom" });
          bodyEl.style.display = "block";
          // Measuring auto while the margin is 0 makes the target shrink by the margin and jump at the end — measure the fully open height first
          const cs = getComputedStyle(bodyEl);
          const to = { height: bodyEl.offsetHeight, paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom };
          gsap.fromTo(bodyEl, { height: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }, { ...to, duration: dur, ease: "sine.inOut", onComplete: done });
          setTimeout(() => { item.classList.add("is-active"); title.classList.add("is-active"); bodyEl.classList.add("is-active"); }, 10);
        }
      });
    });
  }

  // ───────── Contact input — filled fields fold their label up and draw an underline, and once all required fields are filled the send button turns on ─────────
  function initForm(scope) {
    const form = $(".js-form", scope);
    if (!form || form.classList.contains("is-ready")) return;
    form.classList.add("is-ready");
    const submit = $(".js-form-submit", form);
    const fields = $$("input, select, textarea", form);
    const need = $$(".is-required input, .is-required select, .is-required textarea", form).length;
    const check = () => submit.classList.toggle("is-active", need === $$(".is-required.is-inputed", form).length);
    fields.forEach((f) => ["input", "blur", "change"].forEach((ev) => f.addEventListener(ev, () => {
      const item = f.closest(".mi-form__item");
      const u = f.closest(".mi-underline");
      const on = f.value !== "";
      item && item.classList.toggle("is-inputed", on);
      u && u.classList.toggle("is-inputed", on);
      check();
    })));
    form.addEventListener("submit", (e) => e.preventDefault());
    check();
  }

  // ───────── inview — fires once when reaching the 85% line of the screen (90% on phones). Items caught in the same frame are delayed by .1s each ─────────
  function initInview(scope) {
    let n = 0;
    $$("[data-inview]", scope).forEach((el) => {
      if (el.classList.contains("is-inview")) return;
      const at = el.dataset.inview === "view" ? "bottom" : sp() ? "90%" : "85%";
      ScrollTrigger.create({
        scroller: doc, trigger: el, start: `top ${at}`, once: true,
        onEnter: () => {
          setTimeout(() => el.classList.add("is-inview"), reduce ? 0 : 100 * n);
          n += 1;
          setTimeout(() => { n = 0; }, 10);
        },
      });
    });
  }

  function pageInit(scope) {
    setVh();
    splitWords(scope);
    hoverLinger(document);
    const ns = scope.dataset.barbaNamespace;
    window.miPage = {};
    if (window.miPages[ns]) window.miPage = window.miPages[ns](scope, { doc, loco, reduce, sp }) || {};
    initClock(scope);
    initNews(scope);
    initForm(scope);
    initAccordion(scope);
    initInview(scope);
  }

  // ───────── barba transition — sync: the outgoing section is held 1.3s, the incoming section rises 30ms later with is-changing over 1s and is released at 830ms ─────────
  function initBarba() {
    if (!window.barba) return;
    barba.init({
      preventRunning: true,
      transitions: [{
        name: "skew-slide",
        sync: true,
        leave() {
          const done = this.async();
          setTimeout(() => root.classList.remove("is-nav", "is-door", "is-clock", "is-open", "is-noclock", "is-lang", "is-notfv"), 10);
          $(".mi-header__copy").classList.remove("is-active");
          ScrollTrigger.getAll().forEach((t) => t.kill());
          loco && loco.stop();
          stopClock();
          window.miPage && window.miPage.destroy && window.miPage.destroy();
          setTimeout(done, reduce ? 0 : 1300);
        },
        enter(data) {
          const prev = data.current.container;
          const next = data.next.container;
          prev.classList.add("is-prev");
          // When a new section comes in, the part (fx-core) reads the size so the style is computed once — adding is-next as is would first run a transition moving down in place, so
          // The slide rising from 100vh below is nearly invisible. Plant the first spot without a transition
          next.style.transition = "none";
          next.classList.add("is-next");
          void next.offsetHeight;
          next.style.transition = "";
          prev.style.top = `${-scrollY()}px`;
          ScrollTrigger.getAll().forEach((t) => t.kill());
          pageInit(next);
          scrollTo(0, 0);
          setTimeout(() => {
            root.classList.add("is-changing");
            setTimeout(() => { loco && loco.update(); ScrollTrigger.refresh(); }, 400);
            setTimeout(() => {
              next.classList.remove("is-next");
              root.classList.remove("is-changing");
              setTimeout(() => {
                ScrollTrigger.refresh();
                setTimeout(() => { loco && (loco.update(), loco.start()); }, 100);
              }, 10);
            }, reduce ? 0 : 800);
          }, 30);
        },
      }],
    });
    barba.hooks.beforeEnter((data) => {
      const m = data.next.html.match(/<body[^>]*data-page="([^"]*)"[^>]*data-color="([^"]*)"/);
      if (!m) return;
      body.dataset.page = m[1];
      setTimeout(() => { body.dataset.color = m[2]; }, 30);
      setTimeout(() => { body.dataset.color = m[2]; }, 100);
    });
  }

  drawChrome();
  splitWords(document);
  setVh();
  initBarba();
  initLoco();
  initNav();
  hoverLinger(document);
  const first = $('[data-barba="container"]');
  setTimeout(() => pageInit(first), reduce ? 0 : 1300);
  setTimeout(() => root.classList.remove("is-loading"), reduce ? 0 : 3500);
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(setVh, 30); });
})();
