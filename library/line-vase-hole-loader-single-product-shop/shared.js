// Shared across the Brand site — puts the header bar (index menu · centered title · cart) and the footer (big wordmark) on every page, and handles the loader, header brightness and Lenis (1.3.26, lerp .09).
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("otto", "0.43, 0.195, 0.02, 1");
  CustomEase.create("otto-inout", "0.76, 0, 0.2, 1");

  const flower = `<svg viewBox="0 0 40 40" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<circle cx="${(20 + Math.cos(a) * 10).toFixed(2)}" cy="${(20 + Math.sin(a) * 10).toFixed(2)}" r="7"/>`; }).join("")}<circle cx="20" cy="20" r="9"/></svg>`;
  window.otFlower = flower;
  const menu = `
    <ol><li><span>01</span><a href="detail.html" class="ot-menu__name${page === "detail" ? " is-on" : ""}">Object One</a></li><li class="sub"><a href="detail.html">O. One III</a></li><li class="sub"><a href="detail.html">O. One II</a></li><li class="sub"><a href="detail.html">O. One I</a></li></ol>
    <ol class="is-more"><li><span>02</span><span>Object Two</span></li><li class="sub">O. Two A</li><li class="sub">O. Two B</li><li class="sub">O. Two C</li></ol>
    <ol class="is-more"><li><span>03</span><span>Object Three</span></li><li class="sub">O. Three A</li><li class="sub">O. Three B</li><li class="sub">O. Three C</li></ol>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "ot-head t12";
    head.innerHTML = `
      <span class="ot-head__brand"><a class="ot-head__logo" href="index.html" aria-label="Home"><span class="ot-mark">${flower}</span></a><a class="ot-head__name" href="index.html" data-label="English brand name">NAME</a></span>
      <nav class="ot-head__menu" aria-label="Item">${menu}</nav>
      <div class="ot-head__title" aria-hidden="true"><span class="t50" data-label="Featured item English name">OBJECT ONE</span></div>
      <nav class="ot-head__nav" aria-label="Main menu"><a href="index.html#store"${page === "store" ? ' aria-current="page"' : ""}>Store</a><a href="about.html"${page === "about" ? ' aria-current="page"' : ""}>About</a></nav>
      <a class="ot-head__cart" href="detail.html">Cart ( 0 )</a>
      <button class="ot-head__burger" type="button" aria-expanded="false">Menu</button>`;
    if (page === "about") head.querySelectorAll(".ot-head__menu .is-more").forEach((o) => o.classList.remove("is-more"));
    const drawer = document.createElement("nav");
    drawer.className = "ot-drawer";
    drawer.innerHTML = `<a href="index.html#store">Store</a><a href="about.html">About</a><a href="detail.html">Object One</a><a href="detail.html">Cart ( 0 )</a>`;
    head.after(drawer);
    const burger = head.querySelector(".ot-head__burger");
    burger.addEventListener("click", () => {
      const on = drawer.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(on));
      burger.textContent = on ? "Close" : "Menu";
    });
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "ot-foot t12";
    foot.innerHTML = `
      <div class="ot-foot__top">
        <span class="ot-foot__copy">©0000 Name Objects.</span>
        <nav class="ot-foot__lists">${menu.replace(/ class="is-more"/g, "")}</nav>
        <nav class="ot-foot__nav"><a class="ot-u" href="index.html#store">Store</a><a class="ot-u" href="about.html">About</a></nav>
        <span></span>
        <span class="ot-foot__credit">Designed by <a class="ot-buy ot-foot__studio" href="about.html">Studio</a></span>
      </div>
      <span></span>
      <div class="ot-foot__word" aria-label="English brand name wordmark"><span class="ot-foot__part ot-mark">${flower}</span><b class="ot-foot__part" data-label="English brand name">NAME</b></div>`;
    if (!reduce) {
      const parts = foot.querySelectorAll(".ot-foot__part");
      gsap.set(parts, { yPercent: 60 });
      ScrollTrigger.create({ trigger: foot, start: "top 70%", once: true, onEnter: () => gsap.to(parts, { yPercent: 0, duration: 1.4, ease: "otto", stagger: 0.08 }) });
    }
  }

  // Header-row brightness — [data-tone=paper] when a section’s head sits below the header bar it uses ink-colored text, dark sections (data-tone=ground) uses light text
  const tones = () => [...document.querySelectorAll("[data-tone]")];
  const headEl = document.querySelector(".ot-head");
  const tone = () => {
    if (!headEl) return;
    const y = headEl.offsetHeight * 0.5 + 10;
    let t = document.body.dataset.tone || "ground";
    for (const s of tones()) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) t = s.dataset.tone; }
    headEl.classList.toggle("is-light", t === "paper");
    root.classList.toggle("is-paper", t === "paper");
  };
  addEventListener("scroll", tone, { passive: true });
  addEventListener("resize", tone);
  tone();

  // Smooth scroll — same Lenis 1.3.26 · lerp .09 as the original, driven by the GSAP clock
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.otLenis = lenis;
  }

  // Loader — 0→100% for at least 2.7s, then name and number slide out at -110% (.55s) and a hole opens in 2.3s from the cover cell size
  const pre = document.querySelector(".ot-pre");
  window.otReady = new Promise((done) => {
    if (!pre) return done();
    const count = pre.querySelector(".ot-pre__count .line__in"), name = pre.querySelector(".ot-pre__name .line__in"), mark = pre.querySelector(".ot-pre__mark");
    mark.innerHTML = flower;
    if (reduce) { pre.remove(); return done(); }
    root.classList.add("is-loading");
    lenis?.stop();
    const v = { n: 0 };
    const show = () => (count.textContent = `${String(Math.round(v.n)).padStart(2, "0")}%`);
    const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
    // A page reopened in the same visit skips the number count and opens straight from the cover slot
    let seen = false;
    try { seen = sessionStorage.getItem("ot-seen") === "1"; sessionStorage.setItem("ot-seen", "1"); } catch { /* Storage Blocked */ }
    if (seen) {
      gsap.set([name, count], { opacity: 0 });
      Promise.all([loaded, document.fonts.ready]).then(() => setTimeout(() => open(2.1), 60));
      return;
    }
    const tw = gsap.to(v, { n: 97, duration: 7, ease: "power1.out", onUpdate: show });
    Promise.all([loaded, document.fonts.ready, new Promise((r) => setTimeout(r, 2700))]).then(() => {
      tw.kill();
      gsap.to(v, { n: 100, duration: 0.3, ease: "none", onUpdate: show, onComplete: () => open(2.3) });
    });
    function open(len) {
      const stage = document.querySelector(".hero__stage"), black = document.querySelector(".hero__black");
      const half = mark.getBoundingClientRect().width / 2, far = Math.hypot(innerWidth, innerHeight);
      const h = { t: 0 };
      if (stage) gsap.set(stage, { scale: 1.07 });
      const tl = gsap.timeline({ onComplete: () => { pre.remove(); root.classList.remove("is-loading"); lenis?.start(); } });
      tl.to([name, count], { yPercent: -110, duration: 0.55, ease: "power2.inOut", stagger: 0.04 }, 0)
        .to(mark, { opacity: 0, duration: 0.3, ease: "none" }, 0.2)
        .to(h, { t: 1, duration: len, ease: "power3.inOut", onUpdate: () => pre.style.setProperty("--hole", `${half + h.t * far}px`) }, 0)
        .call(done, [], 1.15);
      if (black) tl.to(black, { opacity: 0, duration: 0.6, ease: "sine.inOut" }, 0.55);
      if (stage) tl.to(stage, { scale: 1, duration: 2.4, ease: "otto" }, 0.6);
    }
  });

  // When going to another page, accepts the press for one beat (80ms) before moving — the original also changes screen a little over .2s after the press
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|https?):/.test(href)) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    setTimeout(() => (location.href = url.href), 80);
  });

  // Value text roll — old and new text stack in one strip and roll half a cell (up if forward). If another arrives mid-roll, only the last one continues after it finishes.
  // The Living, Packing and Flower-arranging gesture cells turn a full loop even with the same text, like the original. Detail values roll differently by size in the original, but the copy uses the same placeholder, so they are kept here.
  const rolling = new WeakMap();
  const roll = (el, text, forward, delay = 0, duration = 0.6, ease = "otto") => {
    if (!el) return;
    const busy = rolling.get(el);
    if (busy) { busy.next = { text, forward }; return; }
    const inner = el.querySelector(":scope > .line__in"), from = inner.textContent ?? "";
    if (reduce || (from === text && !el.closest(".card__buy, .pdp__add, .pdp__price, .bq__click"))) { inner.textContent = text; return; }
    const strip = document.createElement("span"), a = document.createElement("span"), b = document.createElement("span");
    strip.className = "roll__strip";
    a.textContent = forward ? from : text;
    b.textContent = forward ? text : from;
    strip.append(a, b);
    inner.style.height = getComputedStyle(inner).height;
    inner.replaceChildren(strip);
    const job = {};
    rolling.set(el, job);
    gsap.fromTo(strip, { yPercent: forward ? 0 : -50 }, { yPercent: forward ? -50 : 0, duration, ease, delay, onComplete: () => {
      inner.textContent = text;
      inner.style.height = "";
      rolling.delete(el);
      if (job.next && job.next.text !== text) roll(el, job.next.text, job.next.forward);
    } });
  };
  window.otRoll = roll;

  // Location underline — each time the pointer enters, it holds an end shape once from the start (.9s), and when the pointer leaves it returns straight to the resting position
  document.addEventListener("pointerover", (e) => {
    const a = e.target.closest?.(".ot-buy");
    if (!a || reduce || (e.relatedTarget && a.contains(e.relatedTarget))) return;
    a.classList.remove("is-running");
    void a.offsetWidth;
    a.classList.add("is-running");
  });
  document.addEventListener("pointerout", (e) => {
    const a = e.target.closest?.(".ot-buy");
    if (a && !(e.relatedTarget && a.contains(e.relatedTarget))) setTimeout(() => a.matches(":hover") || a.classList.remove("is-running"), 80);
  });
})();
