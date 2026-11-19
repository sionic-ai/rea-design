// Shared by several pages — header nav display · 100px scroll-down display · menu dialog · swup transition, plus the #swup widgets (ISSUE accordion · load more · event slider · photo column flow).
// Original swaps only #swup via swup (no transition effect, animationSelector: false), and the behavior is set up and torn down when a custom element attaches and detaches.
// Here, every time #swup changes, the setup is torn down and attached again. Dither bands, text fill and number sweep attach themselves to newly arrived elements via the motion part (fx-core).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = matchMedia("(hover: hover)");
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const ms = (name) => { const v = css(name), n = parseFloat(v); return Number.isNaN(n) ? 0 : v.endsWith("ms") ? n : n * 1000; };
  const root = document.documentElement;

  // ---------- Scroll past 100px and html.-scrolled is set (the hamburger opens and the floating copy hides) ----------
  let locked = false, raf = 0;
  const scrolled = () => { if (!locked) root.classList.toggle("-scrolled", scrollY > 100); };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; scrolled(); }); }, { passive: true });

  // ---------- Header nav — underline sits under the current page item ----------
  const nav = $("[data-sh-nav]"), indicator = $("[data-sh-nav-indicator]");
  let shown = false;
  const markNav = (instant) => {
    const here = (location.pathname.split("/").pop() || "index.html");
    let current = null;
    $$("[data-sh-nav-item]").forEach((li) => {
      const a = $("a", li), on = a && a.getAttribute("href") === here && here !== "index.html";
      li.classList.toggle("is-current", !!on);
      if (on) { a.setAttribute("aria-current", "page"); current = li; } else a?.removeAttribute("aria-current");
    });
    if (!nav || !indicator) return;
    const label = current && $("[data-sh-nav-label]", current);
    if (!label) { indicator.classList.remove("is-visible"); shown = false; return; }
    const n = nav.getBoundingClientRect(), r = label.getBoundingClientRect();
    const jump = instant || !shown;
    if (jump) indicator.classList.add("is-instant");
    indicator.style.setProperty("--_x", `${r.left - n.left}px`);
    indicator.style.setProperty("--_y", `${r.bottom - n.bottom}px`);
    indicator.style.setProperty("--_w", `${r.width}px`);
    indicator.classList.add("is-visible");
    if (jump) { indicator.offsetWidth; indicator.classList.remove("is-instant"); }
    shown = true;
  };
  if (nav) new ResizeObserver(() => markNav(true)).observe(nav);

  // ---------- Menu dialog — inner height 0 → full height (.3s ease-out curve), closing uses the ease-in curve ----------
  const menu = $("[data-sh-menu]"), inner = $("[data-sh-menu-inner]"), body = $("[data-sh-menu-body]");
  const opens = $$("[data-sh-menu-open]"), closeBtn = $("[data-sh-menu-close]");
  let openAnim = null, closeAnim = null;
  const lock = (on) => {
    locked = on;
    const bar = innerWidth - document.body.clientWidth;
    root.style.setProperty("--site-scrollbar", on ? `${bar}px` : "0px");
    root.style.overflow = on ? "hidden" : "";
  };
  const expanded = (v) => [...opens, closeBtn].forEach((b) => b?.setAttribute("aria-expanded", String(v)));
  const finishClose = () => {
    if (menu.open) menu.close();
    openAnim?.cancel(); closeAnim?.cancel();
    inner.style.overflow = "";
    lock(false);
    scrolled();
  };
  const openMenu = () => {
    if (!menu || menu.open) return;
    lock(true);
    menu.showModal();
    body.scrollTop = 0;
    document.body.classList.add("-menu-open");
    menu.classList.remove("-closing");
    expanded(true);
    if (reduce.matches) return;
    closeAnim?.cancel();
    const h = inner.offsetHeight;
    setTimeout(() => (inner.style.overflow = "hidden"), 1);
    openAnim = inner.animate([{ height: "0px" }, { height: `${h}px` }], { duration: ms("--site-dur-short"), easing: css("--site-ease-out") });
    openAnim.onfinish = () => (inner.style.overflow = "");
  };
  const closeMenu = () => {
    if (!menu?.open) return;
    menu.classList.add("-closing");
    document.body.classList.remove("-menu-open");
    expanded(false);
    if (reduce.matches) { finishClose(); return; }
    const h = inner.offsetHeight;
    inner.style.overflow = "hidden";
    closeAnim?.cancel();
    closeAnim = inner.animate([{ height: `${h}px` }, { height: "0px" }], { duration: ms("--site-dur-short"), easing: css("--site-ease-in"), fill: "forwards" });
    openAnim?.cancel();
    closeAnim.onfinish = finishClose;
  };
  opens.forEach((b) => b.addEventListener("click", openMenu));
  closeBtn?.addEventListener("click", closeMenu);
  menu?.addEventListener("click", (e) => e.target === menu && closeMenu());
  menu?.addEventListener("cancel", (e) => { e.preventDefault(); closeMenu(); });

  // ---------- Devices inside #swup ----------
  const mounts = [];
  const on = (el, type, fn, opt) => { el.addEventListener(type, fn, opt); mounts.push(() => el.removeEventListener(type, fn, opt)); };
  const fire = (el, type, detail) => el?.dispatchEvent(new CustomEvent(type, { detail }));

  // ISSUE accordion — on hover the title-row strips stagger in 30ms steps (.4s), on press the panel opens via grid-rows and the strip stays at the expanded length
  const accordion = (box) => {
    const trigger = $("[data-sh-acc-trigger]", box), panel = $("[data-sh-acc-panel]", box);
    if (!trigger || !panel) return;
    let opened = false, hovered = false;
    const hoverDur = () => parseFloat(getComputedStyle(box).getPropertyValue("--_dur-title-hover")) || 0.4;
    const heads = (type, dur) => {
      $$("[data-sh-title-group]", box).forEach((g) => $$("[data-sh-title-band]", g).forEach((b, i) => fire(b, type, { dur, delay: i * 0.03 })));
      fire($("[data-sh-num-band]", box), type, { dur });
    };
    on(trigger, "mouseenter", () => { if (!canHover.matches) return; hovered = true; if (!opened) heads("fx:in", hoverDur()); });
    on(trigger, "mouseleave", () => { if (!canHover.matches) return; hovered = false; if (!opened) heads("fx:out", hoverDur()); });
    on(panel, "transitionend", (e) => { if (e.target === panel && e.propertyName === "grid-template-rows" && !opened) panel.hidden = true; });
    on(trigger, "click", () => {
      const dur = ms("--site-dur-expand") / 1000;
      if (!opened) {
        opened = true;
        panel.hidden = false;
        panel.getBoundingClientRect();
        box.classList.add("is-opened");
        trigger.setAttribute("aria-expanded", "true");
        heads("fx:in", dur);
        fire($("[data-sh-block-band]", box), "fx:in", { dur });
      } else {
        opened = false;
        box.classList.remove("is-opened");
        trigger.setAttribute("aria-expanded", "false");
        fire($("[data-sh-block-band]", box), "fx:out", { dur });
        if (!hovered) heads("fx:out", dur);
        if (reduce.matches) panel.hidden = true;
      }
    });
  };

  // ISSUE show more — pulls out all hidden items, focuses the first item, and removes the button row
  const more = (box) => {
    const btn = $("[data-sh-more-trigger]", box);
    btn && on(btn, "click", () => {
      const items = $$("[data-sh-more-item]", box);
      items.forEach((i) => (i.hidden = false));
      $("[data-sh-acc-trigger]", items[0] || box)?.focus({ preventScroll: true });
      $("[data-sh-more-foot]", box)?.remove();
    });
  };

  // Event slider — same Splide settings as the original (loop · auto width · 400ms cubic-bezier(.25,1,.5,1) · bounce 200)
  const carousel = (el) => {
    if (!window.Splide) return;
    const s = new Splide(el, {
      type: "loop", pagination: false, autoWidth: true, gap: "var(--sh-carousel-gap)", flickPower: 200, speed: 400,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)", focus: 0, omitEnd: true,
      padding: { left: "var(--sh-carousel-pad)", right: "var(--sh-carousel-pad)" },
      breakpoints: { 767: { focus: "center", padding: 0 } },
      i18n: { prev: "Previous slide", next: "Next slide", carousel: "Event slider", slide: "Slide", slideLabel: "No. %s" },
    }).mount();
    mounts.push(() => s.destroy());
  };

  // Photo column flow — upward on wide screens, sideways on phones. Pushes while passing the screen for the length of the first 5 items (at least 200px)
  const parallax = (box) => {
    const track = $("[data-sh-parallax-track]", box);
    if (!track) return;
    const sp = matchMedia("(max-width: 767px)");
    let tick = false;
    const update = () => {
      tick = false;
      if (reduce.matches) { box.style.setProperty("--_px", "0px"); return; }
      const m = sp.matches, outer = m ? box.offsetWidth : box.offsetHeight, inr = m ? track.offsetWidth : track.offsetHeight;
      const room = Math.max(inr - outer, 0);
      const kids = [...track.children], a = kids[0], b = kids[Math.min(5, kids.length) - 1];
      const run = a && b ? Math.max((m ? b.offsetLeft + b.offsetWidth - a.offsetLeft : b.offsetTop + b.offsetHeight - a.offsetTop) - outer, 0) : 0;
      const travel = Math.max(Math.min(run, room), Math.min(200, room));
      const r = box.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);
      box.style.setProperty("--_px", `${-p * travel}px`);
    };
    const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    on(window, "scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(box); ro.observe(track);
    mounts.push(() => ro.disconnect());
    update();
  };

  // Sub-section heading strip — on first open it is revealed over .8s, and in a section arrived at via swup it is already fully drawn as in the original (length 0)
  const pageHead = (first) => $$("[data-sh-phead-band]").forEach((b) => { const t = setTimeout(() => fire(b, "fx:in", first ? undefined : { dur: 0 })); mounts.push(() => clearTimeout(t)); });

  const mount = (first) => {
    const main = $("#swup");
    if (!main) return;
    pageHead(first);
    $$("[data-sh-acc]", main).forEach(accordion);
    $$("[data-sh-more]", main).forEach(more);
    $$("[data-sh-carousel]", main).forEach(carousel);
    $$("[data-sh-parallax]", main).forEach(parallax);
  };
  const unmount = () => { while (mounts.length) mounts.pop()(); };

  // ---------- swup — original settings as is (no transition effect · prefetch · smooth scrolling only for same-page anchors) ----------
  const useSwup = window.Swup && location.protocol.startsWith("http");
  if (useSwup) {
    const plugins = [];
    if (window.SwupA11yPlugin) plugins.push(new SwupA11yPlugin());
    if (window.SwupPreloadPlugin) plugins.push(new SwupPreloadPlugin({ preloadHoveredLinks: true, preloadVisibleLinks: true }));
    if (window.SwupScrollPlugin) plugins.push(new SwupScrollPlugin({ animateScroll: { betweenPages: false, samePageWithHash: !reduce.matches, samePage: !reduce.matches }, offset: (el) => parseFloat(getComputedStyle(el).scrollMarginTop) || 0, scrollFriction: 0.3, scrollAcceleration: 0.04 }));
    if (window.SwupBodyClassPlugin) plugins.push(new SwupBodyClassPlugin());
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ awaitAssets: true, persistAssets: false, persistTags: 'style, link[rel="stylesheet"]' }));
    const swup = new Swup({ ignoreVisit: (url, { el } = {}) => el?.closest("[data-no-swup]"), animationSelector: false, containers: ["#swup"], cache: true, native: false, linkToSelf: "navigate", plugins });
    swup.hooks.on("link:click", () => closeMenu());
    swup.hooks.on("visit:start", () => root.classList.add("-skip-fv-animation"));
    swup.hooks.before("content:replace", unmount);
    swup.hooks.on("content:replace", () => { mount(false); markNav(); scrolled(); });
    window.swup = swup;
  } else {
    // Opened via file://, swup cannot fetch the next page — only close the menu and navigate normally
    document.addEventListener("click", (e) => { if (e.target.closest("a[href$='.html']")) closeMenu(); });
  }

  const start = () => { markNav(true); scrolled(); mount(true); };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
