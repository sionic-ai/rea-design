// Common to all pages: draws header, menu drawer, BOOK NOW and contact footer in one place, and wires Lenis, section entrances, menu button color, photo parallax, slider, modal and page transitions.
// Original values: Lenis 1.3.8 (lerp .1, autoRaf, overscroll off) · reveal check rootMargin -50% 0px · items entering at the same time staggered by 100ms ·
// Parallax anime.js onScroll sync, y -10%→10% linear · drawer · modal .3s · BOOK NOW 400ms · transition cover .5s (+150ms safety) · first load 1s + .4s
(() => {
  const root = document.documentElement;
  const page = root.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(min-width: 960px)");
  const RL = (window.RL = { reduce, lenis: null });

  // A newly drawn placeholder instead of the original logo — a symbol overlapping a circle (human face) and a triangle (dog face) in one stroke + a two-line English name
  const logo = (cls = "") => `<svg class="${cls}" viewBox="0 0 310 100" fill="none" stroke="currentColor" aria-label="Brand logo slot">
      <g stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
        <path d="M9 88 L30 37 Q36 21 52 19 Q74 18 76 40 Q77 60 55 64 L22 66 L60 88 Z"/>
        <circle cx="93" cy="52" r="26"/>
        <path d="M84 78 L126 86 L104 64"/>
      </g>
      <text x="56" y="11" font-size="9" letter-spacing="2.2" fill="currentColor" stroke="none" style="font-family: var(--kf-font-display)" transform="rotate(14 56 11)">AREA</text>
      <g fill="currentColor" stroke="none" style="font-family: var(--kf-font-display)">
        <text x="150" y="42" font-size="31" font-weight="500" letter-spacing=".5">Park -</text>
        <text x="150" y="76" font-size="31" font-weight="500" letter-spacing=".5">Name</text>
        <text x="151" y="93" font-size="7.6" font-weight="600" letter-spacing="1.3">LIFESTYLE PARK</text>
      </g>
    </svg>`;
  RL.logo = logo;

  const navItems = [
    ["service.html", "DAY USE", "(Same-day visit info)"],
    ["service.html#stay", "STAY", "(Lodging info)"],
    ["index.html#spaces", "SPACES", "(Facility intro)"],
  ];
  const subItems = [
    ["about.html", "ABOUT", "(Brand intro)"],
    ["about.html#access", "ACCESS", "(Directions)"],
    ["about.html#price", "PRICE", "(Pricing)"],
    ["about.html#open", "OPEN", "(Hours)"],
    ["about.html#faq", "FAQ", "(FAQ)", "is-full"],
    ["#", "SOCIAL", "(Social accounts)", "is-full"],
  ];
  const navLink = ([href, t, s, cls = ""]) =>
    `<li class="${cls}"><a class="rl-nav-link" href="${href}"><span class="rl-nav-link__title">${t}</span><span class="rl-nav-link__sub">${s}</span></a></li>`;

  const book = () => `<details class="rl-book" data-slot="book-now">
      <summary class="rl-book__summary"><span class="rl-book__title">BOOK NOW</span>
        <svg class="rl-book__x" viewBox="0 0 14 14" aria-hidden="true"><path d="M6.85 5.44 12 .29l1.41 1.42-5.14 5.14L13.41 12 12 13.41 6.85 8.27l-5.44 5.44L0 12.29l5.44-5.44L0 1.41 1.41 0z"/></svg></summary>
      <ul class="rl-book__list" aria-hidden="true">
        <li><a class="rl-book__item" href="#" data-no-transition><span class="rl-book__item-text"><span class="rl-book__item-title">STAY</span><span class="rl-book__item-sub">(Lodging booking)</span></span><i class="rl-book__item-icon"></i></a></li>
      </ul>
    </details>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("rl-head");
    head.innerHTML = `<h1><a class="rl-head__logo" href="index.html">${logo()}</a></h1>
      <button class="rl-menu-btn" type="button" aria-label="Open Menu" data-dialog-show="drawer"></button>`;
    head.insertAdjacentHTML(
      "afterend",
      `<dialog id="drawer" class="rl-drawer" data-slot="menu-drawer" data-lenis-prevent>
        <div class="rl-drawer__inner"><div class="rl-drawer__content">
          <a class="rl-drawer__logo" href="index.html">${logo()}</a>
          <nav class="rl-drawer__nav" aria-label="Main menu">
            <ul class="rl-drawer__list">${navItems.map(navLink).join("")}</ul>
            <ul class="rl-drawer__sub">${subItems.map(navLink).join("")}</ul>
          </nav>
          <button class="rl-drawer__close" type="button" aria-label="Close Menu" data-dialog-close></button>
        </div>${book()}</div>
      </dialog>`,
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.innerHTML = `<div id="contact" class="rl-contact rl-tex" data-js-nav-icon-color="wh">
        <div class="l-inner"><div class="rl-contact__content">
          <div class="rl-contact__info">
            <div class="rl-contact__titles"><h2 class="rl-contact__title">CONTACT</h2><p class="rl-contact__sub">(Contact us)</p></div>
            <div class="rl-contact__line" data-copy><span class="rl-notifier" aria-live="polite">Copied to clipboard.</span><button type="button">mail@example-park.jp</button></div>
            <div class="rl-contact__line" data-copy><span class="rl-notifier" aria-live="polite">Copied to clipboard.</span><button type="button">0000-00-0000</button></div>
          </div>
          <p class="rl-contact__logo">${logo()}</p>
        </div></div>
      </div>
      <div class="rl-legal" data-slot="legal-footer">
        <div class="rl-legal__inner">
          <a class="rl-legal__company" href="#" data-no-transition aria-label="Operating company logo here"><svg class="rl-legal__mark" viewBox="0 0 450 142" fill="none" stroke="currentColor" stroke-width="10"><circle cx="70" cy="71" r="48"/><path d="M150 50h270M150 92h200"/></svg></a>
          <div class="rl-legal__links">
            <ul class="rl-legal__list">${["Stay Terms", "Usage rules", "Dog usage rules", "Privacy policy", "Cookie policy and notice on external transfer of user information", "Website Terms of Use", "Social media policy", "Social media terms of use"].map((t) => `<li><a href="#" data-no-transition>${t}</a></li>`).join("")}</ul>
            <p class="rl-legal__copy">Copyright COMPANY NAME CO., LTD. ALL rights reserved.</p>
          </div>
        </div>
      </div>`;
    foot.insertAdjacentHTML("afterend", book());
  }

  // ───────── Text splitting — words are grouped as chunks so line breaks don’t split mid-word, and each character gets --index ─────────
  document.querySelectorAll("[data-chars]").forEach((el) => {
    let i = 0;
    // <br> is kept as a line break and that spot counts as one slot too (the original delay table does the same)
    const parts = [...el.childNodes].map((n) => (n.nodeName === "BR" ? "\n" : n.textContent)).join("").trim().split(/(\n|\s+)/);
    el.textContent = "";
    el.classList.add("rl-chars");
    parts.forEach((w) => {
      if (!w) return;
      if (w === "\n") { el.append(document.createElement("br")); i++; return; }
      if (/^\s+$/.test(w)) { el.append(" "); i++; return; }
      const word = document.createElement("span");
      word.className = "rl-word";
      [...w].forEach((ch) => {
        const c = document.createElement("span");
        c.className = "rl-char";
        c.style.setProperty("--index", i++);
        c.textContent = ch;
        word.append(c);
      });
      el.append(word);
    });
  });

  // ───────── Lenis — original defaults (lerp .1) as is, while scrolling html.lenis-scrolling hides BOOK NOW ─────────
  if (window.Lenis && !reduce) RL.lenis = new Lenis({ autoRaf: true, overscroll: false });

  // ───────── Section reveal — shown once past the center line of the screen, those entering together delayed by 100ms each ─────────
  const inviewEls = [...document.querySelectorAll('[data-js="inview"]')];
  if (inviewEls.length) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e, i) => {
          if (e.target.dataset.jsInviewOnce === "true" && e.isIntersecting) io.unobserve(e.target);
          setTimeout(() => e.target.setAttribute("data-js-inview-is-visible", String(e.isIntersecting)), 100 * i);
        }),
      { rootMargin: "-50% 0px" },
    );
    inviewEls.forEach((el) => io.observe(el));
  }

  // ───────── Menu button color — follows the data-js-nav-icon-color (wh/bl) of the section that the button’s center height passes ─────────
  const navBtns = [...document.querySelectorAll(".rl-menu-btn")];
  let points = [];
  const updatePoints = () => {
    points = [...document.querySelectorAll("[data-js-nav-icon-color]")]
      .map((el) => ({ top: el.getBoundingClientRect().top + scrollY, color: el.dataset.jsNavIconColor }))
      .sort((a, b) => a.top - b.top);
  };
  const updateNav = () => {
    navBtns.forEach((b) => {
      const r = b.getBoundingClientRect();
      const mid = scrollY + r.top + r.height / 2;
      let c;
      for (const p of points) if (p.top <= mid) c = p.color; else break;
      if (c) b.setAttribute("data-js-color", c);
    });
    root.dataset.scrollIsTop = String(scrollY < 105);
  };
  updatePoints();
  updateNav();
  addEventListener("scroll", updateNav, { passive: true });
  addEventListener("resize", () => { updatePoints(); updateNav(); });
  addEventListener("load", () => { updatePoints(); updateNav(); });
  new ResizeObserver(() => { updatePoints(); updateNav(); }).observe(document.body);

  // Logo color: on phones some pages have a white logo sitting over the first photo
  const logoColor = () => (root.dataset.logoColor = (desktop.matches ? root.dataset.logoColorPc : root.dataset.logoColorSp) || "wh");
  logoColor();
  desktop.addEventListener("change", logoColor);

  // ───────── dialog (menu drawer · video modal) — is-transition-show .3s on open, close after is-transition-close .3s on close ─────────
  const dialogs = {};
  document.querySelectorAll("dialog[id]").forEach((d) => {
    let open = false;
    const show = () => {
      open = true;
      d.classList.add("is-show", "is-transition-show");
      d.showModal();
      RL.lenis?.stop();
      d.dispatchEvent(new Event("rl:show"));
      setTimeout(() => d.classList.remove("is-transition-show"), 300);
    };
    const close = () => {
      if (!open) return;
      open = false;
      d.classList.remove("is-show");
      d.classList.add("is-transition-close");
      setTimeout(() => {
        d.classList.remove("is-transition-close");
        d.close();
        RL.lenis?.start();
        d.dispatchEvent(new Event("rl:close"));
      }, 300);
    };
    d.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    d.addEventListener("click", (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (!(e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom)) close();
    });
    d.querySelectorAll("[data-dialog-close]").forEach((b) => b.addEventListener("click", close));
    dialogs[d.id] = { show, close };
  });
  document.querySelectorAll("[data-dialog-show]").forEach((b) => b.addEventListener("click", () => dialogs[b.dataset.dialogShow]?.show()));
  // Same-page anchors inside the drawer close the drawer and go to that spot
  document.querySelectorAll(".rl-drawer a[href*='#']").forEach((a) =>
    a.addEventListener("click", () => {
      const u = new URL(a.href, location.href);
      if (u.pathname === location.pathname) dialogs.drawer?.close();
    }),
  );

  // ───────── BOOK NOW — opens and closes in 400ms (-opening/-closing states), clicking outside closes it ─────────
  document.querySelectorAll(".rl-book").forEach((d) => {
    const sum = d.querySelector("summary");
    const list = d.querySelector(".rl-book__list");
    let t = null, isOpen = false;
    const set = (mode) => {
      clearTimeout(t);
      if (mode === "open") {
        isOpen = true;
        d.open = true;
        d.classList.add("is-open", "is-opening");
        d.classList.remove("is-closing");
        list.setAttribute("aria-hidden", "false");
        t = setTimeout(() => d.classList.remove("is-opening"), 400);
      } else {
        isOpen = false;
        d.classList.add("is-closing");
        d.classList.remove("is-opening");
        list.setAttribute("aria-hidden", "true");
        t = setTimeout(() => { d.classList.remove("is-open", "is-closing"); d.open = false; }, 400);
      }
    };
    sum.addEventListener("click", (e) => { e.preventDefault(); set(isOpen ? "close" : "open"); });
    document.addEventListener("pointerdown", (e) => { if (isOpen && !d.contains(e.target)) set("close"); }, { capture: true });
  });

  // ───────── Show more (news · included list) — svelte slide default 400ms cubicOut, text Read More ↔ Close ─────────
  document.querySelectorAll("[data-more]").forEach((btn) => {
    const more = document.querySelector(btn.dataset.more);
    if (!more) return;
    const label = btn.querySelector(".rl-more-label"), icon = btn.querySelector(".rl-icon");
    let open = false, anim = null;
    btn.addEventListener("click", () => {
      open = !open;
      if (label) label.textContent = open ? "Close" : "Read More";
      if (icon) icon.dataset.icon = open ? "intend" : "extend";
      anim?.cancel();
      if (open) more.hidden = false;
      if (reduce) { more.hidden = !open; return; }
      const h = more.scrollHeight;
      // Opacity fills within the first 5% (svelte slide’s min(t*20,1))
      anim = more.animate(
        open
          ? [{ height: "0px", opacity: 0 }, { height: `${h * 0.05}px`, opacity: 1, offset: 0.05 }, { height: `${h}px`, opacity: 1 }]
          : [{ height: `${h}px`, opacity: 1 }, { height: `${h * 0.05}px`, opacity: 1, offset: 0.95 }, { height: "0px", opacity: 0 }],
        { duration: 400, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)" },
      );
      anim.onfinish = () => { if (!open) more.hidden = true; anim = null; RL.lenis?.resize(); };
    });
  });

  // ───────── Tapping mail or phone copies it + 3s notice (.2s fade) ─────────
  document.querySelectorAll("[data-copy]").forEach((w) => {
    const b = w.querySelector("button"), n = w.querySelector(".rl-notifier");
    let t;
    b.addEventListener("click", () => {
      navigator.clipboard?.writeText(b.textContent.trim()).catch(() => {});
      n.classList.add("is-show");
      clearTimeout(t);
      t = setTimeout(() => n.classList.remove("is-show"), 3000);
    });
  });

  // Photo parallax — same enter/leave thresholds as the original via anime.js onScroll(sync)
  if (window.anime && !reduce) {
    document.querySelectorAll('[data-js="parallax"]').forEach((box) => {
      const img = box.querySelector(":scope > .rl-par");
      if (!img) return;
      const o = Math.max(0, parseFloat(box.dataset.parallaxSpeed ?? "0.15")) * -100;
      img.style.willChange = "transform";
      anime.animate(img, { y: [`${o}%`, `${-o}%`], ease: "linear", duration: 1000, autoplay: anime.onScroll({ target: box, sync: true }) });
    });
  }

  // ───────── Photo slider — Embla 8.6.0 loop, on desktop the flipped panel aligns to the end ─────────
  RL.sliders = [...document.querySelectorAll(".rl-slider")].map((s) => {
    const vp = s.querySelector(".rl-slider__viewport");
    const slides = [...s.querySelectorAll(".rl-slider__slide")];
    const counter = s.querySelector(".rl-slider__counter");
    const caption = s.querySelector(".rl-slider__caption");
    const pad = (n) => String(n).padStart(2, "0");
    let embla;
    const invert = () => s.dataset.pcLayout === "invert" && desktop.matches;
    const sync = () => {
      const i = embla.selectedScrollSnap();
      counter.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
      if (caption) caption.textContent = slides[i]?.dataset.caption || "";
    };
    const init = () => {
      embla?.destroy();
      embla = EmblaCarousel(vp, { loop: true, align: invert() ? "end" : "start" });
      if (invert()) embla.scrollTo(slides.length - 1, true);
      embla.on("select", sync);
      embla.on("reInit", sync);
      sync();
    };
    if (window.EmblaCarousel) init();
    desktop.addEventListener("change", init);
    s.querySelector(".rl-slider__prev")?.addEventListener("click", () => (invert() ? embla.scrollNext() : embla.scrollPrev()));
    s.querySelector(".rl-slider__next")?.addEventListener("click", () => (invert() ? embla.scrollPrev() : embla.scrollNext()));
    return () => embla;
  });

  // ───────── First loading (first page) — the original counts 1s after the island wakes (about .57s) and then sends the end signal. The first screen starts at that moment,
  // The loading panel drops out all at once after .4s (measured, the screen barely changes meanwhile — the hero is already open .4s beneath the panel) ─────────
  const splash = document.querySelector(".rl-splash");
  if (splash) {
    splash.innerHTML = `<div class="rl-splash__logo">${logo()}</div>`;
    // Measured, the original signals about 1.5s after the screen is painted, so count from when this script runs
    const WAKE = 1500, OUT = 400;
    setTimeout(() => {
      window.dispatchEvent(new Event("rl:splash-end"));
      root.classList.remove("is-splash-screen-show");
      setTimeout(() => splash.remove(), reduce ? 0 : OUT);
    }, reduce ? 0 : WAKE);
  }

  // ───────── Page transition — on entering, lifts the cover, pressing an inner link covers for .5s and then navigates ─────────
  const overlay = document.querySelector(".rl-transition");
  // It has to paint once while covered before uncovering so the .5s reveal is visible (the original is a heavy document, so this happens on its own)
  // The original is a heavy document, so the covering screen starts to lift about .17s after it is drawn — the light copy waits .15s after the document is up to get the same look
  const reveal = () => setTimeout(() => requestAnimationFrame(() => root.classList.remove("is-page-entering")), 150);
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", reveal, { once: true }); else reveal();
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("is-page-leaving", "is-page-entering"); leaving = false; });
  let leaving = false;
  const dur = overlay ? parseFloat(getComputedStyle(overlay).getPropertyValue("--page-transition-duration")) * 1000 || 500 : 500;
  document.addEventListener(
    "click",
    (e) => {
      if (leaving) { e.preventDefault(); return; }
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const href = a.getAttribute("href");
      if (!href || /^(mailto:|tel:|javascript:)/i.test(href) || href.startsWith("#")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin && u.protocol !== "file:") return;
      if (u.pathname === location.pathname && u.hash) return;
      if (u.href === location.href) return;
      e.preventDefault();
      leaving = true;
      root.classList.remove("is-page-entering");
      root.classList.add("is-page-leaving");
      let gone = false;
      const go = () => { if (!gone) { gone = true; location.href = u.href; } };
      const end = (ev) => { if (ev.propertyName === "opacity") { overlay.removeEventListener("transitionend", end); go(); } };
      overlay?.addEventListener("transitionend", end);
      setTimeout(go, dur + 150);
    },
    { capture: true },
  );
})();
