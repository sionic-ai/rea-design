// Header·footer·contact window·background tone·signature drawing·word rise·float-up shared by all pages.
// The original is a single-page app, so header and footer stay across page turns and only the background color changes over .7s — the copy opens a new document, but
// Leaves the pre-switch tone in sessionStorage so the new page changes from that tone to its own in the same .7s.
(() => {
  const page = document.body.dataset.page || "home";
  const isHome = page === "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAGS = [{ label: "Category 1", value: "brand" }, { label: "Category 2", value: "digital" }, { label: "Category 3", value: "ventures" }];
  const MARK_DUR = 2;
  const MARK_SEGS = [[0, 1.35], [1.35, 1.85]];
  const MARK_SVG = `<svg class="lm-mark" viewBox="0 0 400 240" aria-hidden="true">
    <path pathLength="1" d="M40 172C70 122 95 62 110 40C120 27 129 40 118 70C105 110 90 150 96 168C102 183 125 150 140 120C150 100 161 95 158 121C156 145 150 171 166 165C186 157 200 110 215 95C225 85 233 95 226 118C220 140 214 171 233 160C256 146 276 120 300 112C321 106 341 112 366 104"/>
    <path pathLength="1" d="M58 124C140 102 252 82 362 58"/>
  </svg>`;
  const WORD_SVG = `<svg class="lm-wordmark lm-foot__word" viewBox="0 0 520 150" role="img" aria-label="Logo slot">
    <text x="0" y="118" font-size="160" textLength="470" lengthAdjust="spacingAndGlyphs">LOGO</text>
    <text x="478" y="26" font-size="22">TM</text>
    <g class="lm-cities"><text x="2" y="146">City 1</text><text x="92" y="146">City 2</text><text x="182" y="146">City 3</text><text x="272" y="146">City 4</text><text x="362" y="146">City 5</text><text x="440" y="146">City 6</text></g>
  </svg>`;

  // ───────── Signature: the original lamMark video (2 seconds) play and rewind (1.15x speed) as line drawing ─────────
  class Mark {
    constructor(svg) {
      this.paths = [...svg.querySelectorAll("path")];
      this.paths.forEach((p) => { p.style.strokeDasharray = "1"; });
      this.t = 0; this.raf = 0; this.render();
    }
    render() {
      this.paths.forEach((p, i) => {
        const [a, b] = MARK_SEGS[i] || MARK_SEGS[0];
        const k = Math.min(1, Math.max(0, (this.t - a) / (b - a)));
        p.style.strokeDashoffset = String(1 - k);
      });
    }
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
    run(dir, speed) {
      let last = null;
      const step = (now) => {
        if (last === null) last = now;
        this.t = Math.min(MARK_DUR, Math.max(0, this.t + (dir * speed * Math.max(0, now - last)) / 1000));
        last = now;
        this.render();
        this.raf = (dir > 0 ? this.t < MARK_DUR : this.t > 0) ? requestAnimationFrame(step) : 0;
      };
      this.raf = requestAnimationFrame(step);
    }
    play(fromStart) {
      this.stop();
      if (fromStart || this.t >= MARK_DUR) this.t = 0;
      if (reduce) { this.t = MARK_DUR; this.render(); return; }
      this.run(1, 1);
    }
    loop() {
      this.stop();
      if (reduce) { this.t = MARK_DUR; this.render(); return; }
      let last = null;
      const step = (now) => {
        if (last === null) last = now;
        this.t += Math.max(0, now - last) / 1000;
        last = now;
        if (this.t >= MARK_DUR) this.t %= MARK_DUR;
        this.render();
        this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }
    reverse(speed = 1) {
      this.stop();
      this.t = MARK_DUR;
      if (reduce) { this.t = 0; this.render(); return; }
      this.run(-1, speed);
    }
  }

  window.lmMarkSvg = MARK_SVG;
  window.lmMark = (svg) => new Mark(svg);

  // Original useVideoBottom: rewind and restart from the beginning only when crossing the moment the footer’s bottom edge touches below the screen (+4px)
  const atBottomWatch = (mark, reverseAtBottom, speed) => {
    let was = false;
    const check = () => {
      const f = document.getElementById("site-footer");
      const now = !!f && f.offsetParent !== null && f.getBoundingClientRect().bottom <= innerHeight + 4;
      if (now === was) return;
      was = now;
      if (reverseAtBottom ? now : !now) mark.reverse(speed);
      else mark.play(true);
    };
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    new MutationObserver(check).observe(document.body, { childList: true, subtree: true });
    check();
  };

  // ───────── Background tone ─────────
  const body = document.body;
  const toneOf = () => (body.classList.contains("is-red") ? "red" : body.classList.contains("is-white") ? "white" : "light");
  const setTone = (t) => { body.classList.toggle("is-red", t === "red"); body.classList.toggle("is-white", t === "white"); };
  const ownTone = () => (isHome ? (scrollY > 50 ? "light" : "red") : page === "detail" ? "white" : "light");
  let carried = null;
  try { carried = JSON.parse(sessionStorage.getItem("lm-carry") || "null"); sessionStorage.removeItem("lm-carry"); } catch (e) { carried = null; }
  if (carried && Date.now() - carried.at < 4000 && !reduce) {
    body.style.transition = "none";
    setTone(carried.tone);
    void body.offsetWidth;
    body.style.transition = "";
    requestAnimationFrame(() => setTone(ownTone()));
  } else {
    body.style.transition = "none";
    setTone(ownTone());
    void body.offsetWidth;
    body.style.transition = "";
  }
  if (isHome) addEventListener("scroll", () => setTone(ownTone()), { passive: true });

  // ───────── Head ─────────
  const params = new URLSearchParams(location.search);
  const curTag = () => { const t = new URLSearchParams(location.search).get("tag"); return TAGS.some((x) => x.value === t) ? t : null; };
  const nav = document.createElement("nav");
  nav.className = "lm-nav";
  nav.dataset.slot = "nav";
  nav.setAttribute("aria-label", "Main menu");
  const tagBtns = page === "works"
    ? TAGS.map((t) => `<button type="button" class="lm-link lm-nav__tag" data-tag="${t.value}">${t.label}</button>`).join("") +
      `<button type="button" class="lm-link" data-tag="">Work</button>`
    : `<a class="lm-link" href="works.html">Work</a>`;
  const mobile = page === "works"
    ? `<button type="button" class="t-h5 lm-nav__toggle" aria-expanded="false" aria-controls="lm-drawer"><span data-lm-label>Work</span>
        <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2v14M2 9h14" stroke="currentColor" stroke-width="2"/></svg></button>`
    : `<a class="t-h5 lm-link" href="works.html">Work</a>`;
  nav.innerHTML = `<div class="lm-constrain"><div class="lm-px lm-nav__row">
      <a class="lm-nav__mark" href="index.html" aria-label="To the first page">${MARK_SVG}</a>
      <div class="t-h5 lm-nav__links">${tagBtns}</div>
      <div class="lm-nav__mobile">${mobile}</div>
    </div></div>
    ${page === "works" ? `<div id="lm-drawer" class="lm-drawer" aria-hidden="true"><div class="lm-px t-h5 lm-drawer__list">
      <button type="button" class="lm-link" data-tag="">Work</button>
      ${TAGS.map((t) => `<button type="button" class="lm-link" data-tag="${t.value}">${t.label}</button>`).join("")}
    </div></div>` : ""}`;
  body.prepend(nav);
  if (page === "works") {
    const scrim = document.createElement("button");
    scrim.type = "button";
    scrim.className = "lm-scrim";
    scrim.setAttribute("aria-label", "Close category drawer");
    body.prepend(scrim);
  }
  const navMark = new Mark(nav.querySelector(".lm-mark"));
  const navThreshold = () => (isHome ? 0.4 * innerHeight : 0);
  let navShown = null;
  const syncNav = () => {
    const show = scrollY >= navThreshold();
    if (show === navShown) return;
    navShown = show;
    nav.classList.toggle("is-hidden", !show);
    if (isHome && show) navMark.play(false);
  };
  if (carried && carried.navHidden && !reduce) {
    nav.style.transition = "none";
    nav.classList.add("is-hidden");
    void nav.offsetWidth;
    nav.style.transition = "";
    requestAnimationFrame(syncNav);
  } else syncNav();
  addEventListener("scroll", syncNav, { passive: true });
  addEventListener("resize", syncNav);
  if (!isHome) navMark.play(true);
  atBottomWatch(navMark, true, 1.15);

  // Category buttons on the work list — on open they light up 300ms later, from the rightmost one at 150ms intervals (original (3 − i) × 150ms)
  if (page === "works") {
    const tagEls = [...nav.querySelectorAll(".lm-nav__tag")];
    tagEls.forEach((b, i) => { b.style.transitionDelay = `${(TAGS.length - i) * 150}ms, 0ms`; });
    setTimeout(() => tagEls.forEach((b) => b.classList.add("is-on")), 300);
    const drawer = nav.querySelector(".lm-drawer");
    const toggle = nav.querySelector(".lm-nav__toggle");
    const scrim = document.querySelector(".lm-scrim");
    const setOpen = (o) => {
      drawer.classList.toggle("is-open", o);
      drawer.setAttribute("aria-hidden", String(!o));
      scrim.classList.toggle("is-open", o);
      toggle.setAttribute("aria-expanded", String(o));
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    scrim.addEventListener("click", () => setOpen(false));
    const syncTags = () => {
      const t = curTag();
      nav.querySelectorAll("[data-tag]").forEach((b) => {
        const on = (b.dataset.tag || null) === t;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
        if (b.closest(".lm-drawer")) b.hidden = on;
      });
      nav.querySelector("[data-lm-label]").textContent = (TAGS.find((x) => x.value === t) || { label: "Work" }).label;
    };
    nav.querySelectorAll("[data-tag]").forEach((b) => b.addEventListener("click", () => {
      const u = new URL(location.href);
      if (b.dataset.tag) u.searchParams.set("tag", b.dataset.tag); else u.searchParams.delete("tag");
      history.pushState(null, "", u);
      setOpen(false);
      syncTags();
      dispatchEvent(new CustomEvent("lm:tag", { detail: curTag() }));
    }));
    addEventListener("popstate", () => { syncTags(); dispatchEvent(new CustomEvent("lm:tag", { detail: curTag() })); });
    syncTags();
  }

  // ───────── Footer ─────────
  const foot = document.createElement("footer");
  foot.id = "site-footer";
  foot.className = "lm-foot" + (page === "detail" ? " has-border" : "");
  foot.dataset.slot = "footer";
  const tagLink = (t, cls) => `<a class="${cls} lm-link" href="works.html?tag=${t.value}">${t.label} Studio</a>`;
  const homeLink = `<a class="lm-foot__home" href="index.html" aria-label="To the first page">${MARK_SVG}${WORD_SVG}</a>`;
  const social = `<a class="lm-link" href="#" target="_blank" rel="noopener">Link 1</a><a class="lm-link" href="#" target="_blank" rel="noopener">Link 2</a>`;
  foot.innerHTML = `
    <div class="lm-px t-h5 lm-constrain lm-grid lm-foot__wide">
      <div class="lm-foot__c5">${tagLink(TAGS[0], "t-h5")}</div>
      <div class="lm-foot__c4">${tagLink(TAGS[1], "t-h5")}</div>
      <div class="lm-foot__c3">${tagLink(TAGS[2], "t-h5")}</div>
      <div class="lm-foot__brand">${homeLink}</div>
      <div class="lm-foot__contact">
        <button type="button" class="t-h5 lm-link" data-lm-contact style="margin-bottom:24px">Inquiry</button>
        <button type="button" class="lm-copy lm-link" data-lm-copy style="padding-bottom:4px"><span>hello@<wbr>studioname.co.kr</span></button>
        <div class="lm-foot__social">${social}</div>
      </div>
    </div>
    <div class="lm-px lm-foot__narrow">
      <div class="lm-stack">${TAGS.map((t) => tagLink(t, "t-label")).join("")}</div>
      <div class="lm-stack">
        <button type="button" class="t-label lm-link" data-lm-contact style="margin-bottom:8px">Inquiry</button>
        <button type="button" class="t-label lm-copy lm-link" data-lm-copy><span>hello@<wbr>studioname.co.kr</span></button>
        <div class="lm-wrap t-label">${social}</div>
      </div>
      ${homeLink}
    </div>`;
  body.append(foot);
  foot.querySelectorAll(".lm-foot__home .lm-mark").forEach((svg) => atBottomWatch(new Mark(svg), false, 1));

  // Copy email — on press shows ”Copied” for 2 seconds, and meanwhile removes the underline reaction (original Copied ❤︎)
  foot.querySelectorAll("[data-lm-copy]").forEach((b) => {
    const span = b.querySelector("span");
    const html = span.innerHTML;
    let timer = 0;
    b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText("hello@studioname.co.kr"); } catch (e) { /* Update the indicator even where the clipboard is blocked */ }
      b.classList.remove("lm-link");
      span.textContent = "Copied ❤︎";
      span.style.paddingBottom = "4px";
      clearTimeout(timer);
      timer = setTimeout(() => { span.innerHTML = html; span.style.paddingBottom = ""; b.classList.add("lm-link"); }, 2000);
    });
  });

  // ───────── Contact window ─────────
  const dlg = document.createElement("div");
  dlg.className = "lm-dialog";
  dlg.dataset.slot = "contact-dialog";
  dlg.setAttribute("role", "dialog");
  dlg.setAttribute("aria-modal", "true");
  dlg.setAttribute("aria-label", "Inquiry");
  dlg.innerHTML = `<div class="lm-dialog__veil"></div>
    <div class="lm-dialog__box">
      <button type="button" class="t-b1 lm-dialog__exit">Close</button>
      <div class="lm-dialog__body">
        <h2 class="t-h4">Your contact title goes here</h2>
        <form class="lm-dialog__body" style="padding:0" onsubmit="return false">
          <label class="lm-field t-caption">Name<input type="text" placeholder="Please write your name"></label>
          <label class="lm-field t-caption">Mail<input type="email" placeholder="Email address"></label>
          <label class="lm-field t-caption">Company<input type="text" placeholder="Company name"></label>
          <label class="lm-field t-caption">Content<textarea placeholder="Contact message"></textarea></label>
          <button type="submit" class="t-button lm-btn-solid">Send</button>
        </form>
      </div>
    </div>`;
  body.append(dlg);
  const openDlg = () => { dlg.classList.remove("is-closing"); dlg.classList.add("is-open"); };
  const closeDlg = () => {
    if (!dlg.classList.contains("is-open")) return;
    dlg.classList.remove("is-open");
    dlg.classList.add("is-closing");
    setTimeout(() => dlg.classList.remove("is-closing"), 250);
  };
  document.addEventListener("click", (e) => { if (e.target.closest("[data-lm-contact]")) openDlg(); });
  dlg.querySelector(".lm-dialog__veil").addEventListener("click", closeDlg);
  dlg.querySelector(".lm-dialog__exit").addEventListener("click", closeDlg);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeDlg(); });
  if (params.get("modal") === "contactForm") openDlg();

  // The original (Next) prefetches the next page of links on screen so clicking navigates instantly — the copy also prefetches three pages
  if (window.HTMLScriptElement && HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
    const rules = document.createElement("script");
    rules.type = "speculationrules";
    rules.textContent = JSON.stringify({ prefetch: [{ source: "list", urls: ["index.html", "works.html", "detail.html"], eagerness: "immediate" }] });
    document.head.append(rules);
  }

  // When leaving for another page, save the current tone and header state
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || /^(#|mailto:|https?:)/.test(a.getAttribute("href"))) return;
    try { sessionStorage.setItem("lm-carry", JSON.stringify({ tone: toneOf(), navHidden: nav.classList.contains("is-hidden"), at: Date.now() })); } catch (err) { /* In rounds where saving is blocked, no transition tone */ }
  });

  // ───────── Rise up (original IntersectionAnimation fadeUp) ─────────
  const fadeIn = (el) => {
    const dur = +(el.dataset.lmDur ?? 700), delay = +(el.dataset.lmDelay ?? 0);
    el.classList.add("lm-fade-wait");
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      io.disconnect();
      setTimeout(() => {
        el.style.transitionDuration = `${dur}ms`;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add("lm-fade-go");
        el.classList.remove("lm-fade-wait");
      }, 10);
    }, { rootMargin: el.dataset.lmMargin || "-100px" });
    io.observe(el);
  };
  window.lmFade = (root) => { if (!reduce) root.querySelectorAll("[data-lm-fade]:not(.lm-fade-go):not(.lm-fade-wait)").forEach(fadeIn); };

  // ───────── Word rise-in (original WordRevealText — SplitText words·mask, 120% → 0, .6s · .04s, power3.out) ─────────
  window.lmWords = (el, opts = {}) => {
    if (reduce || !window.SplitText) { el.classList.add("is-split"); return null; }
    const st = SplitText.create(el, { type: "words", mask: "words", aria: opts.aria === false ? "none" : "auto" });
    st.masks.forEach((m) => { m.style.overflowX = "visible"; });
    el.classList.add("is-split");
    gsap.set(st.words, { yPercent: 120 });
    return st;
  };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, () => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    // The original draws no text until the fonts are fully loaded (font-display: block) — splitting must also happen after the font arrives so word widths are right
    const run = () => document.querySelectorAll("[data-lm-words]").forEach((el) => {
      const st = window.lmWords(el);
      if (!st) return;
      const delay = +(el.dataset.lmWords || 0);
      gsap.to(st.words, {
        yPercent: 0, duration: 0.6, stagger: 0.04, ease: "power3.out", delay,
        ...(el.hasAttribute("data-lm-mount") ? {} : { scrollTrigger: { trigger: el, start: "top 85%", once: true } }),
      });
    });
    if (document.fonts && document.fonts.status !== "loaded") document.fonts.ready.then(run); else run();
  });
  document.querySelectorAll("[data-lm-words]").forEach((el) => { if (reduce) el.classList.add("is-split"); });
  window.lmFade(document);
})();
