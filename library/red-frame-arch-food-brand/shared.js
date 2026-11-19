// Plugs in the same frame, header, menu drawer, flavor switcher and footer here so all pages share them,
// Entrance motions the original hooked by class names (split text, stagger rise, blur release, flowing band, bouncing photo) are received here via data- attributes.
(() => {
  gsap.registerPlugin(ScrollTrigger, ...(window.SplitText ? [SplitText] : []));
  const body = document.body;
  const isHome = body.hasAttribute("data-home");
  const mobile = () => innerWidth <= 768;

  const LOGO = `
    <svg class="m-logo__mark" viewBox="0 0 100 108" aria-hidden="true">
      <path d="M50 4c26 0 46 19 46 46 0 30-22 54-46 54S4 80 4 50C4 23 24 4 50 4z" fill="var(--site-green)"/>
      <path d="M8 64c10 22 26 38 42 38s34-16 42-38c-14 8-28 12-42 12S20 72 8 64z" fill="var(--site-red-deep)"/>
      <path d="M18 60c6-18 14-32 26-44M28 66c6-20 14-34 24-44M38 70c4-18 10-32 18-40" stroke="var(--kf-surface)" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="70" cy="34" r="18" fill="var(--kf-surface)"/>
      <circle cx="66" cy="38" r="4" fill="var(--kf-accent)"/>
      <path d="M58 22c6-8 18-8 24 0" stroke="var(--site-green)" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`;
  const WORDS = `<span class="m-logo__words"><small>Shop Name</small><b>Logo</b><i>SINCE 0000</i></span>`;
  const ARROW = `<svg viewBox="0 0 33 18"><path d="M0 8h28.6l-6-6L24 .6 32.4 9 24 17.4 22.6 16l6-6H0z"/></svg>`;
  const CART = `<svg viewBox="0 0 24 24"><path d="M3 4h3l2.6 10.2c.1.5.6.8 1.1.8h8.6c.5 0 .9-.3 1-.8L21 7H7.2"/><circle cx="10" cy="19.5" r="1.6"/><circle cx="17.5" cy="19.5" r="1.6"/></svg>`;
  const SNS = [
    '<svg viewBox="0 0 24 24"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.2-1.6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill-rule="evenodd"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M14 8V6.4c0-.8.3-1.4 1.5-1.4H17V2h-2.6C11.6 2 11 4 11 6v2H9v3h2v11h3V11h2.4l.6-3z"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9l-.4 2.6 3.4-2.5C18.4 18.6 22 15.2 22 11c0-4.4-4.5-8-10-8z"/></svg>',
  ];
  const PAGES = [
    ["index.html", "First Page"],
    ["index.html#charm", "Menu 1"],
    ["product.html", "Menu 2"],
    ["about.html", "Menu 3"],
    ["about.html#story", "Menu 4"],
    ["index.html#idea", "Menu 5"],
  ];
  const navCols = () => `
    <div><p class="m-navhead">CONTENTS</p><ul class="m-navlist">${PAGES.map(([h, t]) => `<li><a class="m-outline" href="${h}">${t}</a></li>`).join("")}</ul></div>
    <div><p class="m-navhead">CONTACT</p><ul class="m-navlist"><li><a class="m-outline" href="#">Contact Us</a></li></ul></div>
    <div><p class="m-navhead">BUY</p><ul class="m-navlist"><li><a class="m-outline" href="#">Online shop</a></li></ul></div>
    <div class="is-social"><p class="m-navhead">SOCIAL</p><div class="m-sns">${SNS.map((s) => `<a href="#" aria-label="SNS">${s}</a>`).join("")}</div></div>`;

  // ── Picture frame
  const frame = document.createElement("div");
  frame.className = "m-frame";
  frame.setAttribute("aria-hidden", "true");
  frame.innerHTML = ["lt", "rt", "lb", "rb"].map((k, i) => `<span class="m-frame__corner is-${k}">${"ABCD"[i]}</span>`).join("");
  body.prepend(frame);

  // ── Head
  const head = document.querySelector("header[data-slot='header']");
  head.className = "m-header";
  head.innerHTML = `
    <a class="m-header__logo m-logo${isHome ? "" : " is-lower"}" href="index.html" aria-label="First Page">${LOGO}${WORDS}</a>
    <div class="m-header__bar">
      <ul class="m-header__nav">${PAGES.slice(1).map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      <a class="m-shop" href="#">${CART}ONLINE SHOP</a>
      <button class="m-burger" type="button" aria-expanded="false" aria-label="Open Menu"><span></span></button>
    </div>`;
  head.insertAdjacentHTML("afterend", `
    <div class="m-menu" data-slot="menu-drawer" aria-hidden="true">
      <div class="m-menu__bg wf-img" data-label="Menu background · person smiling while eating inside a shop · warm indoor lighting · full-screen landscape"></div>
      <div class="m-menu__inner"><nav class="m-menu__nav">${navCols()}
        <div class="m-menu__foot"><a class="m-fine" href="#">Privacy policy</a><p class="m-fine">(C)0000 Company Name</p></div>
      </nav></div>
    </div>
    <button class="m-mode" type="button" data-slot="mode-toggle"><span class="m-mode__icon"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3M18 3v4h-4M6 21v-4h4"/></svg></span><span><small>MODE CHANGE</small><b>Change flavor</b></span></button>
    <div class="m-modecover" aria-hidden="true"><p>MODE 02</p></div>`);

  // ── Footer
  const foot = document.querySelector("footer[data-slot='footer']");
  foot.className = "m-footer";
  foot.innerHTML = `
    <div class="m-footer__inner">
      <div class="m-footer__logo"><a class="m-logo" href="index.html">${LOGO}${WORDS}</a></div>
      <nav class="m-footer__nav">${navCols()}
        <div class="m-fine-row"><a class="m-fine" href="#">Privacy policy</a><p class="m-fine">(C)0000 Company Name</p></div>
      </nav>
    </div>
    <div class="m-footer__bg">
      <div class="wf-img" data-label="Footer background · a person in a shop with eyes closed and a broad smile · blurred background · portrait photo filling downward"></div>
      <p class="m-footer__quote">Small happiness<small>Isn’t it?</small></p>
    </div>`;

  document.querySelectorAll("[data-arrow]").forEach((el) => (el.innerHTML = ARROW));

  // ── Smooth scroll: same Lenis 1.1.18 as the original, same options. Same-page anchors stop at header height + 120px above, over 1.2 seconds ──
  const expo = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
  let lenis = null;
  if (window.Lenis && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    lenis = new Lenis({ lerp: 0.1, duration: 1, easing: expo, orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true, syncTouch: false, touchMultiplier: 2 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    window.lenis = lenis;
  }
  const goHash = (hash) => {
    const el = hash && hash.length > 1 && document.querySelector(hash);
    if (!el || !lenis) return false;
    lenis.scrollTo(el, { offset: -((document.querySelector("header")?.offsetHeight || 0) + 120), duration: 1.2, easing: expo, immediate: false });
    return true;
  };
  if (location.hash) setTimeout(() => goHash(location.hash), 100);
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    const samePage = href.startsWith("#") || new URL(href, location.href).pathname === location.pathname;
    if (samePage && goHash(href.slice(href.indexOf("#")))) { e.preventDefault(); history.pushState(null, "", href.slice(href.indexOf("#"))); }
  });

  // ── Menu drawer: opening hides the logo and stops background scroll
  const menu = document.querySelector(".m-menu");
  const burger = document.querySelector(".m-burger");
  const logo = document.querySelector(".m-header__logo");
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    logo.classList.toggle("is-menu", open);
    menu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    document.documentElement.classList.toggle("is-menu-open", open);
    body.classList.toggle("is-locked", open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  addEventListener("keydown", (e) => e.key === "Escape" && menu.classList.contains("is-open") && setMenu(false));

  // ── Flavor change: the cover fills up and the letters pop up, then the color changes at .8s and it clears away
  const cover = document.querySelector(".m-modecover");
  const coverText = cover.querySelector("p");
  let busy = false;
  document.querySelector(".m-mode").addEventListener("click", () => {
    if (busy) return;
    busy = true;
    const toSpicy = !body.classList.contains("is-spicy");
    gsap.timeline({ onComplete: () => (busy = false) })
      .set(cover, { backgroundColor: toSpicy ? "var(--kf-accent)" : "var(--kf-surface)", visibility: "visible" })
      .set(coverText, { color: toSpicy ? "var(--kf-surface)" : "var(--site-black)", innerText: toSpicy ? "MODE 02" : "MODE 01", opacity: 0, y: 20 })
      .to(cover, { duration: 0.5, opacity: 1, ease: "power2.out" })
      .to(coverText, { duration: 0.4, opacity: 1, y: 0, ease: "back.out(1.7)" }, "-=0.2")
      .add(() => body.classList.toggle("is-spicy"), "+=0.8")
      .to(cover, { duration: 0.6, opacity: 0, ease: "power2.inOut", onComplete: () => gsap.set(cover, { visibility: "hidden" }) });
  });

  // ── Entrance motion
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll("[data-ani]").forEach((el) => el.classList.add("is-in"));
    if (isHome) { body.classList.add("is-header-on"); logo.classList.add("is-active"); }
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-ani]").forEach((el) => {
      ScrollTrigger.create({ trigger: el, start: `top ${el.dataset.start || 83}%`, once: true, onEnter: () => el.classList.add("is-in") });
    });
    document.querySelectorAll("[data-order]").forEach((list) => {
      gsap.fromTo(list.children, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.25, ease: "power1.out", scrollTrigger: { trigger: list, start: "top 83%" } });
    });
    document.querySelectorAll("[data-order-child]").forEach((list) => {
      [...list.children].forEach((el, i) => gsap.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.1 * i, ease: "power1.out", scrollTrigger: { trigger: el, start: "top 80%" } }));
    });
    if (window.SplitText) {
      document.querySelectorAll("[data-split]").forEach((el) => {
        const { chars } = new SplitText(el, { type: "chars" });
        gsap.fromTo(chars, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.05, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      });
      document.querySelectorAll("[data-split-random]").forEach((el) => {
        const { chars } = new SplitText(el, { type: "chars" });
        gsap.fromTo(chars, { opacity: 0, scale: () => gsap.utils.random(1.03, 1.5) }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out", stagger: { each: 0.05, from: "random" }, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      });
    }
    // A few big Chinese-character cells take turns growing slightly, then returning
    document.querySelectorAll("[data-jiggle]").forEach((el) => {
      const cells = [...el.children];
      let live = true;
      const beat = () => {
        if (!live) return;
        const pick = gsap.utils.shuffle(cells.slice()).slice(0, gsap.utils.random(1, Math.min(3, cells.length), 1));
        gsap.fromTo(pick, { scale: 1 }, { scale: () => gsap.utils.random(0.95, 1.1), duration: 0.25, ease: "power2.inOut", yoyo: true, repeat: 1, onComplete: () => gsap.delayedCall(gsap.utils.random(0.5, 1), beat) });
      };
      ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: beat });
      return () => (live = false);
    });
    if (isHome) {
      const concept = document.querySelector("[data-concept]");
      ScrollTrigger.create({ trigger: concept, start: "top 0%", onEnter: () => body.classList.add("is-header-on"), onLeaveBack: () => !document.documentElement.classList.contains("is-menu-open") && body.classList.remove("is-header-on") });
      ScrollTrigger.create({ trigger: concept, start: "top center", onEnter: () => logo.classList.add("is-active"), onLeaveBack: () => logo.classList.remove("is-active") });
    }
  });

  // ── Flowing strip: same Splide 4 + AutoScroll as the original (data-speed px per frame, half at 768 and under, drag to push). Stays still under reduced motion
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AutoScroll = window.splide?.Extensions?.AutoScroll;
  document.querySelectorAll("[data-ticker]").forEach((el) => {
    let speed = (el.dataset.ticker === "rtl" ? -1 : 1) * Math.abs(Number(el.dataset.speed ?? 1.2));
    if (innerWidth <= 768) speed *= 0.5;
    new Splide(el, {
      type: "loop", arrows: false, pagination: false, drag: "free", focus: "center", autoWidth: true,
      gap: el.dataset.gap || "24px", wheel: false, clones: 7, easing: "linear", speed: 600,
      breakpoints: { 400: { gap: "16px" }, 768: { gap: el.dataset.gapMid || "20px" } },
      autoScroll: { speed, pauseOnHover: false, pauseOnFocus: false, autoStart: !reduce },
    }).mount({ AutoScroll });
  });
  // On wide screens an unrolled list, and only at 768 and below a flowing photo strip (original hero jsSliderTop·Bottom: cell 10rem · gap 0 · ±.5)
  document.querySelectorAll("[data-strip]").forEach((el) => {
    new Splide(el, {
      destroy: true, type: "loop", drag: "free", arrows: false, pagination: false,
      breakpoints: { 768: { destroy: false, gap: 0, fixedWidth: "10rem", autoScroll: { speed: Number(el.dataset.speed || 0.5), pauseOnHover: false, pauseOnFocus: false, autoStart: !reduce } } },
    }).mount({ AutoScroll });
  });

  // ── Photos drifting inside a box and bouncing off its walls (original bouncer: speed range · wall deflection angle ±nudge)
  window.mBounce = (box, item, o = {}) => {
    if (!box || !item || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const { speedMin = 120, speedMax = 200, nudge = 0.15, dtDiv = 40 } = o;
    const sp = gsap.utils.random(speedMin, speedMax);
    let a = gsap.utils.random(0, Math.PI * 2), vx = Math.cos(a) * sp, vy = Math.sin(a) * sp;
    let x = 0, y = 0, mx = 0, my = 0;
    const setX = gsap.quickSetter(item, "x", "px"), setY = gsap.quickSetter(item, "y", "px");
    const fit = () => { mx = Math.max(0, box.clientWidth - item.offsetWidth); my = Math.max(0, box.clientHeight - item.offsetHeight); x = gsap.utils.clamp(0, mx, x); y = gsap.utils.clamp(0, my, y); };
    gsap.set(item, { position: "absolute", left: 0, top: 0 });
    fit(); x = gsap.utils.random(0, mx); y = gsap.utils.random(0, my);
    new ResizeObserver(fit).observe(box);
    const turn = () => { const m = Math.hypot(vx, vy) || sp, t = Math.atan2(vy, vx) + gsap.utils.random(-nudge, nudge); vx = Math.cos(t) * m; vy = Math.sin(t) * m; };
    gsap.ticker.add(() => {
      const k = gsap.ticker.deltaRatio() / dtDiv;
      x += vx * k; y += vy * k;
      if (x <= 0) { x = 0; vx = Math.abs(vx); turn(); } else if (x >= mx) { x = mx; vx = -Math.abs(vx); turn(); }
      if (y <= 0) { y = 0; vy = Math.abs(vy); turn(); } else if (y >= my) { y = my; vy = -Math.abs(vy); turn(); }
      setX(x); setY(y);
    });
  };
  const band = document.querySelector(".m-shopband");
  if (band) mBounce(band.querySelector(".m-shopband__field"), band.querySelector(".m-shopband__bouncer"), mobile() ? { speedMin: 90, speedMax: 160, dtDiv: 33 } : { speedMin: 110, speedMax: 190, dtDiv: 35, nudge: 0.12 });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
