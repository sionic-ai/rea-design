// Studio shared — puts the top nav · cookie bar · footer on every page with the same markup, and hooks up Lenis · nav hiding · line fade-in · clock.
// The page transition (burning-through transition) is handled by the burn-through-nav part of body.
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => matchMedia("(max-width: 809.98px)").matches;
  const arr = '<svg viewBox="0 0 12 12"><path d="M2 10 10 2M4 2h6v6"/></svg>';
  const side = '<svg viewBox="0 0 12 12"><path d="M1 6h10M7 2l4 4-4 4"/></svg>';
  const logo = (cls = "") => `<svg class="${cls}" viewBox="0 0 220 100" aria-hidden="true" data-label="Your brand’s English name here — two-line lowercase logo"><text class="ml-logo-t" x="0" y="52" font-size="58">studio</text><text class="ml-logo-t" x="70" y="94" font-size="42">name</text></svg>`;
  window.mlArrow = arr;
  window.mlSide = side;

  // ───────── Markup ─────────
  const top = document.querySelector('[data-slot="topbar"]');
  if (top && page === "detail") top.remove();
  else if (top) {
    const nav = [["works.html", "works", "work", 7], ["about.html#notes", "notes", "notes", 7], ["about.html", "about", "about"], ["#contact", "contact", "contact"]];
    top.className = `ml-top${page === "home" ? " is-blend" : ""}${page === "about" ? " is-paper" : ""}`;
    top.innerHTML = `<a class="ml-top__logo" href="index.html" aria-label="Go home">${logo()}</a>
      <nav class="ml-top__nav" aria-label="Main menu">${nav.map(([h, k, l, n]) => `<a class="ml-u${k === page ? " is-current" : ""}" href="${h}"><span class="ml-top__in">${l}${n ? `<sup>(${n})</sup>` : ""}</span></a>`).join("")}</nav>`;
  }
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "ml-foot";
    foot.id = "contact";
    const link = (t) => `<li><a class="ml-foot__link ml-u" href="#">${t}${arr.replace("<svg", '<svg class="ml-foot__arr"')}</a></li>`;
    foot.innerHTML = `<div class="ml-foot__col ml-foot__contact">
        <p class="ml-foot__label">Contact</p>
        <p class="ml-foot__cta"><span class="ml-foot__dot"></span>We’re taking on new work.</p>
        <nav class="ml-foot__services"><p class="ml-foot__label">Services</p><ul class="ml-foot__list" data-label="Your third service name in English here">${link("Service 01")}${link("Service 02")}${link("Service 03")}</ul></nav>
      </div>
      <nav class="ml-foot__col ml-foot__social"><p class="ml-foot__label">Social</p><ul class="ml-foot__list" data-label="Your three social channel names here">${link("Network 01")}${link("Network 02")}${link("Network 03")}</ul></nav>
      <div class="ml-now" data-slot="now-playing"><p class="ml-foot__label">Playing · Reading</p>
        <div class="ml-now__list">
          <a class="ml-now__item" href="#"><span class="ml-cover"><span class="ml-cover__rec"><small>Album</small><b>Album Title</b></span></span>
            <span class="ml-now__meta"><span class="ml-now__kicker"><span class="ml-eq"><i></i><i></i><i></i></span>Now playing</span><span class="ml-now__title" data-label="Your song name here">Song Title</span><span class="ml-now__by">Artist Name</span></span></a>
          <div class="ml-now__item"><span class="ml-cover"><span class="ml-cover__book"><small>Publisher</small><b>Book Title</b></span></span>
            <span class="ml-now__meta"><span class="ml-now__kicker">Reading</span><a class="ml-now__title ml-u" href="#" data-label="Your book title here">Book Title</a><span class="ml-now__by">Author Name</span></span></div>
        </div>
      </div>
      <span class="ml-foot__rule" data-rule></span>
      <div class="ml-foot__row">${logo("ml-foot__logo")}<p class="ml-foot__where"><time data-clock>--:--</time> UTC+9 City Name</p><p class="ml-foot__copy">© 0000 Studio Name</p>
        <ul class="ml-foot__legal"><li><a href="#">Privacy</a></li><li><a href="#">Cookies</a></li><li><a href="#">Terms</a></li><li><button class="ml-u ml-foot__btn" type="button" data-cookie-open>Cookie settings</button></li></ul></div>`;
  }
  const cookie = document.createElement("div");
  cookie.className = "ml-cookie";
  cookie.setAttribute("data-slot", "cookie");
  cookie.innerHTML = `<span>Your note that analytics cookies are used only with consent.</span><span class="ml-cookie__acts"><button class="is-fill" type="button" data-cookie="1" data-t="Accept">Accept</button><button type="button" data-cookie="0">Decline</button></span><a class="ml-u" href="#">Cookie policy</a>`;
  document.body.append(cookie);
  const KEY = "ml-cookie";
  // The cookie bar rises from the bottom with clip-path after the Hero is revealed (.8s reveal curve, text · buttons .16~.3s later)
  if (!sessionStorage.getItem(KEY)) {
    const show = () => { cookie.classList.add("is-in"); ["pointermove", "scroll", "keydown", "touchstart"].forEach((t) => removeEventListener(t, show)); };
    ["pointermove", "scroll", "keydown", "touchstart"].forEach((t) => addEventListener(t, show, { passive: true }));
    setTimeout(show, 1200);
  }
  cookie.addEventListener("click", (e) => { if (e.target.closest("[data-cookie]")) { sessionStorage.setItem(KEY, "1"); cookie.classList.remove("is-in"); } });
  // Original effect button (data-fx-btn) — while the fill rises (.7s) and drains (.68s), the text belongs to the effect layer, so the button text is emptied
  const fill = cookie.querySelector(".is-fill");
  let fxT = 0;
  const fx = (ms) => { clearTimeout(fxT); fill.classList.add("is-fx"); fxT = setTimeout(() => fill.classList.remove("is-fx"), ms); };
  fill.addEventListener("pointerenter", () => fx(700));
  fill.addEventListener("pointerleave", () => fx(683));
  document.querySelector("[data-cookie-open]")?.addEventListener("click", () => cookie.classList.add("is-in"));
  document.querySelectorAll(".arrow-slot").forEach((el) => (el.outerHTML = arr));
  document.querySelectorAll(".side-slot").forEach((el) => (el.outerHTML = side));

  // ───────── Lenis — original settings (lerp .12 · wheel 1.1) ─────────
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.1, autoRaf: false });
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.mlLenis = lenis;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("reveal", "0.18,0.66,0.18,1");
  CustomEase.create("hesitate", "0.65,0.01,0.05,0.99");
  CustomEase.create("appear", "0.11,0.06,0.18,1");

  // ───────── Top nav: 4px down from below 80px hides it 96px up (.3s power1.out), 24px up brings it back ─────────
  const bar = document.querySelector(".ml-top");
  if (bar && !reduce) {
    let hidden = false, last = 0;
    const set = (h) => { if (h === hidden) return; hidden = h; gsap.to(bar, { y: h ? -96 : 0, duration: 0.3, ease: "power1.out", overwrite: true }); };
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => {
      const y = st.scroll(), d = y - last;
      if (y <= 80) { set(false); last = y; return; }
      if (d > 0) { if (d < 4) return; set(true); last = y; return; }
      if (-d < 24) return;
      set(false); last = y;
    } });
    const hero = document.querySelector("[data-hero]");
    const solid = () => bar.classList.toggle("is-solid", !hero || scrollY > hero.offsetHeight - 96);
    addEventListener("scroll", solid, { passive: true });
    solid();
  }

  // Fires once on reaching 85% of the screen — immediately if already inside from the start (the topmost element, whose clamp start is 0, never fires onEnter at scroll 0)
  const onView = (el, fn) => {
    if (el.getBoundingClientRect().top < innerHeight * 0.85) return fn();
    ScrollTrigger.create({ trigger: el, start: "clamp(top 85%)", once: true, onEnter: fn });
  };
  window.mlOnView = onView;

  // ───────── Line rise — when it reaches 85% of the screen the line reveals from 105% below in 1.2s (phone .9), at .08s (phone .06) stagger ─────────
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const made = [];
    document.querySelectorAll("[data-lines]").forEach((el) => (el.style.visibility = "hidden"));
    (document.fonts?.ready || Promise.resolve()).then(() => document.querySelectorAll("[data-lines]").forEach((el) => {
      el.style.visibility = "";
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "ml-ln", autoSplit: true });
      made.push(split);
      const p = phone();
      gsap.set(split.lines, { yPercent: 105 });
      onView(el, () => gsap.to(split.lines, { yPercent: 0, duration: p ? 0.9 : 1.2, ease: "reveal", stagger: p ? 0.06 : 0.08, delay: +(el.dataset.delay || 0) }));
    })).then(() => ScrollTrigger.refresh());
    document.querySelectorAll("[data-rule]").forEach((el) => {
      gsap.set(el, { scaleX: 0, transformOrigin: "0 50%" });
      onView(el, () => gsap.to(el, { scaleX: 1, duration: phone() ? 1.2 : 1.7, ease: "reveal" }));
    });
    document.querySelectorAll("[data-rise]").forEach((el) => {
      gsap.set(el, { yPercent: 18, autoAlpha: 0 });
      onView(el, () => gsap.to(el, { yPercent: 0, autoAlpha: 1, duration: phone() ? 0.9 : 1.2, ease: "reveal", delay: +(el.dataset.delay || 0) }));
    });
    return () => made.forEach((s) => s.revert());
  });

  // ───────── Background per section — uses the tone of the section across the screen center, blended while the section top passes from 75% to 25% of the screen ─────────
  const toned = [...document.querySelectorAll("main > [data-tone]")];
  if (toned.length && !reduce) {
    const page = document.createElement("div");
    page.className = "ml-page";
    page.setAttribute("aria-hidden", "true");
    document.body.prepend(page);
    const val = (el) => (el.dataset.tone === "white" ? 1 : 0);
    let raf = 0;
    const upd = () => {
      raf = 0;
      const h = innerHeight;
      let t = 0;
      for (let i = 0; i < toned.length; i++) {
        const r = toned[i].getBoundingClientRect(), prev = i ? val(toned[i - 1]) : val(toned[0]);
        const k = Math.min(1, Math.max(0, (h * 0.75 - r.top) / (h * 0.5)));
        if (k > 0) t = prev + (val(toned[i]) - prev) * k;
      }
      root.style.setProperty("--site-t", t.toFixed(3));
      root.classList.toggle("is-tone-mid", t > 0.001 && t < 0.999);
      root.classList.toggle("is-tone-white", t >= 0.999);
    };
    addEventListener("scroll", () => { raf ||= requestAnimationFrame(upd); }, { passive: true });
    addEventListener("resize", upd);
    upd();
  }

  // ───────── Melting blackletter title — melts and beads up with a gooey filter ─────────
  const heads = document.querySelectorAll("[data-liquid-head]");
  if (heads.length) {
    const ns = "http://www.w3.org/2000/svg";
    const defs = document.createElementNS(ns, "svg");
    defs.setAttribute("width", "0"); defs.setAttribute("height", "0"); defs.setAttribute("aria-hidden", "true");
    defs.style.position = "absolute";
    defs.innerHTML = '<filter id="ml-goo" x="-20%" y="-40%" width="140%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="0" result="b"/><feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/></filter>';
    document.body.append(defs);
    const blurEl = defs.querySelector("feGaussianBlur");
    heads.forEach((h) => {
      const text = h.textContent.trim();
      h.innerHTML = `<span class="lq is-wait"><span class="lq__b">${text}</span><span class="lq__a" aria-hidden="true">${text}</span></span>`;
      if (reduce) { h.querySelector(".lq").classList.remove("is-wait"); h.querySelector(".lq__a").remove(); return; }
      const lq = h.querySelector(".lq"), a = lq.querySelector(".lq__a"), b = lq.querySelector(".lq__b");
      onView(h, () => {
        const st = { blur: 1.5 };
        lq.classList.remove("is-wait");
        lq.style.filter = "url(#ml-goo)";
        gsap.set(b, { opacity: 0 }); gsap.set(a, { opacity: 1, filter: "none" });
        gsap.timeline({ onUpdate: () => blurEl.setAttribute("stdDeviation", st.blur.toFixed(2)), onComplete: () => { lq.style.filter = ""; a.remove(); } })
          .to(st, { blur: 7, duration: 0.45, ease: "sine.in" }, 0)
          .to(a, { opacity: 0, duration: 0.5, ease: "sine.inOut" }, 0.3)
          .to(b, { opacity: 1, duration: 0.5, ease: "sine.inOut" }, 0.3)
          .to(st, { blur: 0, duration: 0.85, ease: "sine.out" }, 0.45);
      });
    });
  }

  // ───────── Hero title letter swap — letters the mouse or pen passes over turn blackletter, and return 1s after it leaves ─────────
  // Blackletter is drawn over the original letter slots so lines don’t shift (the original ties the slot width to the original letter width). Original does it on the first page only, not on touch
  if (page === "home" && !reduce && window.gsap) {
    document.fonts?.load('500 1em "Grenze Gotisch"').catch(() => {});
    const back = new WeakMap();
    const words = (h) => {
      const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest(".lq__a, .ts-w") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      const nodes = [];
      while (w.nextNode()) nodes.push(w.currentNode);
      nodes.forEach((n) => n.replaceWith(...n.textContent.split(/(\s+)/).filter(Boolean).map((s) => {
        if (/^\s+$/.test(s)) return document.createTextNode(s);
        const word = document.createElement("span");
        word.className = "ts-w";
        word.setAttribute("aria-hidden", "true");
        for (const ch of s) { const c = document.createElement("span"); c.className = "ts-c"; c.dataset.c = ch; c.textContent = ch; word.append(c); }
        return word;
      })));
    };
    document.querySelectorAll("main h1:not(.sr-only):not([data-no-swap]), main h2:not([data-no-swap]), main h3:not([data-no-swap]), main [data-swap]").forEach((h) => {
      if (!h.hasAttribute("aria-label")) h.setAttribute("aria-label", (h.querySelector(".lq__b") || h).textContent.trim().replace(/\s+/g, " "));
      words(h);
      let hot = null;
      const set = (c) => {
        if (c === hot) return;
        if (hot) { const o = hot; back.set(o, gsap.delayedCall(1, () => { o.classList.remove("is-alt"); back.delete(o); })); }
        hot = c;
        if (c) { back.get(c)?.kill(); back.delete(c); c.classList.add("is-alt"); }
      };
      const move = (e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") set(e.target.closest?.(".ts-c") || null); };
      h.addEventListener("pointerenter", move);
      h.addEventListener("pointermove", move);
      h.addEventListener("pointerleave", () => set(null));
    });
  }

  // ───────── Clock · now playing ─────────
  const fmt = new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/City" });
  const clocks = document.querySelectorAll("[data-clock]");
  const tick = () => clocks.forEach((c) => (c.textContent = fmt.format(new Date())));
  tick(); setInterval(tick, 15000);
  const now = document.querySelector(".ml-now");
  if (now && !reduce) new IntersectionObserver((es) => es.forEach((e) => now.classList.toggle("is-live", e.isIntersecting))).observe(now);
})();
