// Common to all pages: hooks up header nav, phone menu drawer, footer, page top, split-text reveal, Studio-style reveal, modal and page transition in one place.
// Original values: letter appear .25s power1.out stagger .02 (paragraph)/.05 (large title) · revert .15s power1.in · page top shows in .4s after scrolling down one screen and hides in .3s at Footer.
// Text splitting is the same SplitType 0.3.4 (lines, chars) as the original — overflow is clipped per line, and punctuation is bound to the preceding character so it never starts a line.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const page = document.body.dataset.page || "home";
  const T7 = (window.T7 = {});
  const mm = gsap.matchMedia();
  T7.mm = mm;

  const arrow = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 5h8M5.5 1.5 9 5 5.5 8.5"/></svg>';
  const cross = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m2 2 12 12M14 2 2 14"/></svg>';
  // A placeholder with the same silhouette in place of the original logo (a number + a purple slash drawn diagonally downward) — the text is swapped when used
  const logo = (ink = "currentColor", slash = "var(--site-iso-v3)") =>
    `<svg viewBox="0 0 136 150" aria-label="Logo slot"><text x="0" y="56" fill="${ink}" style="font-family: var(--site-font-latin)" font-weight="300" font-size="64" letter-spacing="-3">000</text><path d="M131 8 74 146" stroke="${slash}" stroke-width="5"/><path d="M110 12h21" stroke="${ink}" stroke-width="5"/></svg>`;
  T7.icons = { arrow, cross, logo };
  let appearOne = (el) => el.classList.add("is-in");
  T7.dot = (ring) => `<span class="t7-dot${ring ? " is-ring" : ""}">${arrow}</span>`;

  const menu = [
    ["Business details", "index.html#business"],
    ["Company overview", "index.html#company"],
    ["News", "news.html", "news"],
    ["Hiring Info", "index.html#recruit"],
    ["Inquiry", "index.html#contact"],
  ];
  const cur = (k) => (k && (k === page || (k === "news" && page === "detail")) ? " is-current" : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("t7-header");
    const crumb = head.dataset.crumb;
    head.innerHTML = `
      <a class="t7-logo" href="index.html">${logo()}</a>
      <nav class="t7-nav" aria-label="Main menu">${menu.map(([t, h, k]) => `<a class="${cur(k)}" href="${h}">${t}</a>`).join("")}</nav>
      ${crumb ? `<div class="t7-crumb"><a href="index.html">TOP</a><span>/</span>${crumb}</div>` : ""}`;
    head.insertAdjacentHTML(
      "afterend",
      `<button class="t7-burger" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button>
      <div class="t7-menu" data-slot="menu-drawer">
        <div class="t7-menu__veil"></div>
        <div class="t7-menu__panel">
          <a class="t7-logo" href="index.html">${logo()}</a>
          <nav>${menu.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</nav>
        </div>
      </div>
      <a class="t7-top" href="#" aria-label="Back to top" data-slot="page-top"><span class="t7-top__line"></span><span class="t7-top__dot"></span><p>Page Top</p></a>`
    );
    const root = document.documentElement;
    const toggle = (open) => root.classList.toggle("is-menu", open);
    document.querySelector(".t7-burger").addEventListener("click", () => toggle(!root.classList.contains("is-menu")));
    document.querySelector(".t7-menu__veil").addEventListener("click", () => toggle(false));
    document.querySelectorAll(".t7-menu nav a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("t7-foot");
    foot.innerHTML = `
      <div class="t7-foot__in">
        <a class="t7-foot__logo" href="index.html">${logo("currentColor", "currentColor")}</a>
        <div class="t7-foot__right">
          <div class="t7-foot__cols">
            <ul>
              <li><a class="t7-foot__u" href="index.html#business">Business details</a></li>
              <li class="is-sub"><a class="t7-foot__s" href="#">Service 1</a></li>
              <li><a class="t7-foot__s" href="#">Service 2</a></li>
              <li><a class="t7-foot__s" href="#">Service 3</a></li>
            </ul>
            <ul>
              <li><a class="t7-foot__u" href="index.html#company">Company overview</a></li>
              <li><a class="t7-foot__u" href="news.html">News</a></li>
              <li><a class="t7-foot__u" href="index.html#recruit">Hiring Info</a></li>
            </ul>
          </div>
          <div class="t7-foot__legal"><a href="#">Privacy policy</a><small>© 0000 Company Inc. All Rights Reserved.</small></div>
        </div>
      </div>`;
  }

  // Fills the pill button and dot icon slots — HTML only carries data-dot
  document.querySelectorAll("[data-dot]").forEach((el) => el.insertAdjacentHTML("beforeend", T7.dot(el.dataset.dot === "ring")));
  // Also put the arrow that appears on hover into the corner ring of card and news rows
  document.querySelectorAll(".t7-dot:empty").forEach((el) => (el.innerHTML = arrow));

  // ── Window (Modal) ──
  T7.modal = (html) => {
    const m = document.createElement("div");
    m.className = "t7-modal";
    m.innerHTML = `<div class="t7-modal__veil"></div><div class="t7-modal__card" role="dialog" aria-modal="true"><button class="t7-modal__x" type="button" aria-label="Close">${cross}</button>${html}</div>`;
    document.body.append(m);
    requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add("is-open")));
    const close = () => {
      m.classList.remove("is-open");
      removeEventListener("keydown", onKey);
      setTimeout(() => m.remove(), 400);
    };
    const onKey = (e) => e.key === "Escape" && close();
    addEventListener("keydown", onKey);
    m.querySelector(".t7-modal__x").addEventListener("click", close);
    m.querySelector(".t7-modal__veil").addEventListener("click", close);
  };

  // ── Split-text reveal (original textReveal) ──
  const KINSOKU = /[、。,.!！?？）)」』】〉》…ー～]/;
  T7.split = (el) => {
    if (!el._split) {
      el.style.overflow = "hidden";
      el._split = new SplitType(el, { types: "lines, chars" });
      const ch = el._split.chars;
      for (let k = ch.length - 1; k > 0; k--) {
        if (!KINSOKU.test(ch[k].textContent)) continue;
        const w = document.createElement("span");
        w.style.whiteSpace = "nowrap";
        ch[k - 1].before(w);
        w.append(ch[k - 1], ch[k]);
      }
      (el._split.lines || []).forEach((line) => { line.style.overflow = "hidden"; line.style.display = "block"; });
      el.classList.add("t7-reveal");
    }
    return el._split.chars;
  };
  T7.reveal = (el, show, stagger = 0.02) => {
    if (!el) return;
    const chars = T7.split(el);
    if (show) {
      gsap.set(chars, { opacity: 0 });
      gsap.to(chars, { opacity: 1, duration: 0.25, stagger, ease: "power1.out", overwrite: true });
    } else {
      gsap.to(chars, { opacity: 0, duration: 0.15, stagger, ease: "power1.in", overwrite: true });
    }
  };
  // Original textBlink: wraps each character in a span, 0.05s apart in shuffled order, brightness 0%→200%→100% blinking once
  T7.blink = (el) => {
    if (!el._blink) {
      el.innerHTML = [...el.textContent].map((c) => `<span class="t7-ch">${c}</span>`).join("");
      el._blink = [...el.querySelectorAll(".t7-ch")];
      el.classList.add("t7-blink");
    }
    const chars = el._blink;
    gsap.set(chars, { opacity: 0.5, filter: "brightness(0%)" });
    gsap.utils.shuffle(chars.slice()).forEach((c, i) => {
      gsap.to(c, { opacity: 1, filter: "brightness(200%)", repeat: 1, yoyo: true, duration: 0.15, delay: i * 0.05,
        onComplete: () => gsap.set(c, { opacity: 1, filter: "brightness(100%)" }) });
    });
  };

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Past the 80% line of the screen, letters light up one by one, and turn off when going back
    document.querySelectorAll("[data-reveal]").forEach((wrap) => {
      const targets = wrap.matches("h2,h3,p") ? [wrap] : [...wrap.querySelectorAll("h2,h3,p")];
      targets.forEach((el) => gsap.set(T7.split(el), { opacity: 0 }));
      ScrollTrigger.create({
        trigger: wrap,
        start: "top 80%",
        onEnter: () => targets.forEach((el) => T7.reveal(el, true)),
        onLeaveBack: () => targets.forEach((el) => T7.reveal(el, false)),
      });
    });

    // Original Studio appear is an IntersectionObserver with no margin — it turns on if even one pixel enters
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }));
    appearOne = (el) => {
      if (/^[\d.]+$/.test(el.dataset.appear)) el.style.setProperty("--d", el.dataset.appear + "s");
      io.observe(el);
    };
    document.querySelectorAll("[data-appear]").forEach(appearOne);

    // Page top: appears after scrolling one screen down, hides when the footer shows. White over dark sections
    const top = document.querySelector(".t7-top");
    if (top) {
      // On short pages you cannot scroll down a full screen, so it stays hidden to the end. Measure directly so the start point is not pulled to the scroll end.
      const f = document.querySelector('[data-slot="footer"]');
      let shown = false;
      const sync = () => {
        const atFoot = f && f.getBoundingClientRect().top < innerHeight;
        const show = scrollY > innerHeight && !atFoot;
        if (show === shown) return;
        shown = show;
        gsap.to(top, { autoAlpha: show ? 1 : 0, duration: atFoot ? 0.3 : 0.4, ease: show ? "power2.out" : "power2.in", overwrite: true });
        top.style.pointerEvents = show ? "auto" : "none";
      };
      addEventListener("scroll", sync, { passive: true });
      const color = () => {
        const r = top.getBoundingClientRect();
        top.style.pointerEvents = "none";
        const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        top.style.pointerEvents = "";
        top.classList.toggle("is-white", !!(el && el.closest("[data-dark]")));
      };
      addEventListener("scroll", color, { passive: true });
      color();
      top.addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); });
    }
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll("[data-appear]").forEach((el) => el.classList.add("is-in"));
  });
  // Elements made later (such as clones of the history strip) also get the same entrance
  T7.appear = (root) => [root, ...root.querySelectorAll("[data-appear]")].forEach((el) => el.matches("[data-appear]") && appearOne(el));

  // Page transition: the original is a single-page app so the next page stands immediately with no curtain, and that page’s entrance (.appear) becomes the transition
})();
