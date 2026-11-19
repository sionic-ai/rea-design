// Shared by all pages — the header bar, phone menu, transition curtain and Footer are inserted once (in a spot swup doesn’t replace), plus Lenis (1.1s expo), swup 4.8.2 transition, a corner J piece per section ·
// Sets show once when visible (is-once-show) · parallax progress value (--parallax-amount) · looping progress value (--loop-amount) · per-page start
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  const setVw = () => root.style.setProperty("--jl-vw", `${root.clientWidth}px`);
  setVw();
  addEventListener("resize", setVw);

  const MARK = '<path d="M0 423V150C0 67 67 0 150 0c72 0 131 59 131 131v40L181 271V150c0-17-14-31-31-31h-19c-17 0-31 14-31 31v173Z" fill="currentColor"/>';
  const markHtml = () => `<div class="jl-mark__obj jl-mark__obj--left" data-fx-part="corner" data-key="start"><svg viewBox="0 0 281 423" aria-hidden="true">${MARK}</svg></div><div class="jl-mark__obj jl-mark__obj--right" data-fx-part="corner" data-key="end"><svg viewBox="0 0 281 423" aria-hidden="true"><g transform="rotate(180 140.5 211.5)">${MARK}</g></svg></div>`;
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 22V9a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7v4l-6 6V9a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v10Z" fill="currentColor"/></svg>';
  const roll = 'data-fx="char-roll" data-fx-char-roll="stagger: .025; dur: .6; ease: 0.19,1,0.22,1; mode: hold; hold: .45; gap: 20%; lag: .05"';
  const nav = [
    ["about.html", "Philosophy"],
    ["about.html#stance", "About"],
    ["service.html", "Business", [["service.html#field", "Dining"], ["service.html#field", "Consulting"], ["project.html", "City Project"]]],
    ["#", "Recruit", [["#", "Data"], ["#", "Culture"], ["#", "Interview"], ["#", "Pride Story"], ["#", "Job Description"]]],
    ["news.html", "News"],
    ["index.html#contact", "Contact"],
  ];
  const arrow = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M0 4.4h7.2L4.6 1.8 5.4 1 9.4 5 5.4 9l-.8-.8 2.6-2.6H0Z" fill="currentColor"/></svg>';

  // ---------- Insert the parts that never change (header row, phone menu, transition curtain, footer) once ----------
  const container = document.querySelector(".jl-container");
  if (container) {
    const header = document.createElement("header");
    header.className = "jl-header";
    header.dataset.slot = "header";
    header.innerHTML = `<div class="jl-header__bg"></div>
      <a class="jl-header__logo jl-logo" href="index.html" aria-label="First Page" data-label="Logo slot · rounded hook symbol + bold English company name">${icon}<span class="jl-display">Brand</span></a>
      <nav class="jl-header__nav" aria-label="Main menu"><ul class="jl-header__list">
        ${nav.map(([href, label, sub]) => `<li class="jl-header__item"><a class="jl-header__link" href="${href}" ${roll}>${label}</a>${sub ? `<i class="jl-plus" aria-hidden="true"></i><div class="jl-header__sub"><ul>${sub.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul></div>` : ""}</li>`).join("")}
      </ul></nav>`;
    const menu = document.createElement("button");
    menu.className = "jl-menu";
    menu.type = "button";
    menu.setAttribute("aria-label", "Open and close menu");
    menu.setAttribute("aria-expanded", "false");
    menu.innerHTML = '<span class="jl-menu__txt">Menu</span><i class="jl-menu__icon" aria-hidden="true"></i>';
    const navi = document.createElement("nav");
    navi.className = "jl-navi";
    navi.dataset.slot = "drawer-menu";
    navi.setAttribute("aria-label", "Site Menu");
    navi.innerHTML = `<div class="jl-mark is-black">${markHtml()}</div><div class="jl-navi__scroll" data-lenis-prevent><ul>
      ${nav.map(([href, label, sub]) => `<li class="jl-navi__item"><a class="jl-navi__link" href="${href}">${label}</a>${sub ? `<div class="jl-navi__sub">${sub.map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}</div>` : ""}</li>`).join("")}
    </ul></div><a class="jl-navi__logo jl-logo" href="index.html" aria-label="First Page">${icon}<span class="jl-display">Brand</span></a>`;
    const trans = document.createElement("div");
    trans.className = "jl-transition";
    trans.dataset.slot = "page-transition";
    trans.setAttribute("aria-hidden", "true");
    trans.innerHTML = `<div class="jl-transition__overlay"></div><div class="jl-mark">${markHtml()}</div>`;
    const footer = document.createElement("footer");
    footer.className = "jl-footer";
    footer.dataset.slot = "footer";
    footer.dataset.parallax = "";
    footer.dataset.parallaxEnd = "top top";
    footer.innerHTML = `<div class="jl-mark">${markHtml()}</div><div class="jl-footer__inner">
      <p class="jl-footer__logo"><a href="index.html" class="jl-display jl-footer__word" data-label="English company wordmark (bold caps)">Brand</a></p>
      <nav class="jl-footer__nav" aria-label="Footer Menu"><ul class="jl-footer__list">
        ${nav.map(([href, label, sub]) => `<li><a class="jl-footer__link" href="${href}" ${roll}>${label}</a>${sub ? `<div class="jl-footer__sub">${sub.map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}</div>` : ""}</li>`).join("")}
      </ul></nav>
      <div class="jl-footer__bottom"><a href="#" ${roll}>Privacy Policy</a><p>© Company Name. All rights reserved.</p></div>
    </div>`;
    container.prepend(trans, header, navi, menu);
    container.append(footer);
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      navi.classList.toggle("is-open", open);
      open ? lenis?.stop() : lenis?.start();
    });
    navi.addEventListener("click", (e) => { if (e.target.closest("a")) { menu.setAttribute("aria-expanded", "false"); navi.classList.remove("is-open"); lenis?.start(); } });
  }

  // ---------- Smooth scroll — original Lenis 1.3.11 duration 1.1 · expo curve ----------
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.jlLenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const toTop = () => { lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0); };

  // ---------- Insert a corner J piece in each section (data-mark="white|black|light") ----------
  const marks = (scope) => scope.querySelectorAll("[data-mark]").forEach((sec) => {
    if (sec.querySelector(":scope > .jl-mark")) return;
    const m = document.createElement("div");
    m.className = `jl-mark${sec.dataset.mark ? ` is-${sec.dataset.mark}` : ""}`;
    m.dataset.fx = "clip-tint-mark";
    m.setAttribute("data-fx-clip-tint-mark", `look: ${{ white: "ink", black: "dark" }[sec.dataset.mark] || "light"}`);
    m.setAttribute("aria-hidden", "true");
    m.innerHTML = markHtml();
    // As in the original, the photo section (white pieces) is the last child above the photo, and gray and charcoal sections are the first child below the text
    if (sec.dataset.mark === "white") sec.append(m); else sec.prepend(m);
  });

  // ---------- Scroll progress — original trigger: once (fires once after passing top bottom → top 80%), parallax (0 → 1 while passing), loop (0 → .5) ----------
  let triggers = [];
  const watch = (scope) => {
    const all = (sel) => [...(scope.matches?.(sel) ? [scope] : []), ...scope.querySelectorAll(sel)];
    all("[data-once]").forEach((el) => {
      triggers.push(ScrollTrigger.create({ trigger: el, start: `top ${el.dataset.onceStart || "bottom"}`, end: `top ${el.dataset.onceEnd || "80%"}`, onLeave: () => el.classList.add("is-once-show") }));
    });
    all("[data-parallax]").forEach((el) => {
      const set = gsap.quickSetter(el, "--parallax-amount");
      set(0);
      triggers.push(ScrollTrigger.create({
        trigger: el, start: el.dataset.parallaxStart || "top bottom", end: el.dataset.parallaxEnd || "bottom top", scrub: true,
        onToggle: (st) => el.classList.toggle("is-parallax-show", st.isActive),
        onUpdate: (st) => set(Math.round(st.progress * 1e4) / 1e4),
      }));
    });
    all("[data-loop]").forEach((el) => {
      const set = gsap.quickSetter(el, "--loop-amount");
      set(0);
      triggers.push(ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", scrub: true, onUpdate: (st) => set(Math.round(st.progress * 0.5 * 1e4) / 1e4) }));
    });
  };
  const unwatch = () => { triggers.forEach((t) => t.kill()); triggers = []; };

  // ---------- Start and teardown per page — re-attached every time swup moves to new content ----------
  const pages = (window.jlPages = window.jlPages || {});
  let current = null;
  const pageOf = () => document.querySelector(".jl-main")?.dataset.page || "";
  const setup = () => {
    const main = document.querySelector(".jl-main");
    if (!main) return;
    marks(document);
    watch(main);
    watch(document.querySelector(".jl-footer") || document);
    document.body.dataset.page = pageOf();
    current = pages[pageOf()] || null;
    current?.init?.(main, { reduce, lenis });
    requestAnimationFrame(() => main.classList.add("is-ready"));
    ScrollTrigger.refresh();
  };
  const teardown = () => { current?.destroy?.(); current = null; unwatch(); };

  // ---------- swup transition — original: curtain laid and pieces gather (1.3s), body swapped, moved up and restarted, then pieces split to the corners and clear ----------
  const trans = document.querySelector(".jl-transition");
  const wait = (el, ms) => new Promise((res) => {
    let done = false;
    const end = () => { if (done) return; done = true; res(); };
    el?.addEventListener("transitionend", function on(e) { if (e.target === el) { el.removeEventListener("transitionend", on); end(); } });
    setTimeout(end, ms);
  });
  // Opened via file://, swup can’t fetch the next page (CORS) — normal navigation is used then
  if (window.Swup && !reduce && location.protocol !== "file:") {
    const plugins = [];
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ awaitAssets: true }));
    if (window.SwupPreloadPlugin) plugins.push(new SwupPreloadPlugin());
    if (window.SwupScrollPlugin) plugins.push(new SwupScrollPlugin({ doScrollingRightAway: false, animateScroll: { betweenPages: false, samePageWithHash: true, samePage: true } }));
    const swup = new Swup({ containers: [".jl-main"], animationSelector: false, animateHistoryBrowsing: true, plugins });
    window.jlSwup = swup;
    swup.hooks.on("visit:start", () => { root.classList.add("is-wait"); lenis?.stop(); });
    swup.hooks.on("visit:end", () => { root.classList.remove("is-wait"); lenis?.start(); });
    swup.hooks.replace("animation:out:await", async () => {
      trans.classList.add("is-show");
      await wait(trans, 1400);
    });
    swup.hooks.on("animation:out:end", () => teardown());
    swup.hooks.replace("animation:in:await", async () => {
      toTop();
      setup();
      await new Promise((r) => requestAnimationFrame(r));
      trans.classList.remove("is-show");
      await wait(trans, 1500);
    });
  }

  // ---------- On first open ----------
  const first = () => { setup(); };
  if (document.readyState === "complete") first(); else addEventListener("load", first, { once: true });
})();
