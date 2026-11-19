// Shared across the whole site — attaches the header · phone menu · get-started window · video window · transition bar · CTA band · footer to every section.
// The original is a Next.js single-page app, so when turning sections only a 2px bar at the top runs while header and footer stay. The copy swaps the document after the bar is full, and lifts the bar in the new document.
(() => {
  const chev = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const arrow = '<svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true"><path d="M0 6h12m0 0L7 1m5 5-5 5" stroke="currentColor" stroke-width="1.5"/></svg>';
  const mark = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M1 3.2A2.2 2.2 0 0 1 5.3 2.5h5.4a2.2 2.2 0 1 1 2.8 2.8v5.4a2.2 2.2 0 1 1-2.8 2.8H5.3a2.2 2.2 0 1 1-2.8-2.8V5.3A2.2 2.2 0 0 1 1 3.2Zm3.3 2.1v5.4h7.4V5.3H4.3Z"/></svg>';
  const page = document.body.dataset.page || "home";
  // Original Nav puts a class on the current section link="active" Attach one (same shape, display only)
  const cur = (p) => (p === page ? ' class="active" aria-current="page"' : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("fa-head");
    head.innerHTML = `
<div class="fa-wrap"><div class="fa-head__in">
  <a class="fa-logo" href="index.html" data-label="Brand English name · logo symbol"><span class="fa-logo__mark">${mark}Brand</span></a>
  <nav class="fa-nav" aria-label="Main menu">
    <ul class="fa-menu">
      <li><a href="docs.html"${cur("docs")}>Products ${chev}</a>
        <div class="fa-drop"><ul>
          <li><a href="docs.html"><span class="fa-drop__ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="3.5" stroke="currentColor" stroke-width="2"/><path d="M11 6h6a3.5 3.5 0 0 1 0 7H8a3.5 3.5 0 0 0 0 7h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><span><span>Product One<span class="fa-tag">SDK</span></span><p>Your one-line description goes here.</p></span></a></li>
          <li><a href="docs.html"><span class="fa-drop__ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="7.8" y="7.8" width="8.4" height="8.4" rx="2.3" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2.4"/></svg></span><span><span>Product Two<span class="fa-tag">API</span></span><p>Your one-line description goes here.</p></span></a></li>
        </ul></div></li>
      <li><a href="news.html"${cur("news")}>Resources ${chev}</a>
        <div class="fa-drop is-narrow"><ul>
          <li><a href="news.html"${cur("news")}>Blog</a></li>
          <li><a href="changelog.html"${cur("changelog")}>Changelog</a></li>
          <li><a href="#">Support</a></li>
          <li><a href="#">FAQs</a></li>
        </ul></div></li>
      <li><a href="#">Social</a></li>
    </ul>
    <div class="fa-actions">
      <a class="fa-btn is-slim is-soft is-login" href="#">Log In</a>
      <button class="fa-btn is-slim" type="button" data-open="start">Get Started</button>
    </div>
  </nav>
  <button class="fa-burger" type="button" aria-label="Menu" aria-expanded="false"><i></i></button>
</div></div>
<div class="fa-mnav" data-slot="mobile-menu">
  <div class="fa-mnav__pane" data-pane="home"><ul>
    <li><button type="button" data-go="dev">Products <span class="arrow">${chev}</span></button></li>
    <li><button type="button" data-go="res">Resources <span class="arrow">${chev}</span></button></li>
    <li><a href="#">Social</a></li>
  </ul></div>
  <div class="fa-mnav__pane" data-pane="dev" hidden><div class="fa-mnav__back"><button type="button" data-go="home">← Back to menu</button></div><ul>
    <li><a href="docs.html">Product One</a></li><li><a href="docs.html">Product Two</a></li>
  </ul></div>
  <div class="fa-mnav__pane" data-pane="res" hidden><div class="fa-mnav__back"><button type="button" data-go="home">← Back to menu</button></div><ul>
    <li><a href="news.html">Blog</a></li><li><a href="changelog.html">Changelog</a></li><li><a href="#">Support</a></li><li><a href="#">FAQs</a></li>
  </ul></div>
</div>`;
  }

  // CTA strip art — the original CallToAction art (swaying flowers, bee, mascot waving) redrawn with our shapes
  const ctaArt = `<svg viewBox="0 0 280 110" fill="none" aria-hidden="true">
  <g class="cta-star" style="transform-origin:110px 14px"><path d="M110 8l2 4 4 .6-3 2.8.8 4-3.8-2-3.8 2 .8-4-3-2.8 4-.6z" fill="var(--fa-gold-alt)"/></g>
  <g class="cta-spark" style="transform-origin:160px 20px"><path d="M160 13l1.6 5.4L167 20l-5.4 1.6L160 27l-1.6-5.4L153 20l5.4-1.6z" fill="var(--fa-gray)"/></g>
  <path d="M60 70C90 40 130 40 160 60" stroke="var(--fa-stone)" stroke-width="6" stroke-linecap="round" fill="none"/>
  <g class="cta-bee" style="transform-origin:22px 34px">
    <g class="cta-wing is-l" style="transform-origin:20px 26px"><ellipse cx="16" cy="22" rx="6" ry="4" fill="var(--kf-bg)" stroke="var(--fa-gray)" stroke-width="1.5"/></g>
    <g class="cta-wing is-r" style="transform-origin:24px 26px"><ellipse cx="27" cy="21" rx="6" ry="4" fill="var(--kf-bg)" stroke="var(--fa-gray)" stroke-width="1.5"/></g>
    <ellipse cx="22" cy="34" rx="12" ry="9" fill="var(--fa-yellow)"/><path d="M19 26v16M25 26v16" stroke="var(--kf-ink)" stroke-width="2.4"/><circle cx="12" cy="32" r="1.6" fill="var(--kf-ink)"/>
  </g>
  <g class="cta-sway" style="transform-origin:70px 104px">
    <path d="M70 104V60" stroke="var(--fa-green)" stroke-width="4"/>
    <g><circle cx="70" cy="34" r="14" fill="var(--fa-yellow)"/><circle cx="88" cy="44" r="14" fill="var(--fa-yellow)"/><circle cx="82" cy="62" r="14" fill="var(--fa-yellow)"/><circle cx="58" cy="62" r="14" fill="var(--fa-yellow)"/><circle cx="52" cy="44" r="14" fill="var(--fa-yellow)"/><circle cx="70" cy="49" r="11" fill="var(--fa-orange)"/></g>
  </g>
  <path d="M10 106c0-22 14-32 26-32s18 8 20 14c4-4 18-4 20 6l2 12z" fill="var(--fa-green)"/>
  <g class="cta-sway is-late" style="transform-origin:118px 104px">
    <path d="M118 104V76" stroke="var(--fa-green)" stroke-width="3"/>
    <circle cx="118" cy="62" r="8" fill="var(--fa-blue)"/><circle cx="128" cy="70" r="8" fill="var(--fa-blue)"/><circle cx="108" cy="70" r="8" fill="var(--fa-blue)"/><circle cx="118" cy="78" r="8" fill="var(--fa-blue)"/><circle cx="118" cy="70" r="6" fill="var(--fa-yellow)"/>
  </g>
  <ellipse cx="226" cy="104" rx="44" ry="6" fill="var(--fa-green)"/>
  <g class="cta-arm" style="transform-origin:196px 72px"><path d="M196 72l-22 0" stroke="var(--kf-ink)" stroke-width="5" stroke-linecap="round"/></g>
  <path d="M212 88c-4 10 -14 12 -18 14M238 88c4 8 6 12 14 12" stroke="var(--kf-ink)" stroke-width="5" stroke-linecap="round" fill="none"/>
  <g class="cta-blob"><circle cx="226" cy="44" r="16" fill="var(--fa-blue)"/><circle cx="246" cy="56" r="16" fill="var(--fa-blue)"/><circle cx="244" cy="78" r="16" fill="var(--fa-blue)"/><circle cx="208" cy="78" r="16" fill="var(--fa-blue)"/><circle cx="206" cy="56" r="16" fill="var(--fa-blue)"/><circle cx="226" cy="84" r="16" fill="var(--fa-blue)"/><circle cx="226" cy="64" r="22" fill="var(--fa-blue)"/>
    <rect x="210" y="47" width="32" height="32" rx="3" fill="var(--fa-blue-alt)"/><circle cx="220" cy="62" r="2.6" fill="var(--kf-ink)"/><circle cx="232" cy="62" r="2.6" fill="var(--kf-ink)"/></g>
</svg>`;

  const cta = document.querySelector('[data-slot="cta"]');
  if (cta) {
    const t = cta.dataset.title || "Explore Brand";
    cta.classList.add("fa-cta");
    cta.innerHTML = `<div class="fa-wrap"><div class="fa-cta__text">
      <h2 class="t-h1" data-label="English title for browsing brands">${t}</h2>
      <p>Introduce your service here in one sentence.<br>One more line on who finds it easy here.</p>
      <a class="fa-more" href="#">${cta.dataset.more || "Your download link here"} ${arrow}</a>
    </div></div><div class="fa-cta__art">${ctaArt}</div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const col = (h, items) => `<li><h5>${h}</h5><ul>${items.map(([t, href]) => `<li><a href="${href}">${t}</a></li>`).join("")}</ul></li>`;
    foot.innerHTML = `<div class="fa-wrap"><div class="fa-foot">
      <div class="fa-foot__in">
        <a class="fa-foot__logo" href="index.html" aria-label="Back to start"><span data-fx="lottie-hover-play" data-fx-lottie-hover-play="data: famLogo; leave: finish; host: .fa-foot__logo"></span></a>
        <nav aria-label="Bottom Menu"><ul>
          ${col("Products", [["Documentation", "docs.html"], ["Product Two", "docs.html"], ["Source", "#"]])}
          ${col("Resources", [["Audit Report", "#"], ["Changelog", "changelog.html"], ["Blog", "news.html"], ["FAQs", "#"], ["Press Kit", "#"]])}
          ${col("Company", [["Contact", "#"], ["Social", "#"], ["Legal", "#"]])}
        </ul></nav>
      </div>
      <div class="fa-foot__info"><span>© 0000</span><ul class="fa-socials">
        <li><a href="#" aria-label="Code Repository"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .5a7.5 7.5 0 0 0-2.4 14.6c.4 0 .5-.2.5-.4v-1.4c-2 .4-2.5-.9-2.5-.9-.4-.9-.9-1.1-.9-1.1-.7-.5 0-.5 0-.5.8 0 1.2.8 1.2.8.7 1.2 1.8.9 2.3.7 0-.5.3-.9.5-1.1-1.7-.2-3.4-.8-3.4-3.7 0-.8.3-1.5.8-2-.1-.2-.3-1 .1-2 0 0 .6-.2 2 .8a7 7 0 0 1 3.8 0c1.4-1 2-.8 2-.8.4 1 .2 1.8.1 2 .5.5.8 1.2.8 2 0 2.9-1.7 3.5-3.4 3.7.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4A7.5 7.5 0 0 0 8 .5Z"/></svg></a></li>
        <li><a href="#" aria-label="Social"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M12.2 1h2.3L9.6 6.7 15.4 15h-4.6L7.3 10.2 3.2 15H.9l5.3-6.1L.6 1h4.7l3.2 4.4L12.2 1Zm-.8 12.6h1.3L4.7 2.3H3.3l8.1 11.3Z"/></svg></a></li>
        <li><a href="#" aria-label="Mail"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3h13a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5Zm.9 1.4L8 8.6l5.6-4.2H2.4Zm11.2 1.5L8.4 9.7a.7.7 0 0 1-.8 0L2.4 5.9v5.7h11.2V5.9Z"/></svg></a></li>
      </ul></div>
    </div></div>`;
  }

  // Two windows — Get Started (original GetStarted) · video (original WatchDemo)
  document.body.insertAdjacentHTML("beforeend", `
<div class="fa-bar" aria-hidden="true"></div>
<div class="fa-modal" data-modal="start" data-slot="start-modal" role="dialog" aria-modal="true" aria-label="Get started">
  <div class="fa-modal__veil" data-close></div>
  <div class="fa-modal__box">
    <div class="fa-modal__head"><span>Your window title here</span><button class="fa-modal__close" type="button" aria-label="Close" data-close><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1 1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>
    <div class="fa-modal__grid">
      <a class="fa-opt" href="#"><div class="wf-img" data-label="App screen illustration · phone front view · beige backdrop"></div><div class="fa-opt__text"><span class="fa-opt__title">Option One <span class="fa-opt__tag">Tag</span></span><span class="t-p">Your option description in about two lines here<br>We put it in.</span></div></a>
      <a class="fa-opt" href="#"><div class="wf-img" data-label="Web screen illustration · browser window · beige background"></div><div class="fa-opt__text"><span class="fa-opt__title">Option Two <span class="fa-opt__tag is-green">Tag</span></span><span class="t-p">Your option description in about two lines here<br>We put it in.</span></div></a>
    </div>
  </div>
</div>
<div class="fa-modal is-video" data-modal="video" data-slot="video-modal" role="dialog" aria-modal="true" aria-label="About Video">
  <div class="fa-modal__veil" data-close></div>
  <div class="fa-modal__box"><button class="fa-modal__close" type="button" aria-label="Close" data-close><svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1 1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <div class="fa-modal__media wf-img" data-label="Intro video · front-facing upper-body interview · light gray background · 16:9"><video src="media/promo.mp4" muted playsinline loop preload="none"></video></div></div>
</div>`);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const out = "0.42,0,0.58,1";
  const ease = (c, fb) => (window.CustomEase ? CustomEase.create(`fa-${c}`, c) : fb);
  // framer easeOut = cubic-bezier(0,0,.58,1)
  const easeOutF = ease("0,0,0.58,1", "power1.out");

  // Window — backdrop .2s easeOut, panel .98→1 .175s easeOut · on close the panel goes .94 in .15s.
  // Original WatchDemo has a different veil color depending on where it opens — the hero button gets a dark veil, the small video button inside a section gets a light veil (veil: light)
  const openModal = (name, veil) => {
    const m = document.querySelector(`[data-modal="${name}"]`);
    if (!m) return;
    m.classList.toggle("is-light", veil === "light");
    m.classList.add("is-open");
    const v = m.querySelector("video");
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    if (reduce) return;
    // Get started (original GetStarted) simply turns the whole window on with .2s easeOut with no panel scale · the video window (WatchDemo) is curtain .2s + panel .98→1 .175s
    if (!m.classList.contains("is-video")) return gsap.fromTo(m, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: easeOutF });
    // Video window: curtain .2s easeOut, panel fades .175s with no scaling (in the phone measurement the original panel has no scale track)
    gsap.fromTo(m.querySelector(".fa-modal__veil"), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: easeOutF });
    gsap.fromTo(m.querySelector(".fa-modal__box"), { opacity: 0 }, { opacity: 1, duration: 0.175, ease: easeOutF });
  };
  const closeModal = (m) => {
    const done = () => { m.classList.remove("is-open"); m.querySelector("video")?.pause(); };
    if (reduce) return done();
    if (!m.classList.contains("is-video")) return gsap.to(m, { opacity: 0, duration: 0.2, ease: easeOutF, onComplete: () => { done(); gsap.set(m, { clearProps: "opacity" }); } });
    gsap.to(m.querySelector(".fa-modal__veil"), { opacity: 0, duration: 0.2, ease: easeOutF });
    gsap.to(m.querySelector(".fa-modal__box"), { opacity: 0, duration: 0.15, ease: easeOutF, onComplete: done });
  };
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); openModal(o.dataset.open, o.dataset.veil); return; }
    const c = e.target.closest("[data-close]");
    if (c) closeModal(c.closest(".fa-modal"));
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".fa-modal.is-open").forEach(closeModal); });

  // Phone menu — panel opacity 0 · .96x → 1, height follows (.1s (.25,.1,.5,1)), sub panels swap at .96/1.04x (.05s later) · closing .9x
  const burger = document.querySelector(".fa-burger"), mnav = document.querySelector(".fa-mnav");
  if (burger && mnav) {
    const ui = ease("0.25,0.1,0.5,1", "power1.out");
    const panes = [...mnav.querySelectorAll("[data-pane]")];
    const show = (name, from) => {
      const next = panes.find((p) => p.dataset.pane === name);
      const prev = panes.find((p) => !p.hidden);
      if (!next || next === prev) return;
      const h0 = mnav.offsetHeight;
      prev.hidden = true; next.hidden = false;
      const h1 = mnav.offsetHeight;
      if (reduce) return;
      gsap.fromTo(mnav, { height: h0 }, { height: h1, duration: 0.1, ease: ui, clearProps: "height" });
      gsap.fromTo(next, { opacity: 0, scale: from }, { opacity: 1, scale: 1, duration: 0.1, delay: 0.05, ease: ui });
    };
    const setOpen = (on) => {
      burger.setAttribute("aria-expanded", on);
      if (on) {
        panes.forEach((p) => (p.hidden = p.dataset.pane !== "home"));
        mnav.classList.add("is-open");
        if (!reduce) gsap.fromTo(mnav, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.1, ease: ui });
      } else if (mnav.classList.contains("is-open")) {
        if (reduce) return mnav.classList.remove("is-open");
        gsap.to(mnav, { opacity: 0, scale: 0.9, duration: 0.1, ease: ui, onComplete: () => mnav.classList.remove("is-open") });
      }
    };
    burger.addEventListener("click", () => setOpen(burger.getAttribute("aria-expanded") !== "true"));
    mnav.addEventListener("click", (e) => {
      const go = e.target.closest("[data-go]");
      if (go) show(go.dataset.go, go.dataset.go === "home" ? 1.04 : 0.96);
    });
    document.addEventListener("click", (e) => { if (!mnav.contains(e.target) && !burger.contains(e.target)) setOpen(false); }, true);
    addEventListener("resize", () => setOpen(false));
    addEventListener("scroll", () => setOpen(false), { passive: true });
  }

  // Next bar — original Next router: on press the bar fills from the left over .4s (.87,0,.13,1) (waits 100ms for the cursor) and the content swaps as data arrives (≈80ms).
  // 500ms after the change, the bar retracts over .4s relative to the right. The copy swaps the document the moment it is pressed, and the new document continues filling the bar from the time of the press.
  const bar = document.querySelector(".fa-bar");
  const barEase = ease("0.87,0,0.13,1", "expo.inOut");
  const navAt = +sessionStorage.getItem("fa-nav");
  if (navAt) {
    sessionStorage.removeItem("fa-nav");
    const done = Math.min(1, (Date.now() - navAt) / 400);
    const at = gsap.parseEase(barEase)(done);
    gsap.set(bar, { scaleX: at, transformOrigin: "left center" });
    const left = reduce ? 0 : 0.4 * (1 - done);
    gsap.timeline()
      .to(bar, { scaleX: 1, duration: left, ease: "none" })
      .set(bar, { transformOrigin: "right center" }, 0.5)
      .to(bar, { scaleX: 0, duration: reduce ? 0 : 0.4, ease: barEase }, 0.5);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    sessionStorage.setItem("fa-nav", String(Date.now()));
    setTimeout(() => document.documentElement.classList.add("is-leaving"), 100);
    gsap.set(bar, { transformOrigin: "left center" });
    gsap.to(bar, { scaleX: 1, duration: reduce ? 0 : 0.4, ease: barEase });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { document.documentElement.classList.remove("is-leaving"); gsap.set(bar, { scaleX: 0 }); } });

  // List filter — lights only the chosen button and filters rows, then fits the wrapping panel height to the new height in .22s (.25,.1,.5,1) (original blog·changelog Filters)
  document.querySelectorAll("[data-filter]").forEach((bar) => {
    const list = document.querySelector(bar.dataset.filter);
    if (!list) return;
    const wrap = list.parentElement, ui = ease("0.25,0.1,0.5,1", "power1.out");
    // Original AnimatePresence(wait): the old list fades out in .2s, then the rows swap, the panel height goes to the new height in .22s, and the new list fades in in .2s
    const swap = (tag) => [...list.children].forEach((li) => (li.hidden = tag !== "all" && !(li.dataset.tags || "").split(" ").includes(tag)));
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-tag]");
      if (!b) return;
      bar.querySelectorAll("button").forEach((x) => x.classList.toggle("is-on", x === b));
      const tag = b.dataset.tag;
      if (reduce) return swap(tag);
      gsap.killTweensOf([list, wrap]);
      gsap.to(list, { opacity: 0, duration: 0.2, ease: easeOutF, onComplete: () => {
        const h0 = wrap.offsetHeight;
        swap(tag);
        const h1 = wrap.offsetHeight;
        gsap.fromTo(wrap, { height: h0 }, { height: h1, duration: 0.22, ease: ui, clearProps: "height" });
        gsap.to(list, { opacity: 1, duration: 0.2, ease: easeOutF });
      } });
    });
  });

  if (reduce) return;
  // List header — title·description·filter from 2° tilt·30px below over .4s easeOut (delayed .25·.3·.35s), list from 20px below delayed .4s
  const easeOut = ease("0,0,0.58,1", "power1.out");
  [[".fa-ihead__title", 0.25], [".fa-ihead__sub", 0.3], [".fa-ihead__filters", 0.35]].forEach(([s, d]) => {
    const el = document.querySelector(s);
    if (el) gsap.fromTo(el, { opacity: 0, rotation: 2, y: 30 }, { opacity: 1, rotation: 0, y: 0, duration: 0.4, delay: d, ease: easeOut, transformOrigin: "0% 50%" });
  });
  const lst = document.querySelector(".fa-ihead__list");
  if (lst) gsap.fromTo(lst, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: easeOut });

  // Footer turns on after .65s over .5s (original framer default curve easeInOut)
  const ft = document.querySelector('[data-slot="footer"]');
  if (ft) gsap.fromTo(ft, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.65, ease: ease(out, "power1.inOut") });

  // CTA illustration loops — flower skew 3→−3→3 2s · bee y −5↔5·rotate 0↔−5 2s · wing 15°↔0 .25s · hand wave 3s (+5s rest) · sparkle 3s · star 10s
  const art = document.querySelector(".fa-cta__art svg");
  if (art) {
    const io = ease(out, "power1.inOut");
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(art.querySelectorAll(".cta-sway"), { skewX: 3 }, { keyframes: { skewX: [3, -3, 3], easeEach: io }, duration: 2, repeat: -1, ease: "none" });
      gsap.fromTo(art.querySelector(".cta-bee"), { y: -5, rotation: 0 }, { y: 5, rotation: -5, duration: 2, repeat: -1, yoyo: true, ease: io });
      gsap.fromTo(art.querySelector(".cta-wing.is-l"), { rotation: 15 }, { rotation: 0, duration: 0.25, repeat: -1, yoyo: true, ease: io });
      gsap.fromTo(art.querySelector(".cta-wing.is-r"), { rotation: -15 }, { rotation: 0, duration: 0.25, repeat: -1, yoyo: true, ease: io });
      gsap.fromTo(art.querySelector(".cta-arm"), { rotation: -90 }, { keyframes: { rotation: [-90, 5, -5, 5, -5, 5, -90], easeEach: io }, duration: 3, repeat: -1, repeatDelay: 5, ease: "none" });
      gsap.fromTo(art.querySelector(".cta-spark"), { scale: 0.75, rotation: -45 }, { keyframes: { scale: [0.75, 1, 0.75], easeEach: io }, rotation: 45, duration: 3, delay: 1.5, repeat: -1, ease: io });
      gsap.fromTo(art.querySelector(".cta-star"), { scale: 0.5, rotation: 0 }, { keyframes: { scale: [0.5, 1, 0.5], easeEach: io }, rotation: 360, duration: 10, delay: 1.5, repeat: -1, ease: io });
    });
  }
})();
