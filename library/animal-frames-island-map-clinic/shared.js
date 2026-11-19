/* Shared across several pages — smooth scroll (Lenis 1.0.18, wide screens only)·page transition (barba 2.9.7)·header menu·phone drawer·fixed booking button·accordion·video curtain.
   The original motion runs on Velocity 1.2.2, so the same Bézier values are rebuilt with CustomEase and used in GSAP. */
(() => {
  const BP = 1023;
  const isPc = () => innerWidth > BP;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(CustomEase);
  const E = {};
  [
    ["inQuad", "0.55,0.085,0.68,0.53"], ["outQuad", "0.25,0.46,0.45,0.94"], ["inCubic", "0.55,0.055,0.675,0.19"],
    ["outCubic", "0.215,0.61,0.355,1"], ["inOutCubic", "0.645,0.045,0.355,1"], ["inQuart", "0.895,0.03,0.685,0.22"],
    ["outQuart", "0.165,0.84,0.44,1"], ["inOutQuart", "0.76,0,0.24,1"], ["inSine", "0.47,0,0.745,0.715"],
    ["outSine", "0.39,0.575,0.565,1"], ["inOutSine", "0.445,0.05,0.55,0.95"], ["inOutQuint", "0.86,0,0.07,1"],
  ].forEach(([k, v]) => (E[k] = CustomEase.create("mk-" + k, v)));
  // Velocity’s "spring" is a damped cosine, not a Bézier
  E.spring = (p) => 1 - Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6);
  E.linear = "none";

  const views = {};
  const MK = (window.MK = { E, isPc, reduce, views, view: (ns, v) => (views[ns] = v), lenis: null, firstTop: true });

  /* Smooth scroll */
  const LenisCtor = window.Lenis || window.lenis;
  if (isPc() && LenisCtor && !reduce) {
    MK.lenis = new LenisCtor({ lerp: 0.2, duration: 0.6 });
    const raf = (t) => { MK.lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollY = () => window.scrollY;
  MK.scrollTo = (y, dur = 0, ease = E.inOutCubic) => {
    if (MK.lenis && dur > 0) return MK.lenis.scrollTo(y, { duration: dur, easing: (t) => (typeof ease === "function" ? ease(t) : gsap.parseEase(ease)(t)) });
    if (dur > 0) { const o = { y: scrollY() }; return gsap.to(o, { y, duration: dur, ease, onUpdate: () => scrollTo(0, o.y) }); }
    if (MK.lenis) MK.lenis.scrollTo(y, { immediate: true, force: true });
    scrollTo(0, y);
  };
  let lockY = 0;
  MK.lock = () => { lockY = scrollY(); document.body.classList.add("noscroll"); document.body.style.top = -lockY + "px"; MK.lenis?.stop(); };
  MK.unlock = () => { document.body.classList.remove("noscroll"); document.body.style.top = "0px"; scrollTo(0, lockY); MK.lenis?.start(); };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const loading = () => $("#loading");
  const fadeTo = (els, opacity, duration, delay, ease, extra = {}) => { const t = [].concat(els).filter(Boolean); if (t.length) return gsap.to(t, { opacity, duration, delay, ease, overwrite: "auto", ...extra }); };
  const showLoading = (delay) => { const l = loading(); if (!l) return; gsap.set(l, { display: "block" }); fadeTo(l, 1, 0.15, delay, "none"); };
  const hideLoading = (delay) => { const l = loading(); if (l) fadeTo(l, 0, 0.15, delay, "none", { onComplete: () => gsap.set(l, { display: "none" }) }); };
  MK.hideLoading = hideLoading;

  /* Current spot in header menu */
  const markNav = (ns) => {
    const id = { news: "gnav-news", about: "gnav-about", service: "gnav-case" }[ns];
    $$(".gnav > ul > li").forEach((li) => li.classList.toggle("current", !!id && li.id === id));
  };

  /* Fixed booking button — hides when the footer shows, and on the first page and About it appears only after scrolling down 200px (phone 35px) */
  let fixOff = null;
  const fixButton = (c) => {
    fixOff?.();
    const btn = $(".btn-fix-appointment", c);
    if (!btn) return;
    const hold = ["top", "about"].includes(nsOf(c));
    const on = () => {
      const y = scrollY(), wh = innerHeight, foot = $("footer", c);
      if (foot) {
        const top = foot.getBoundingClientRect().top + y, h = foot.offsetHeight, mt = parseInt(getComputedStyle(foot).marginTop) || 0;
        const inFoot = y >= top - wh - mt && y < top + h;
        btn.classList.toggle("hidden", isPc() ? inFoot : false);
      }
      if (hold) btn.classList.toggle("active", y >= (isPc() ? 200 : 35));
    };
    addEventListener("scroll", on, { passive: true });
    on();
    fixOff = () => removeEventListener("scroll", on);
  };

  /* Phone bottom tab bar — turned off when the drawer is open, during transitions, and once scrolled down to 100px above the footer (original .bg-tab-bars) */
  const tabBar = (on) => $(".bg-tab-bars")?.classList.toggle("active", !!on && !isPc());
  addEventListener("scroll", () => {
    if (isPc() || document.body.classList.contains("noscroll") || btnNav()?.classList.contains("active")) return;
    const foot = $("footer", current || document);
    if (foot) tabBar(foot.getBoundingClientRect().top > 100);
  }, { passive: true });

  /* Phone drawer */
  const btnNav = () => $(".btn-nav");
  const navSp = () => $(".nav-sp");
  const navClose = () => {
    btnNav()?.classList.remove("active");
    const n = navSp(); if (!n) return;
    gsap.killTweensOf([n, $(".inner", n)]);
    gsap.to($(".inner", n), { opacity: 0, duration: 0.05, ease: E.outCubic, onComplete: () => { $(".inner", n).scrollTop = 0; } });
    gsap.to(n, { opacity: 0, duration: 0.15, delay: 0.05, ease: "none", onComplete: () => { gsap.set(n, { display: "none" }); tabBar(true); } });
    if (document.body.classList.contains("noscroll")) MK.unlock();
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".btn-nav");
    if (!b) return;
    const n = navSp(); if (!n) return;
    b.classList.toggle("active");
    if (b.classList.contains("active")) {
      gsap.killTweensOf([n, $(".inner", n)]);
      gsap.set(n, { display: "block" });
      gsap.to(n, { opacity: 1, duration: 0.1, ease: "none" });
      // Original Velocity.hook applies 15px at the end of the wait — at the press moment it stays as is, then after .1s it rises from below
      gsap.fromTo($(".inner", n), { y: 15 }, { opacity: 1, y: 0, duration: 0.3, delay: 0.1, ease: E.outCubic, immediateRender: false });
      MK.lock();
      tabBar(false);
    } else navClose();
  });

  /* Accordion — opens in .3s easeInOutCubic, closes in .3s easeOutQuart (Velocity slideDown/Up) */
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".btn-ac");
    if (!b) return;
    const panel = b.classList.contains("btn-ac-faq") ? b.parentElement.nextElementSibling : b.nextElementSibling;
    if (!panel) return;
    const open = getComputedStyle(panel).display === "none";
    gsap.killTweensOf(panel);
    if (open) {
      gsap.set(panel, { display: "block", height: "auto" });
      gsap.from(panel, { height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.3, ease: E.inOutCubic, clearProps: "height,paddingTop,paddingBottom", overflow: "hidden" });
      b.classList.add("active");
    } else {
      gsap.to(panel, { height: 0, paddingTop: 0, paddingBottom: 0, duration: 0.3, ease: E.outQuart, overflow: "hidden", onComplete: () => gsap.set(panel, { display: "none", clearProps: "height,paddingTop,paddingBottom,overflow" }) });
      b.classList.remove("active");
    }
  });

  /* Video overlay: opens right on click, closes when clicking outside */
  document.addEventListener("click", (e) => {
    const open = e.target.closest(".about-movie");
    const modal = $(".modal-movie");
    if (open && modal) { MK.lock(); modal.classList.add("active"); return; }
    if (modal?.classList.contains("active") && e.target.closest(".modal-movie") && !e.target.closest(".modal-movie .video-wrap")) {
      modal.classList.remove("active"); MK.unlock();
    }
  });

  /* Wide screen · phone panel display */
  const wrapClass = () => { const w = $("#wrap"); if (w) { w.classList.toggle("pc", isPc()); w.classList.toggle("sp", !isPc()); } };
  addEventListener("resize", wrapClass);

  const nsOf = (c) => c?.dataset.barbaNamespace || "page";
  let current = null;

  /* Runs first on every page — original common() */
  const common = (c) => {
    const ns = nsOf(c);
    document.body.className = ns === "top" ? "top" : ns;
    markNav(ns);
    fixButton(c);
    window.MKArt?.fill(c);
    if (!isPc() && ns !== "top") btnNav()?.classList.add("visible");
    if (!isPc() && ns === "top") btnNav()?.classList.remove("visible");
  };

  /* Original pageReady — header, body and footer come in over .45s after a .3s delay */
  const pageReady = (c) => {
    const ns = nsOf(c);
    const head = $("header");
    tabBar(true);
    if (reduce) { gsap.set([head, $(".contents", c), $("footer", c)].filter(Boolean), { opacity: 1 }); hideLoading(0); return; }
    if (ns !== "top" && head && getComputedStyle(head).opacity !== "1") fadeTo(head, 1, 0.45, 0.3, E.outQuad);
    hideLoading(0.15);
    if (ns !== "top") fadeTo($(".contents", c), 1, 0.45, 0.3, E.outQuad);
    fadeTo($("footer", c), 1, 0.45, 0.3, E.outQuad);
  };

  const enter = (c, first) => {
    current = c;
    common(c);
    views[nsOf(c)]?.enter?.(c, { first });
  };

  /* Preloads the css and js the next page uses before navigating — the original is one css bundle, but this copy splits it per page */
  const loadAssets = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const have = (sel, attr, v) => $$(sel).some((n) => n.getAttribute(attr) === v);
    const css = $$('link[rel="stylesheet"]', doc).map((l) => l.getAttribute("href")).filter((h) => !have('link[rel="stylesheet"]', "href", h));
    const js = $$("script[src]", doc).map((s) => s.getAttribute("src")).filter((s) => !have("script[src]", "src", s));
    await Promise.all(css.map((h) => new Promise((r) => { const n = document.createElement("link"); n.rel = "stylesheet"; n.href = h; n.onload = n.onerror = r; document.head.append(n); })));
    for (const s of js) await new Promise((r) => { const n = document.createElement("script"); n.src = s; n.onload = n.onerror = r; document.body.append(n); });
  };

  const boot = () => {
    wrapClass();
    const c = $('[data-barba="container"]');
    // Original pageReadyFirstOnly — the Hero ring appears at .15s
    if (nsOf(c) !== "top") { gsap.set([$(".contents", c), $("footer", c)].filter(Boolean), { opacity: 0 }); showLoading(0); }
    else gsap.set($("footer", c), { opacity: 0 });
    enter(c, true);
    const ready = () => pageReady(c);
    if (document.readyState === "complete") ready(); else addEventListener("load", ready, { once: true });

    if (!window.barba || location.protocol === "file:") return;
    let scrollAt = 0;
    barba.init({
      timeout: 10000,
      prevent: ({ el, href }) => !!el && el.tagName === "A" && /\.(pdf|jpg|jpeg|png|webp|svg|zip)(\?.*)?$/i.test(href || ""),
      transitions: [{
        name: "default-transition",
        before(data) {
          const from = nsOf(data.current.container), to = nsOf(data.next.container) || "";
          const nextNs = (data.next.url.path || "").match(/(\w+)\.html$/)?.[1];
          const nextIs = { index: "top", about: "about", service: "service" }[nextNs];
          document.getElementById("wrap")?.classList.add("transition");
          scrollAt = scrollY();
          if (nextIs || from === "top" || from === "about") fadeTo($("header"), 0, 0.2, 0, E.outQuad);
          views[from]?.leave?.(data.current.container);
          fixOff?.();
          const out = [$(".contents", data.current.container), $("footer", data.current.container)];
          if (data.trigger === "back" || data.trigger === "forward") fadeTo(out, 0, 0.2, 0, E.outQuad);
          else fadeTo(out, 0, 0.2, 0, E.outQuad, {
            onComplete: () => {
              if ((isPc() && scrollAt > 400) || (!isPc() && scrollAt > 200)) {
                gsap.killTweensOf($("header")); gsap.set($("header"), { opacity: 0 });
                gsap.delayedCall(0.05, () => MK.scrollTo(0));
              } else MK.scrollTo(0, 0.6, E.inOutCubic);
            },
          });
          showLoading(0.2);
          if (btnNav()?.classList.contains("active")) navClose();
          btnNav()?.classList.remove("white");
          tabBar(false);
          void to;
        },
        // barba 2.9 doesn’t count a transition without leave·enter as a page transition and refreshes — so leave empty hooks like the original
        leave() {},
        async afterLeave(data) {
          await Promise.all([new Promise((r) => setTimeout(r, 600)), loadAssets(data.next.html)]);
        },
        async beforeEnter(data) {
          const c2 = data.next.container;
          gsap.set([$(".contents", c2), $("footer", c2)].filter(Boolean), { opacity: 0 });
          await loadAssets(data.next.html);
        },
        enter() {},
        after(data) {
          const c2 = data.next.container;
          gsap.set([$(".contents", c2), $("footer", c2)].filter(Boolean), { opacity: 0 });
          enter(c2, false);
          document.querySelector("header")?.classList.toggle("btm", nsOf(c2) === "top" && isPc());
          pageReady(c2);
          document.getElementById("wrap")?.classList.remove("transition");
          const anchor = location.hash && document.querySelector(location.hash);
          if (anchor) gsap.delayedCall(reduce ? 0 : 0.4, () => MK.scrollTo(anchor.getBoundingClientRect().top + scrollY(), reduce ? 0 : 0.8, E.inOutQuint));
        },
      }],
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
