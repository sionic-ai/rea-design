// One set shared across the site: swup page transitions (curtain is a slant-rise-page part) · first-visit curtain · header visibility · menu · scroll reveal · Embla slider · interview window · accordion · floating Entry.
// Values exactly as in the original bundle.js — curve p=power3, m=power2, r=expo. Anything that differs per page is attached with HK.page(name, attach), which returns the detach function.
(() => {
  const PC = 961;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPC = () => innerWidth >= PC;
  const pages = {};
  let offs = [];
  const HK = (window.HK = { page: (name, fn) => { pages[name] = fn; } });
  gsap.registerPlugin(ScrollTrigger);

  const lock = (on) => { document.documentElement.style.overflow = on ? "hidden" : ""; };

  const splash = () => new Promise((res) => {
    const el = document.querySelector(".hk-splash");
    if (!el) return res();
    if (sessionStorage.getItem("hk-splash-shown") === "true" || reduce) { el.hidden = true; return res(); }
    lock(true);
    gsap.to(el, { autoAlpha: 0, duration: 0.8, delay: 0.8, ease: "power2.inOut", onComplete: () => { sessionStorage.setItem("hk-splash-shown", "true"); el.hidden = true; lock(false); res(); } });
  });

  const header = (root) => {
    const html = document.documentElement, target = root.querySelector(".js-header-target");
    if (!target) { html.classList.add("is-header-showed"); return () => {}; }
    html.classList.remove("is-header-showed");
    const io = new IntersectionObserver((es) => es.forEach((e) => html.classList.toggle("is-header-showed", !e.isIntersecting)));
    io.observe(target);
    return () => io.disconnect();
  };

  const menu = () => {
    const html = document.documentElement;
    const burger = document.querySelector("[data-menu-burger]"), wrap = document.querySelector("[data-menu-wrap]"), content = document.querySelector("[data-menu-content]");
    if (!burger || !wrap || !content) return { close() {} };
    const links = wrap.querySelectorAll("[data-menu-link]"), sns = wrap.querySelectorAll("[data-menu-sns]"), entries = wrap.querySelectorAll("[data-menu-entry]");
    const reset = () => { gsap.set(wrap, { display: "none", autoAlpha: 0 }); gsap.set(content, { clipPath: "inset(0 0 0 100%)", autoAlpha: 0 }); gsap.set([links, sns, entries], { x: "2rem", autoAlpha: 0 }); };
    let open = false;
    const close = () => {
      if (!open) return;
      open = false; lock(false); burger.setAttribute("aria-expanded", "false");
      const tl = gsap.timeline({ defaults: { duration: reduce ? 0 : 0.4, ease: "power3.out" } });
      tl.to([links, entries, sns], { autoAlpha: 0 });
      tl.to(content, { clipPath: "inset(0 0 0 100%)" }, "-=0.1");
      tl.to(wrap, { autoAlpha: 0, onComplete: () => { html.classList.remove("is-menu-opened"); reset(); } }, "-=0.1");
    };
    const show = () => {
      reset(); open = true; lock(true); burger.setAttribute("aria-expanded", "true");
      html.classList.add("is-menu-opened");
      gsap.set(wrap, { display: "" });
      const tl = gsap.timeline({ defaults: { duration: reduce ? 0 : 0.4, ease: "power3.out" } });
      tl.to(wrap, { display: "block", autoAlpha: 1 });
      tl.to(content, { clipPath: "inset(0 0 0 0%)", autoAlpha: 1 }, "-=0.1");
      tl.to(isPC() ? [links, sns, entries] : [links, entries, sns], { x: 0, autoAlpha: 1, stagger: 0.03 }, "-=0.1");
    };
    burger.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); open ? close() : show(); });
    wrap.addEventListener("click", (e) => { if (!e.target.closest("[data-menu-content]")) close(); });
    wrap.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => close()));
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    return { close };
  };

  const reveal = (root) => {
    if (reduce) return () => {};
    const made = [];
    const st = (o) => { const t = ScrollTrigger.create(o); made.push(t); return t; };
    const imgs = (el) => [...el.querySelectorAll("[data-reveal-img]")];
    root.querySelectorAll("[data-reveal]").forEach((el) => {
      const type = el.getAttribute("data-reveal");
      const targets = [...el.querySelectorAll("[data-reveal-target]")];
      if (type === "fade") {
        gsap.set(el, { autoAlpha: 0, y: "3rem" });
        st({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(el, { duration: 0.8, ease: "power3.out", autoAlpha: 1, y: "0rem", clearProps: "all" }) });
      } else if (type === "fade-group") {
        gsap.set(targets, { autoAlpha: 0, y: "3rem" });
        st({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(targets, { duration: 0.8, ease: "power3.out", autoAlpha: 1, y: "0rem", clearProps: "all", stagger: 0.05 }) });
      } else if (type === "visual") {
        const t = imgs(el);
        gsap.set(t, { scale: 1.3, autoAlpha: 0 });
        st({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(t, { duration: 1, autoAlpha: 1, ease: "power3.out", scale: 1, clearProps: "all" }) });
      } else if (type === "slider-group") {
        // The Embla loop places cells by the cell (item) transform — if a reveal moves that cell the loop position is erased, so move the card inside the cell
        targets.forEach((t, i) => { if (t.classList.contains("hk-slider__item") && t.firstElementChild) targets[i] = t.firstElementChild; });
        const t = imgs(el);
        gsap.set(targets, { autoAlpha: 0, y: "3rem" }); gsap.set(t, { scale: 1.3 });
        st({ trigger: el, start: "top 85%", once: true, onEnter: () => { gsap.to(targets, { duration: 0.8, ease: "power3.out", autoAlpha: 1, y: "0rem", stagger: 0.1 }); gsap.to(t, { duration: 1, ease: "power3.out", scale: 1, clearProps: "all", stagger: 0.1 }); } });
      }
    });
    return () => made.forEach((t) => t.kill());
  };

  const sliders = (root) => {
    const apis = [];
    root.querySelectorAll(".js-slider").forEach((el) => {
      const type = el.getAttribute("data-slider-type") || "";
      const viewport = el.querySelector("[data-slider-viewport]");
      if (!viewport || !window.EmblaCarousel) return;
      const opts = { loop: true, align: "center", duration: 25 };
      const plugins = [];
      if (type === "only-sp") { opts.active = true; opts.breakpoints = { [`(min-width: ${PC}px)`]: { active: false } }; }
      if (type === "full") { if (window.EmblaCarouselFade) plugins.push(EmblaCarouselFade()); if (window.EmblaCarouselAutoplay && !reduce) plugins.push(EmblaCarouselAutoplay({ delay: 5000 })); }
      const api = EmblaCarousel(viewport, opts, plugins);
      const cur = el.querySelector("[data-slider-number-current]"), total = el.querySelector("[data-slider-number-total]");
      const prev = el.querySelector("[data-slider-prev]"), next = el.querySelector("[data-slider-next]");
      const n = api.slideNodes().length;
      const sync = () => { if (cur) cur.textContent = String(api.selectedScrollSnap() + 1); if (total) total.textContent = String(n); el.classList.toggle("is-off", !api.internalEngine().options.active); };
      api.on("select", sync).on("reInit", sync); sync();
      const ap = () => api.plugins().autoplay;
      prev && prev.addEventListener("click", () => { ap() && ap().reset(); api.scrollPrev(); });
      next && next.addEventListener("click", () => { ap() && ap().reset(); api.scrollNext(); });
      apis.push(api);
    });
    return () => apis.forEach((a) => a.destroy());
  };

  const modal = (root) => {
    const box = document.querySelector(".hk-modal");
    if (!box) return () => {};
    const panelWrap = box.querySelector(".hk-modal__wrap");
    let openEl = null, lastFocus = null;
    const hide = () => {
      if (!openEl) return;
      const c = openEl; openEl = null; lock(false);
      gsap.to(box, { autoAlpha: 0, duration: reduce ? 0 : 0.4, ease: "power2.out", onComplete: () => { gsap.set(box, { display: "none" }); gsap.set(c, { display: "none" }); lastFocus && lastFocus.focus({ preventScroll: true }); } });
    };
    // Every person has the same type, so build it once on first open in a single frame — role and name are copied from the clicked card.
    const make = (id, trigger) => {
      const tpl = box.querySelector(".hk-people-tpl"), body = box.querySelector(".hk-modal__body");
      if (!tpl || !body) return null;
      const c = tpl.content.firstElementChild.cloneNode(true);
      c.id = id;
      [["pos", ".hk-people__pos"], ["name", ".hk-people__name"]].forEach(([k, sel]) => { const from = trigger.querySelector(`.hk-card__${k}`); if (from) c.querySelector(sel).textContent = from.textContent; });
      body.append(c);
      return c;
    };
    const show = (id, trigger) => {
      const c = box.querySelector(`#${id}`) || make(id, trigger);
      if (!c) return;
      lastFocus = trigger; openEl = c; lock(true);
      box.querySelectorAll(".hk-people").forEach((p) => gsap.set(p, { display: "none" }));
      gsap.set([box, c], { display: "block", autoAlpha: 0 });
      panelWrap.scrollTop = 0;
      gsap.to([box, c], { autoAlpha: 1, duration: reduce ? 0 : 0.4, ease: "power2.out" });
      box.querySelector(".hk-modal__close").focus({ preventScroll: true });
    };
    const onClick = (e) => { const t = e.target.closest("[data-modal-trigger]"); if (t) { e.preventDefault(); show(t.getAttribute("data-modal-id"), t); } };
    const onBox = (e) => { if (e.target.closest(".hk-modal__close") || !e.target.closest(".hk-modal__panel")) hide(); };
    const onKey = (e) => { if (e.key === "Escape") hide(); };
    root.addEventListener("click", onClick); box.addEventListener("click", onBox); addEventListener("keydown", onKey);
    return () => { hide(); root.removeEventListener("click", onClick); box.removeEventListener("click", onBox); removeEventListener("keydown", onKey); };
  };

  const accordion = (root) => {
    const onClick = (e) => {
      const btn = e.target.closest("[data-accordion-trigger]");
      if (!btn || !root.contains(btn)) return;
      const item = btn.closest("[data-accordion]"), body = item && item.querySelector("[data-accordion-body]");
      if (!body) return;
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      gsap.killTweensOf(body);
      if (open) {
        gsap.set(body, { display: "block", height: 0, overflow: "hidden", opacity: 0 });
        gsap.to(body, { height: "auto", duration: reduce ? 0 : 0.25, onComplete: () => { body.style.removeProperty("overflow"); body.style.removeProperty("height"); gsap.to(body, { delay: 0.05, opacity: 1, duration: reduce ? 0 : 0.3 }); } });
      } else {
        gsap.set(body, { overflow: "hidden" });
        gsap.to(body, { height: 0, duration: reduce ? 0 : 0.2, onComplete: () => { body.style.removeProperty("overflow"); body.style.removeProperty("height"); gsap.set(body, { display: "none" }); } });
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  };

  const entryBtn = (root) => {
    const btn = root.querySelector(".js-entry-btn");
    if (!btn) return () => {};
    const target = root.querySelector(".js-entry-target");
    gsap.set(btn, { autoAlpha: 0 });
    const t = ScrollTrigger.create({
      trigger: target || document.documentElement, start: target ? "center bottom" : "+=500",
      onEnter: () => gsap.to(btn, { duration: 0.6, ease: "power3.out", autoAlpha: 1 }),
      onLeaveBack: () => gsap.to(btn, { duration: 0.6, ease: "power3.out", autoAlpha: 0 }),
    });
    return () => t.kill();
  };

  const anchors = (root) => {
    const onClick = (e) => {
      const a = e.target.closest(".js-anchor");
      if (!a) return;
      const target = document.querySelector(a.getAttribute("href").replace(/^[^#]*/, ""));
      if (!target) return;
      e.preventDefault();
      gsap.to("html, body", { duration: reduce ? 0 : 0.7, ease: "power3.out", scrollTop: target.getBoundingClientRect().top + scrollY - 20 });
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  };

  const mark = (root) => {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".hk-menu__main-link, .hk-footer__main a").forEach((a) => {
      if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  };

  const mount = (root) => {
    offs.forEach((f) => f()); offs = [];
    const page = root.getAttribute("data-page");
    root.querySelectorAll("[data-mv-fx]").forEach((el) => el.setAttribute("data-fx", el.getAttribute("data-mv-fx")));
    offs.push(header(root), reveal(root), sliders(root), modal(root), accordion(root), entryBtn(root), anchors(root));
    if (pages[page]) offs.push(pages[page](root) || (() => {}));
    mark(root);
    ScrollTrigger.refresh();
  };

  let menuApi = null;
  const boot = async () => {
    menuApi = menu();
    await splash();
    const root = document.querySelector("#hk-swap");
    mount(root);
    const cover = document.querySelector("[data-fx~='slant-rise-page']");
    if (!window.Swup || !cover) return;
    const send = (name) => new Promise((done) => cover.dispatchEvent(new CustomEvent(name, { detail: { done } })));
    const swup = (HK.swup = new Swup({ containers: ["#hk-swap"], animationSelector: false, linkSelector: 'a[href]:not([target]):not([href^="#"])' }));
    swup.hooks.replace("animation:out:await", async () => { menuApi.close(); await send("fx:cover"); });
    swup.hooks.replace("animation:in:await", async () => { await send("fx:uncover"); });
    swup.hooks.before("content:replace", () => { offs.forEach((f) => f()); offs = []; });
    swup.hooks.on("page:view", () => mount(document.querySelector("#hk-swap")));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
