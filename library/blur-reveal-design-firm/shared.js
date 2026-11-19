// Spanning several pages of Brand — draws header, footer and full-screen menu in one place, with Lenis smooth scroll (lerp .2 · wheel 1.2x),
// Scrolling down past 150px hides the header, [data-animate] entrances (70ms stagger), Barba 2.10.3 transitions (cover on in .25s, off in .3s after a .2s delay).
// What differs per section lives in NS.views[namespace] = { init(container), destroy() } Receive it as is, and Barba removes it when swapping the body and re-attaches it
(() => {
  const NS = (window.NS = window.NS || { views: {} });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const MAIN = [["works.html", "Projects", "works"], ["about.html", "About", "about"], ["service.html", "Service", "service"], ["index.html#inspirations", "Inspirations", "inspirations"], ["news.html", "News", "news"], ["#contact", "Contact", "contact"]];
  const SUB = [["recruit.html", "Recruit", "recruit"], ["#faq", "Faq", "faq"], ["#download", "Download", "download"]];
  const SNS = ["SNS 1", "SNS 2", "SNS 3", "SNS 4"];
  const logo = (cls) => `<a class="${cls}" href="index.html" aria-label="First Page"><span class="ns-logo__mark" data-label="Company English wordmark">NAME</span><span class="ns-logo__desc">Branding<br>Art Direction</span></a>`;
  // Per link _<Name> Class — can be picked and measured per item like the original (there is a tool that measures only one when they share the same Type)
  const list = (items, here, pre) => items.map(([h, t, k]) => `<li><a class="${pre}-link _${k}" href="${h}"${k === here ? ' aria-current="page"' : ""}>${t}</a></li>`).join("");
  const typeset = (title) => `<h3>${title}</h3><button class="ns-typeset" type="button" data-fx="typeset-toggle" aria-label="Swap the type board"><span class="ns-typeset__serif">Studio Serif</span><span class="ns-typeset__pill"></span><span class="ns-typeset__grot">Studio Grotesk</span></button>`;

  // Inside the section (what the page-transition library swaps in) — header and footer
  const paint = (c) => {
    const here = c.dataset.barbaNamespace;
    const head = $('[data-ns="header"]', c);
    if (head && !head.childElementCount) {
      head.className = "ns-header";
      head.innerHTML = `<div class="ns-header__in"><p class="ns-logo">${logo("ns-logo__link")}</p><nav class="ns-hnav" aria-label="Main menu"><ul>${list(MAIN, here, "ns-h")}</ul></nav></div>`;
    }
    const foot = $('[data-ns="footer"]', c);
    if (foot && !foot.childElementCount) {
      foot.className = "ns-footer";
      foot.innerHTML = `<div class="ns-footer__in">
        <p class="ns-footer__logo">${logo("ns-logo__link")}</p>
        <div class="ns-fnav-wrap"><nav class="ns-fnav" aria-label="Footer Menu"><ul>${list(MAIN, here, "ns-f")}</ul></nav><nav class="ns-fsub" aria-label="Footer small menu"><ul>${list(SUB, here, "ns-fs")}</ul></nav></div>
        <div class="ns-fside"><nav class="ns-fsns"><h2>SNS</h2><ul>${SNS.map((s) => `<li><a class="ns-sns-link" href="#">${s}</a></li>`).join("")}</ul></nav>
        <div class="ns-faccess"><h2>Access</h2><p><a href="#">0-0-0 Street Name<br>City Name, Tokyo<br>000-0000<br>Japan</a></p></div></div>
        <div class="ns-ftype">${typeset("Typesetting")}</div>
      </div>`;
    }
  };

  // Work grid cells — 20 on the home page and 20 in the work list (20 more per See more). One vertical 230:409 photo
  const WORKS = ["Person in the kitchen · Natural window light", "Person in front of a fridge · bright interior", "Same box package grid · White background", "Black-and-white portrait frame · Gray wall", "Typeface specimen sheet · White background",
    "Black signage symbol · front view", "Leaf vein close-up · Green", "Brush calligraphy logo · White paper", "Picture book cover · yellow", "Glass bottle · sky-blue mist",
    "Spray bottle · blue background", "Cream jar · Pink base", "White building exterior · tree shade", "Logo engraving · Brown tone", "Hand on fabric · cloudy sky",
    "Two figures on a hill · Evening", "Logo · White plate", "Wooden box · warm lighting", "Two packages · Beige background", "Person holding a cup · black clothes"];
  NS.workItems = (n, from = 0) => Array.from({ length: n }, (_, i) =>
    `<div class="ns-works__item" data-animate><a class="ns-works__link" href="#"><span class="ns-pic"><span class="wf-img" data-label="${WORKS[(from + i) % WORKS.length]} · Portrait 9:16"></span></span></a></div>`).join("");
  const fillWorks = (c) => $$("[data-works]", c).forEach((g) => { if (!g.childElementCount) g.innerHTML = NS.workItems(+g.dataset.works); });

  // Outside the sections (always unchanged) — two-line button · full-screen menu · transition cover
  const chrome = () => {
    if ($(".ns-burger")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <button class="ns-burger" type="button" aria-label="Open Menu" aria-expanded="false" data-slot="menu-button"><i></i><i></i></button>
      <div class="ns-nav" data-slot="nav-overlay" aria-hidden="true">
        <div class="ns-nav__scroll"><div class="ns-nav__in">
          <div class="ns-nav__group"><nav class="ns-nav__main" aria-label="Full-screen menu"><ul></ul></nav><nav class="ns-nav__sub"><ul></ul></nav></div>
          <div class="ns-nav__type"><div>${typeset("Typesetting")}</div><div><h3>Studio Playlist</h3><p>Your playlist name here</p></div></div>
        </div></div>
        <div class="ns-nav__sns">${SNS.map((s) => `<a href="#">${s}</a>`).join("")}</div>
        <div class="ns-nav__bg"></div>
      </div>
      <div class="ns-overlay" aria-hidden="true"></div>`);
  };
  const markNav = (here) => {
    $(".ns-nav__main ul").innerHTML = list(MAIN, here, "ns-n");
    $(".ns-nav__sub ul").innerHTML = list(SUB, here, "ns-ns");
  };

  // Fullscreen menu — open: attach the panel and button step1, step2 after .2s, html.is-opened-navigation 20ms later. Close: step2→step1, release after .1s and detach the panel .2s later
  let busy = false;
  const btn = () => $(".ns-burger"), nav = () => $(".ns-nav");
  const open = () => {
    nav().style.display = "block";
    nav().setAttribute("aria-hidden", "false");
    btn().classList.add("step1");
    btn().setAttribute("aria-expanded", "true");
    setTimeout(() => { btn().classList.remove("step1"); btn().classList.add("step2"); busy = false; }, 200);
    setTimeout(() => html.classList.add("is-opened-navigation"), 20);
    NS.lenis?.stop();
  };
  const close = () => {
    if (!html.classList.contains("is-opened-navigation")) return;
    btn().classList.remove("step2");
    btn().classList.add("step1");
    btn().setAttribute("aria-expanded", "false");
    setTimeout(() => { btn().classList.remove("step1"); busy = false; }, 100);
    html.classList.remove("is-opened-navigation");
    setTimeout(() => { nav().style.display = "none"; nav().setAttribute("aria-hidden", "true"); }, 200);
    NS.lenis?.start();
  };
  // On slide change, hide immediately without button bending (original navigation.hide)
  const hide = () => {
    if (!html.classList.contains("is-opened-navigation")) return;
    btn().classList.remove("step2");
    html.classList.remove("is-opened-navigation");
    setTimeout(() => { nav().style.display = "none"; }, 200);
    NS.lenis?.start();
  };
  NS.closeNav = close;

  // Smooth scroll — original Lenis 1.3.27 { smoothWheel, lerp .2, wheelMultiplier 1.2, touchMultiplier 1.2 }
  const smooth = () => {
    if (!window.Lenis || reduce) return;
    NS.lenis = new Lenis({ smoothWheel: true, lerp: 0.2, wheelMultiplier: 1.2, touchMultiplier: 1.2, autoResize: true });
    const raf = (t) => { NS.lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  };

  // Header hide — measures every 200ms and adds is-hidden when scrolling down past 150px
  let lastY = 0, hideTimer = 0;
  const onScroll = () => {
    if (hideTimer) return;
    hideTimer = setTimeout(() => {
      hideTimer = 0;
      const y = scrollY, head = $(".ns-header");
      if (head) head.classList.toggle("is-hidden", y > lastY && y > 150);
      lastY = y;
    }, 200);
  };

  // [data-animate=""] — when it enters 100px below the screen bottom, active is added in 70ms steps within the same group
  let io = null;
  const animate = (c) => {
    io?.disconnect();
    if (reduce) { $$('[data-animate=""]', c).forEach((n) => n.setAttribute("data-animate", "active")); return; }
    io = new IntersectionObserver((es) => es.forEach((e, n) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.setAttribute("data-animate", "active"), n * 70);
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px 100px 0px" });
    $$('[data-animate=""]', c).forEach((n) => io.observe(n));
  };
  NS.watchAnimate = (root) => $$('[data-animate=""]', root).forEach((n) => io?.observe(n));

  // In-page #links — roll over (1000 + distance/6)ms with power3.inOut (original pageScroll)
  const anchor = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = $(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const y = Math.min(t.getBoundingClientRect().top + scrollY, document.documentElement.scrollHeight - innerHeight);
    const d = reduce ? 0 : (1000 + Math.floor(Math.abs(y) / 6)) / 1000;
    if (NS.lenis) NS.lenis.scrollTo(y, { duration: d, easing: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2) });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  };

  let current = null;
  const enter = (c) => {
    paint(c);
    fillWorks(c);
    markNav(c.dataset.barbaNamespace);
    current = NS.views[c.dataset.barbaNamespace];
    current?.init?.(c);
    animate(c);
  };
  const leave = () => { current?.destroy?.(); current = null; io?.disconnect(); };

  // Barba — load the next section’s css and js that aren’t there yet (three and swiper differ per section)
  const loadCss = async (doc) => {
    const has = (sel, attr, v) => $$(sel).some((n) => n.getAttribute(attr) === v);
    const css = $$('link[rel="stylesheet"]', doc).map((l) => l.getAttribute("href")).filter((h) => !has('link[rel="stylesheet"]', "href", h));
    await Promise.all(css.map((h) => new Promise((r) => { const n = document.createElement("link"); n.rel = "stylesheet"; n.href = h; n.onload = n.onerror = r; document.head.append(n); })));
    document.body.className = doc.body.className;
  };
  const loadJs = async (doc) => {
    const has = (v) => $$("script[src]").some((n) => n.getAttribute("src") === v);
    const js = $$("script[src]", doc).map((s) => s.getAttribute("src")).filter((s) => !has(s));
    for (const s of js) {
      // three is the npm three.cjs build, so set up an exports container beforehand and move it to THREE after loading (same job as the inline scripts before and after the section html)
      const cjs = /three\.cjs$/.test(s);
      if (cjs) window.exports = {};
      await new Promise((r) => { const n = document.createElement("script"); n.src = s; n.onload = n.onerror = r; document.body.append(n); });
      if (cjs) { window.THREE = window.exports; delete window.exports; }
    }
    return js.length > 0;
  };
  const overlay = () => $(".ns-overlay");
  const fadeIn = () => new Promise((r) => {
    gsap.set(overlay(), { display: "block", opacity: 0 });
    gsap.to(overlay(), { opacity: 1, duration: reduce ? 0 : 0.25, ease: "power1.inOut", onComplete: r });
  });
  const fadeOut = () => gsap.to(overlay(), { opacity: 0, duration: reduce ? 0 : 0.3, ease: "none", delay: reduce ? 0 : 0.2, onComplete: () => gsap.set(overlay(), { clearProps: "all" }) });

  const boot = () => {
    chrome();
    smooth();
    $(".ns-burger").addEventListener("click", (e) => { e.preventDefault(); if (busy) return; busy = true; html.classList.contains("is-opened-navigation") ? close() : open(); });
    $(".ns-nav__bg").addEventListener("click", close);
    $(".ns-nav").addEventListener("click", (e) => { if (e.target.closest("a")) hide(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", anchor);
    enter($('[data-barba="container"]'));

    if (window.barba && location.protocol !== "file:") {
      barba.init({
        debug: false,
        timeout: 14000,
        transitions: [{
          before: () => (reduce ? Promise.resolve() : fadeIn()),
          beforeLeave: () => { hide(); leave(); },
          leave: (data) => { const c = data.current.container; while (c.firstChild) c.removeChild(c.firstChild); },
          async after(data) {
            const doc = new DOMParser().parseFromString(data.next.html, "text/html");
            const c = data.next.container;
            await loadCss(doc);
            window.scrollTo(0, 0);
            NS.lenis?.resize();
            NS.lenis?.scrollTo(0, { immediate: true });
            paint(c);
            fillWorks(c);
            markNav(c.dataset.barbaNamespace);
            fadeOut();
            // The new section’s parts already tried to attach when the body arrived — if something like three or swiper loaded late, detach and attach again
            if (await loadJs(doc)) {
              const parts = [...c.querySelectorAll("[data-fx]")].map((n) => [n, n.getAttribute("data-fx")]);
              parts.forEach(([n]) => n.setAttribute("data-fx", ""));
              await new Promise((r) => requestAnimationFrame(r));
              parts.forEach(([n, v]) => n.setAttribute("data-fx", v));
            }
            enter(c);
          },
        }],
      });
      return;
    }
    // Opened via file://, barba can’t fetch the next page — turn on the same cover, swap the document, then turn it off .2s late on the new page
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || a.target || e.metaKey || e.ctrlKey) return;
      const href = a.getAttribute("href");
      if (!/\.html(#.*)?$/.test(href)) return;
      e.preventDefault();
      hide();
      sessionStorage.setItem("ns-nav", "1");
      fadeIn().then(() => { location.href = href; });
    });
    if (sessionStorage.getItem("ns-nav")) {
      sessionStorage.removeItem("ns-nav");
      gsap.set(overlay(), { display: "block", opacity: 1 });
      fadeOut();
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
