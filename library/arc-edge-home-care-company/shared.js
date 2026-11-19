// Shared by all pages — draws in the header bar, drawer, loader curtain, cursor, contact section and footer, and hooks up Lenis, Barba transition, header bar color change, scroll reveal and folding.
// Original libraries as is: Barba 2.9.7 (sync) · Lenis 1.0.10 (Chrome lerp 0 = 1s curve, Safari lerp .8) · micromodal drawer · splide 4.1.4.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("fnCurrent", ".53,.23,.15,.99");
  CustomEase.create("fnNext", ".71,.08,.17,1.02");
  const FN = (window.FN = { parts: [] });
  FN.page = (ns, part) => FN.parts.push({ ns, ...part });

  // ───── Draw-in ─────
  const MENU = [
    { href: "about.html", label: "Our Thoughts" },
    { href: "service.html", label: "Business details" },
    { href: "index.html#company", label: "Company info" },
    { href: "recruit.html", label: "Recruiting site", ext: true },
  ];
  const ROLL = 'data-fx="char-roll" data-fx-char-roll="mode: once; stagger: 0; frames: 0; dur: .4; ease: 0.115,0.405,0.24,1; lead: .5; gap: 5%"';
  const logo = (cls = "") => `<span class="fn-logo ${cls}" data-label="Brand wordmark (lowercase sans-serif · gradient in a single stroke)"><span>br</span><i></i><span>nd</span></span>`;
  const ICON = {
    insta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.8-.1-4-1.4-4.1-4.1-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.1 4.1-.1ZM12 2c-2.7 0-3.1 0-4.1.1C4.2 2.2 2.2 4.2 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.1 3.7 2.2 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.1 5.7-2.2 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-3.7-2.1-5.7-5.8-5.8C15.1 2 14.7 2 12 2Z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 2h-3.3v13.4a2.8 2.8 0 1 1-2-2.7V9.3a6.1 6.1 0 1 0 5.3 6.1V8.6a7.7 7.7 0 0 0 4.4 1.4V6.7a4.4 4.4 0 0 1-4.4-4.4V2Z"/></svg>',
    bubble: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8.1-6C21.3 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8Z"/></svg>',
  };
  const sns = (line) => `<div class="fn-sns">${line ? `<a class="fn-line-btn" href="#">${ICON.bubble}<span>Add Friend</span></a>` : ""}<a href="#" aria-label="SNS 1">${ICON.insta}</a><a href="#" aria-label="SNS 2">${ICON.tiktok}</a></div>`;
  const navCols = (cls, item) => `
    <div class="fn-grid gap-20">
      <div class="lg-4 md-3"><ul>
        ${["about.html|Our philosophy", "service.html|Our Services", "index.html#contact|Contact us", "news.html|Notice", "index.html#blog|Blog"].map((s) => { const [h, l] = s.split("|"); return `<li class="${cls}__li"><a href="${h}" class="${cls}__link" ${item} ${ROLL}><span data-fx-part="text">${l}</span></a></li>`; }).join("")}
      </ul></div>
      <div class="lg-4 md-3"><ul><li class="${cls}__li"><a href="index.html#company" class="${cls}__link" ${item} ${ROLL}><span data-fx-part="text">Company info</span></a>
        <ul class="${cls}__child">${["Message from the CEO", "Staff Introduction", "Company overview", "History"].map((l) => `<li><a href="index.html#company" ${item}>${l}</a></li>`).join("")}</ul></li></ul></div>
      <div class="lg-4 md-3"><ul><li class="${cls}__li"><a href="recruit.html" class="${cls}__link fn-ext" ${item} ${ROLL}><span data-fx-part="text">Recruiting site</span></a>
        <ul class="${cls}__child">${["Message", "Cross Talk", "View in numbers", "Application guidelines", "Apply"].map((l) => `<li><a href="recruit.html" ${item}>${l}</a></li>`).join("")}</ul></li></ul></div>
    </div>`;

  function chrome() {
    const intro = document.querySelector('[data-slot="intro"]');
    if (intro && !intro.children.length) intro.innerHTML = '<div class="fn-intro__first" data-fx-part="first"></div><div class="fn-intro__second" data-fx-part="second"></div>';
    const head = document.querySelector('[data-slot="header"]');
    if (head) head.innerHTML = `
      <div class="fn-header__wrap">
        <a href="index.html" class="fn-header__logo" aria-label="First Page">${logo()}</a>
        <nav class="fn-gnav"><ul class="fn-gnav__ul">${MENU.map((m) => `<li class="fn-gnav__li"><a href="${m.href}" class="fn-gnav__link${m.ext ? " fn-ext" : ""}" ${ROLL}><span data-fx-part="text">${m.label}</span></a></li>`).join("")}</ul></nav>
        <div class="fn-header__contact"><a href="index.html#contact" class="fn-contact-btn" ${ROLL}><span data-fx-part="text">Contact Us</span></a></div>
        <div class="fn-header__burger"><button class="fn-burger" type="button" data-burger aria-expanded="false" aria-controls="fn-drawer" ${ROLL}><span data-fx-part="text">Menu</span></button></div>
      </div>`;
    const drawer = document.querySelector('[data-slot="drawer"]');
    if (drawer) drawer.innerHTML = `
      <div class="fn-drawer__bg" tabindex="-1"></div>
      <div class="fn-drawer__box" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Menu">
        <div class="fn-drawer__wrap">
          <header class="fn-drawer__head">
            <a href="index.html" class="fn-drawer__logo" data-drawer-item data-drawer-close>${logo()}</a>
            <div class="fn-drawer__contact"><a href="index.html#contact" data-drawer-item data-drawer-close>Contact Us</a></div>
            <button class="fn-burger" type="button" data-burger data-drawer-burger aria-expanded="true">Close</button>
          </header>
          <div class="fn-drawer__content">
            <div class="fn-grid gap-20"><div class="lg-start-7 lg-6"><nav class="fn-drawer__nav">${navCols("fn-drawer", "data-drawer-item data-drawer-close")}</nav></div></div>
            <div class="fn-drawer__bottom" data-drawer-item><a href="#" class="fn-ext">Privacy policy</a>${sns(true)}</div>
          </div>
        </div>
      </div>`;
    const st = document.querySelector('[data-slot="stalker"]');
    if (st) st.innerHTML = '<span data-fx-part="cursor"></span><span data-fx-part="follower"></span>';
  }

  // For each body (Barba container) — the contact section · footer
  function fillBox(box) {
    const aside = box.querySelector('[data-slot="aside-contact"]');
    if (aside && !aside.children.length) aside.innerHTML = `
      <div class="fn-aside__wrap" id="contact">
        <div class="fn-container"><div class="fn-aside__inner">
          <h2 class="fn-title is-white" data-st="blur"><span class="fn-title__bar"></span>Contact Us</h2>
          <a class="fn-aside__link" href="index.html#contact" ${ROLL}><span class="fn-aside__text" data-fx-part="text">Contact us here</span><span class="fn-aside__icon" aria-hidden="true">:-)</span></a>
          <div class="fn-aside__body">
            <div class="fn-aside__line fn-sns"><a class="fn-line-btn" href="#">${ICON.bubble}<span>Add Friend</span></a></div>
            <div class="fn-aside__sns">${sns(false)}</div>
            <p class="fn-aside__para">Your contact method notice goes here, in two lines. We accept phone, contact form and adding us as a messenger friend.<br>Or reach out through any of our social messages.<br><a class="fn-tel" href="#">Tel : 000-000-0000</a></p>
          </div>
        </div></div>
        <div class="fn-aside__circle" data-fx="arc-widen-scroll" data-fx-arc-widen-scroll="to: 400; start: top bottom; end: top+=200 top; up: 2"><div class="fn-aside__bg"></div></div>
      </div>`;
    const foot = box.querySelector('[data-slot="footer"]');
    if (foot && !foot.children.length) foot.innerHTML = `
      <div class="fn-footer__wrap"><div class="fn-footer__content">
        <div class="fn-grid gap-20">
          <div class="lg-6"><a href="index.html" class="fn-footer__logo" aria-label="First Page">${logo()}</a></div>
          <div class="lg-6 fn-footer__nav-wrap"><nav class="fn-footer__nav">${navCols("fn-footer", "")}</nav></div>
        </div>
        <div class="fn-grid gap-20 fn-footer__company">
          ${[["Company name", "Your branch name 01 here"], ["Your branch name 02 here"], ["Your branch name 03 · Satellite office here"]].map((names, i) => `
          <div class="lg-4"><address class="fn-footer__addr">${names.map((n) => `<div class="fn-footer__name">${n}</div>`).join("")}
            <a href="#" class="fn-footer__map">〒000-0000 Your address goes here on one line 0-0</a>${i < 2 ? '<br><a href="#" class="fn-tel">Tel : 000-000-0000</a><br><a href="#" class="fn-tel">Fax : 000-000-0000</a>' : ""}</address></div>`).join("")}
        </div>
        <div class="fn-footer__middle"><a href="#" class="fn-ext">Privacy policy</a></div>
        <div class="fn-footer__bottom"><div class="fn-footer__copy">© 0000 brand</div>${sns(false)}</div>
      </div></div>`;
  }

  chrome();

  // ───── Lenis — original xE: Chrome uses lerp 0 (so Lenis pushes with a 1s expo curve), only Safari uses lerp .8 ─────
  let lenis = null;
  const LenisCtor = window.Lenis || window.lenis;
  if (!reduce && LenisCtor) {
    const ua = navigator.userAgent.toLowerCase();
    const brands = navigator.userAgentData?.brands;
    const safari = brands?.length ? brands.some((b) => b.brand === "Safari") : ua.includes("safari") && !ua.includes("chrome");
    lenis = new LenisCtor({ lerp: safari ? 0.8 : 0, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  FN.lenis = lenis;
  const headH = () => document.querySelector("[data-header]")?.clientHeight || 75;
  FN.scrollTo = (target, immediate) => {
    if (lenis) lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -headH(), immediate: !!immediate, duration: 1 });
    else if (typeof target === "number") scrollTo(0, target);
    else scrollTo(0, target.getBoundingClientRect().top + scrollY - headH());
  };

  // ───── Header bar: past [data-not-top] a blur panel, over [data-dark] white text — original Header(IS) ─────
  const header = document.querySelector("[data-header]");
  const drawerEl = document.querySelector("[data-drawer]");
  let headTriggers = [];
  function headStates(box) {
    headTriggers.forEach((t) => t.kill());
    headTriggers = [];
    if (!header) return;
    const tog = (cls, on) => { header.classList.toggle(cls, on); drawerEl?.classList.toggle(cls, on); };
    tog("is-not-top", false);
    tog("is-dark", false);
    const nt = box.querySelector("[data-not-top]");
    if (nt) headTriggers.push(ScrollTrigger.create({
      trigger: nt, start: () => `-${header.clientHeight}px top`, endTrigger: document.body, end: "bottom bottom",
      onToggle: (s) => tog("is-not-top", s.isActive),
    }));
    box.querySelectorAll("[data-dark]").forEach((d) => headTriggers.push(ScrollTrigger.create({
      trigger: d, start: () => `-${header.clientHeight}px top`, end: () => `bottom ${header.clientHeight}px`,
      onToggle: (s) => { if (s.isActive) tog("is-dark", true); else if (!headTriggers.some((t) => t !== s && t.isActive && t.trigger.hasAttribute("data-dark"))) tog("is-dark", false); },
    })));
  }

  // ───── Drawer — micromodal (original Ph.show). On open, aria-expanded after .2s, the close button comes down .3s and turns on, items follow after .3s with .04 stagger ─────
  let opened = false;
  const burgers = () => document.querySelectorAll("[data-burger]");
  const expanded = (v) => burgers().forEach((b) => b.setAttribute("aria-expanded", String(v)));
  function openDrawer() {
    if (!drawerEl || opened || !window.MicroModal) return;
    gsap.set(drawerEl.querySelector(".fn-drawer__box"), { opacity: 0 });
    gsap.set(drawerEl.querySelector(".fn-drawer__content"), { opacity: 0 });
    MicroModal.show(drawerEl.id, {
      disableScroll: true, disableFocus: true, awaitOpenAnimation: true, awaitCloseAnimation: true,
      onShow: () => {
        opened = true;
        lenis?.stop();
        gsap.set([drawerEl.querySelector(".fn-drawer__box"), drawerEl.querySelector(".fn-drawer__content")], { clearProps: "opacity" });
        setTimeout(() => expanded(true), 200);
        gsap.fromTo("[data-drawer-burger]", { opacity: 0, y: -20 }, { opacity: 1, y: 0, ease: "power1.out", duration: 0.3 });
        gsap.fromTo(drawerEl.querySelectorAll("[data-drawer-item]"), { opacity: 0, y: 0 }, { opacity: 1, y: 0, delay: 0.3, duration: 0.6, ease: "power1.out", stagger: { each: 0.04 } });
        drawerEl.querySelector(".fn-drawer__box").scrollTop = 0;
      },
      onClose: () => { opened = false; expanded(false); lenis?.start(); },
    });
  }
  const closeDrawer = () => { if (opened && window.MicroModal) MicroModal.close(drawerEl.id); };
  FN.closeDrawer = closeDrawer;
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-burger]")) { e.preventDefault(); opened ? closeDrawer() : openDrawer(); return; }
    if (e.target.closest("[data-drawer-close]")) closeDrawer();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  // ───── Scroll reveal — original ScrollTrigger (mE): once :visible 20% before the screen bottom, text split at .03 intervals for .5s ─────
  function reveal(box) {
    box.querySelectorAll('[data-st="text"]').forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      el.setAttribute("aria-label", el.textContent.trim());
      el.innerHTML = [...el.textContent.trim()].map((c) => `<span class="fn-ch" aria-hidden="true">${c === " " ? "&#32;" : c}</span>`).join("");
    });
    const items = box.querySelectorAll("[data-st]");
    if (reduce) { items.forEach((el) => el.classList.add("is-visible")); return () => {}; }
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      if (el.dataset.st === "text") {
        gsap.fromTo(el.querySelectorAll(".fn-ch"), { y: el.dataset.y || "100%", opacity: +(el.dataset.opacity ?? 1) }, {
          y: 0, opacity: 1, ease: "power1.inOut", duration: +(el.dataset.duration || 0.5), delay: +(el.dataset.delay || 0),
          stagger: { each: +(el.dataset.each || 0.03) }, onComplete: () => el.classList.add("is-visible"),
        });
      } else setTimeout(() => el.classList.add("is-visible"), +(el.dataset.delay || 0) * 1000);
    }), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }

  // ───── Collapse — original Accordion(sE): height 0 ↔ auto .3s expo.out, ScrollTrigger.refresh after closing ─────
  function accordions(box) {
    box.querySelectorAll("[data-acc]").forEach((acc) => {
      acc.querySelectorAll("details").forEach((d) => {
        const sum = d.querySelector("summary"), body = d.querySelector("[data-acc-body]");
        if (!sum || !body || sum.dataset.bound) return;
        sum.dataset.bound = "1";
        sum.addEventListener("click", (e) => {
          e.preventDefault();
          const dur = reduce ? 0 : +(acc.dataset.duration || 0.3);
          if (d.hasAttribute("open")) {
            sum.classList.remove("is-active");
            body.classList.remove("is-active");
            gsap.to(body, { height: 0, duration: dur, ease: "expo.out", onComplete: () => { d.removeAttribute("open"); ScrollTrigger.refresh(); } });
          } else {
            sum.classList.add("is-active");
            body.classList.add("is-active");
            body.style.height = 0;
            d.setAttribute("open", "");
            gsap.to(body, { height: "auto", duration: dur, ease: "expo.out" });
          }
        });
      });
    });
  }

  // ───── Attach and detach one body ─────
  let cleanups = [];
  const boxEl = () => document.querySelector('[data-barba="container"]');
  const run = (box, key, ...args) => FN.parts.filter((p) => p[key] && (p.ns === "*" || p.ns === box.dataset.barbaNamespace)).map((p) => p[key](box, ...args));
  function mount(box, first) {
    document.body.dataset.page = box.dataset.barbaNamespace;
    fillBox(box);
    headStates(box);
    accordions(box);
    cleanups = [reveal(box), ...run(box, "ready", first)].filter((f) => typeof f === "function");
    ScrollTrigger.refresh();
  }
  const unmount = () => {
    cleanups.splice(0).forEach((f) => f());
    headTriggers.forEach((t) => t.kill());
    headTriggers = [];
  };

  // In-page navigation (#) — scrolls less by the header height (original SmoothScroll · initialScroll)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented) return;
    // Placeholder links (#) are phone or external link spots in the original — keep them from jumping to the top
    if (a.getAttribute("href") === "#") { e.preventDefault(); return; }
    const [path, hash] = a.getAttribute("href").split("#");
    const here = location.pathname.split("/").pop() || "index.html";
    if (!hash || (path && path !== here)) return;
    const t = document.getElementById(hash);
    if (!t) return;
    e.preventDefault();
    FN.scrollTo(t);
  });
  const jumpHash = () => {
    if (!location.hash) return;
    const t = document.getElementById(location.hash.slice(1));
    if (t) setTimeout(() => FN.scrollTo(t), 300);
  };

  // ───── First open: loader curtain (sheet-lift-intro) — on the first page the top curtain lifts, on subpages it fades ─────
  const intro = document.querySelector("[data-intro]");
  const box0 = boxEl();
  history.scrollRestoration = "manual";
  if (intro) {
    if (reduce) intro.style.display = "none";
    else {
      intro.dataset.fxSheetLiftIntro = box0.dataset.barbaNamespace === "home" ? "look: lift" : "look: fade";
      intro.dataset.fx = "sheet-lift-intro";
    }
  }
  // The page script (pages.js) loads after this file, so attach after the document is fully built
  const start = () => {
    mount(box0, true);
    jumpHash();
    barbaInit();
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : setTimeout(start);

  // ───── Barba — original eE(sync): on leaving, spread the curtain out (invisible), after entering, turn on the upper curtain and lift it over .4s after .8s.
  // The new body settles into place with fnNext over 1s after .6s (values match the original so there is no movement) — hide the cover when done ─────
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "") && !/^recruit\.html/.test(href);
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    return Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
      const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
      l.onload = l.onerror = res;
      document.head.append(l);
    })));
  };
  function barbaInit() {
  if (window.barba && /^https?:$/.test(location.protocol)) {
    const first = intro?.querySelector('[data-fx-part="first"]');
    barba.init({
      timeout: 10000,
      preventRunning: true,
      prevent: ({ el }) => !el || el.tagName !== "A" || !own(el.getAttribute("href")) || /#/.test(el.getAttribute("href")) && el.getAttribute("href").split("#")[0] === (location.pathname.split("/").pop() || "index.html"),
      transitions: [{
        sync: true,
        leave: ({ trigger }) => {
          closeDrawer();
          if (trigger !== "back" && trigger !== "forward" && intro) intro.style.display = "block";
        },
        beforeEnter: async ({ next }) => { unmount(); await sheets(next.html); },
        enter: () => {},
        after: ({ trigger, current, next }) => new Promise((res) => {
          const turn = trigger === "back" || trigger === "forward";
          if (current?.container?.isConnected) current.container.remove();
          if (lenis) lenis.scrollTo(0); else scrollTo(0, 0);
          mount(next.container, false);
          jumpHash();
          if (turn || reduce || !intro) { if (intro) intro.style.display = "none"; return res(); }
          intro.style.display = "block";
          gsap.set(first, { opacity: 1, yPercent: 0 });
          gsap.to(first, { opacity: 0, delay: 0.8, duration: 0.4 });
          gsap.to(next.container, {
            delay: 0.6, y: 0, opacity: 1, duration: 1, ease: "fnNext",
            onComplete: () => { gsap.set(next.container, { clearProps: "all" }); intro.style.display = "none"; res(); },
          });
        }),
      }],
    });
  }
  }
})();
