// Shared by all pages: draws the header, phone menu and the footer laid behind in one place, and hooks up smooth scroll, header hide, footer reveal, text mask and page transitions.
// Original values: Lenis duration 1.2 expo · header hides after scrolling past 80px · footer photo 1→1.1 (phone 1.3) · wordmark y120→0 over 0.9vh at the end
//           Title letters at 50ms intervals .6s cubic-bezier(.22,1,.36,1) · scroll reveal 2.3s power1.out · page-turn white veil .65s, movement 650ms later
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const YK = (window.YK = { reduced, lenis: null });
  const isSp = () => matchMedia("(max-width: 767px)").matches;

  // Newly drawn placeholder lettering logo in the same spot and proportions as the original wordmark
  const logo = (h = 22) =>
    `<svg viewBox="0 0 168 22" style="height:${h}px" aria-hidden="true"><text x="0" y="19" textLength="168" lengthAdjust="spacingAndGlyphs" font-family="Marcellus, Georgia, serif" font-size="22" fill="currentColor">WO RD MA RK</text></svg>`;
  const igIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2.5" y="2.5" width="15" height="15" rx="4.5"/><circle cx="10" cy="10" r="3.6"/><circle cx="14.6" cy="5.4" r=".6" fill="currentColor"/></svg>';
  const shopIcon = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 6.5h12l-1 11H5z"/><path d="M7.2 6.5V5a2.8 2.8 0 0 1 5.6 0v1.5"/></svg>';
  const xIcon = '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M7.1 5.1 11.5 0h-1L6.6 4.4 3.6 0H0l4.6 6.7L0 12h1l4-4.6 3.2 4.6H12z"/></svg>';
  const fbIcon = '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M7 12V6.6h1.8l.3-2.1H7V3.2c0-.6.2-1 1-1h1.1V.3C8.9.2 8.3.1 7.6.1 6.1.1 5 1 5 2.8v1.7H3.2v2.1H5V12z"/></svg>';
  YK.icons = { igIcon, shopIcon, xIcon, fbIcon };

  const menu = [
    ["TOP", "index.html", "home"],
    ["COLLECTION", "product.html", "product"],
    ["COLLABORATION", "product.html#collab", "-"],
    ["NEWS", "news.html", "news"],
    ["CONTACT", "#contact", "-"],
  ];
  const cur = (k) => (k === page || (k === "news" && page === "article") ? " is-current" : "");
  const pills = `<a class="yk-pill is-ig" href="#ig" aria-label="SNS">${igIcon}<span>IG</span></a><a class="yk-pill" href="#shop">${shopIcon}<span>ONLINE SHOP</span></a>`;
  const share = (cls = "") => `<div class="yk-share ${cls}"><p class="yk-share__label">SHARE</p><ul class="yk-share__list"><li><a class="yk-share__btn" href="#share-x" aria-label="X Share">${xIcon}</a></li><li><a class="yk-share__btn" href="#share-fb" aria-label="Social share">${fbIcon}</a></li></ul></div>`;
  YK.share = share;

  document.body.insertAdjacentHTML("afterbegin", '<div class="yk-overlay" aria-hidden="true"></div>');
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("yk-head");
    head.innerHTML = `
      <div class="yk-head__inner">
        <a class="yk-logo" href="index.html" aria-label="Home">${logo()}</a>
        <nav class="yk-nav" aria-label="Main menu"><p>${menu.map(([t, h, k]) => `<a class="yk-ul${cur(k)}" href="${h}">${t}</a>`).join("<span>&nbsp;/</span>")}</p></nav>
        <div class="yk-actions">${pills}</div>
        <button class="yk-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i><i></i><i></i></button>
      </div>
      <div class="yk-sp" data-slot="mobile-menu">
        <div class="yk-sp__backdrop" aria-hidden="true"></div>
        <nav class="yk-sp__nav"><ul>${menu.map(([t, h, k]) => `<li><a class="yk-ul${cur(k)}" href="${h}">${t}</a></li>`).join("")}<li>${share()}</li></ul></nav>
        <div class="yk-sp__foot">${pills}</div>
        <div class="yk-sp__veil" aria-hidden="true"></div>
      </div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("yk-foot");
    foot.id = "contact";
    foot.innerHTML = `
      <div class="yk-foot__bg"><div class="wf-img wf-dark" data-label="Shot of a submerged hand holding up a product · bluish water light · full landscape view from above"></div></div>
      <div class="yk-foot__inner">
        <div class="yk-foot__top"><a class="yk-logo" href="index.html" aria-label="Home">${logo(28)}</a><div class="yk-actions">${pills}</div></div>
        <nav class="yk-foot__nav"><ul>${menu.map(([t, h, k]) => `<li><a class="yk-ul${cur(k)}" href="${h}">${t}</a></li>`).join("")}</ul></nav>
        ${share("is-foot")}
        <p class="yk-foot__copy" data-label="Your company English name here">Copyright © 0000 company co., ltd.</p>
      </div>`;
    foot.insertAdjacentHTML(
      "afterend",
      `<a class="yk-foot__mark" href="index.html" aria-label="Back to top" data-slot="footer-wordmark"><svg viewBox="0 0 1360 190" aria-hidden="true"><text x="0" y="170" textLength="1360" lengthAdjust="spacingAndGlyphs" font-family="Marcellus, Georgia, serif" font-size="210" fill="currentColor">WO RD MA RK</text></svg></a>`
    );
  }

  // ── Smooth scroll ──
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: "vertical", smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2 });
    YK.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const onScroll = (fn) => (YK.lenis ? YK.lenis.on("scroll", () => fn(scrollY)) : addEventListener("scroll", () => fn(scrollY), { passive: true }));

  // ── Header hide · footer photo zoom · wordmark rise ──
  const main = document.querySelector("main");
  const bgImg = document.querySelector(".yk-foot__bg .wf-img");
  const mark = document.querySelector(".yk-foot__mark");
  const markSvg = mark && mark.querySelector("svg");
  let last = 0;
  const sync = (s) => {
    const vh = innerHeight;
    const t = main ? Math.max(0, Math.min(1, (vh - main.getBoundingClientRect().bottom) / vh)) : 0;
    if (bgImg) bgImg.style.transform = `scale(${1 + t * (isSp() ? 0.3 : 0.1)})`;
    if (head && !head.classList.contains("is-menu")) {
      if (!isSp()) head.classList.toggle("is-hidden", t > 0.05 || (s > last && s > 80));
      else {
        const d = s - last;
        if (s <= 80 || d < -1.5) head.classList.remove("is-hidden");
        else if (d > 1.5) head.classList.add("is-hidden");
      }
    }
    last = s;
    if (markSvg) {
      const docH = document.documentElement.scrollHeight - vh;
      const pv = Math.max(0, Math.min(1, (vh * 0.9 - Math.max(0, docH - s)) / (vh * 0.9)));
      mark.classList.toggle("is-active", pv > 0.05);
      markSvg.style.opacity = pv;
      markSvg.style.transform = `translateY(${(1 - pv) * 120}px)`;
    }
    if (YK.onScroll) YK.onScroll(s);
  };
  onScroll(sync);
  addEventListener("load", () => sync(scrollY));
  requestAnimationFrame(() => sync(scrollY));

  // ── Phone menu ──
  const burger = document.querySelector(".yk-burger");
  const sp = document.querySelector(".yk-sp");
  const closeMenu = () => {
    burger.setAttribute("aria-expanded", "false");
    head.classList.remove("is-menu");
    sp.classList.add("is-closing");
    sp.classList.remove("is-revealed");
    YK.lenis && YK.lenis.start();
    setTimeout(() => sp.classList.remove("is-open", "is-closing"), 260);
  };
  burger &&
    burger.addEventListener("click", () => {
      if (burger.getAttribute("aria-expanded") === "true") return closeMenu();
      burger.setAttribute("aria-expanded", "true");
      head.classList.add("is-menu");
      head.classList.remove("is-hidden");
      sp.classList.remove("is-closing");
      sp.classList.add("is-open");
      YK.lenis && YK.lenis.stop();
      requestAnimationFrame(() => sp.classList.add("is-revealed"));
    });

  // ── Letter split: inside the mask, 110% below → in place ──
  YK.split = (el, step = 50) => {
    let i = 0;
    const walk = (node, into) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          [...n.textContent.replace(/\s+/g, " ")].forEach((ch) => {
            if (ch === " ") return into.append(" ");
            const m = document.createElement("span");
            m.className = "char-mask";
            const c = document.createElement("span");
            c.className = "char-inner";
            c.textContent = ch;
            c.style.transitionDelay = i++ * step + "ms";
            m.append(c);
            into.append(m);
          });
        } else if (n.nodeName === "BR") into.append(document.createElement("br"));
        else {
          const shell = n.cloneNode(false);
          walk(n, shell);
          into.append(shell);
        }
      });
    };
    const frag = document.createDocumentFragment();
    walk(el, frag);
    el.textContent = "";
    el.append(frag);
    return el.querySelectorAll(".char-inner");
  };
  // Section titles (88%) and NEXT links (85%) appear once when visible
  document.querySelectorAll("[data-chars]").forEach((el) => {
    YK.split(el, 50);
    if (reduced) return el.classList.add("is-revealed");
    ScrollTrigger.create({ trigger: el, start: el.dataset.chars === "next" ? "top 85%" : "top 88%", once: true, onEnter: () => el.classList.add("is-revealed") });
  });
  // Scroll reveal: transparent → 2.3s power1.out
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (reduced) return;
    gsap.set(el, { autoAlpha: 0 });
    ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => gsap.to(el, { autoAlpha: 1, duration: 2.3, ease: "power1.out" }) });
  });

  // ── On enter: white curtain lifts → big title letters at .075s intervals → body blocks fade at .06s intervals ──
  const overlay = document.querySelector(".yk-overlay");
  const title = document.querySelector(".js-title-anim");
  if (title) {
    let i = 0, pause = 0, brs = 0;
    const put = (ch, into) => {
      const w = document.createElement("span");
      w.className = "char-wrap";
      const c = document.createElement("span");
      c.className = "char";
      c.style.transitionDelay = `${i++ * 0.075 + pause}s`;
      c.textContent = ch === " " ? " " : ch;
      w.append(c);
      into.append(w);
    };
    const nodes = [...title.childNodes];
    title.textContent = "";
    nodes.forEach((n) => {
      if (n.nodeType === 3) [...n.textContent.replace(/\s+/g, " ").trim()].forEach((ch) => put(ch, title));
      else if (n.nodeName === "BR") { title.append(document.createElement("br")); if (++brs === 1) pause += 0.5; }
    });
  }
  if (main)
    [...main.children].forEach((el) => {
      if (el.hasAttribute("data-no-fade")) return;
      if (!title || !el.contains(title)) return el.classList.add("js-fade");
      [...el.children].forEach((c) => !c.contains(title) && c.classList.add("js-fade"));
    });
  if (title) [...title.parentElement.children].forEach((el) => { if (el !== title) el.classList.add("js-fade"); });
  requestAnimationFrame(() => overlay.classList.add("is-hidden"));
  setTimeout(() => document.querySelectorAll(".char").forEach((c) => c.classList.add("is-visible")), 150);
  setTimeout(() => document.querySelectorAll(".js-fade").forEach((el, i) => { el.style.transitionDelay = `${i * 0.06}s`; el.classList.add("is-visible"); }), 350);

  // ── On exit: white curtain + blur only between our own pages, move after 650ms ──
  let leaving = false;
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || /^(mailto|tel|javascript|https?):/i.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    if (leaving) return;
    leaving = true;
    if (!document.querySelector(".hero") && /(^|\/)(index\.html)?$/.test(url.pathname)) try { sessionStorage.setItem("yk-intro-skip", "1"); } catch (err) {}
    if (sp && sp.classList.contains("is-open")) closeMenu();
    if (reduced) return (location.href = url.href);
    overlay.classList.remove("is-hidden");
    document.body.classList.add("is-leaving");
    setTimeout(() => (location.href = url.href), 650);
  }, true);
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    document.body.classList.remove("is-leaving");
    requestAnimationFrame(() => overlay.classList.add("is-hidden"));
  });
})();
