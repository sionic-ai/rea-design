// Shared by all pages: renders the header and menu, and wires in the same barba 2.10.3 single-page transition as the original (orange veil), the cursor circle and the “one-section stage” (flowing sentence + props).
// Page script is MS.view("home"|"case"|"single", (container) => Register as detach), remove it at every slide change, and reattach it to the new section.
// Original values: menu .9s elastic.out(1,.62) 56 → 212×398, close .45s power3.inOut · curtain leaving from below over .6s · entering upward over .6s power3.inOut
// · cursor quickTo .4s power3.out, appear .3s/disappear .2s, initial .6x · stage transition .8s power3.inOut, flowing sentence 90px per second.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileQ = "(max-width: 767px)";
  const MS = (window.MS = { reduced, isMobile: () => matchMedia(mobileQ).matches, views: {} });

  // Redrew the same shape as the original arrow (bold ↗)
  const arrow = '<svg class="ms-arrow" viewBox="0 0 40 40" aria-hidden="true"><path d="M33.6 10.8 5.5 39a3.2 3.2 0 0 1-4.5-4.5L29.2 6.4H5.1a3.2 3.2 0 0 1 0-6.4h31.7A3.2 3.2 0 0 1 40 3.2v31.7a3.2 3.2 0 0 1-6.4 0V10.8Z" fill="currentColor"/></svg>';
  const arrowBack = arrow.replace('class="ms-arrow"', 'class="ms-arrow" style="transform:rotate(-90deg)"');
  const arrowSmall = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 4.3 2.2 15.6a1.3 1.3 0 0 1-1.8-1.8L11.7 2.5H2a1.3 1.3 0 0 1 0-2.5h12.7c.7 0 1.3.6 1.3 1.3V14a1.3 1.3 0 0 1-2.5 0V4.3Z" fill="currentColor"/></svg>';
  MS.icons = { arrow, arrowBack, arrowSmall };
  MS.roll = (t) => `<span class="ms-roll"><span class="ms-roll__t">${t}</span><span class="ms-roll__t is-clone" aria-hidden="true">${t}</span></span>`;

  const file = (href) => (new URL(href, location.href).pathname.split("/").pop() || "index.html");

  // ── Header and Menu ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("ms-head");
    const li = (href, t) => `<li class="ms-menu__li"><a href="${href}">${t}</a></li>`;
    head.innerHTML = `
      <div class="ms-head__inner">
        <div class="ms-head__texts">
          <a href="index.html" class="ms-head__logo u-en">studio wordmark</a>
          <p class="ms-head__text u-en">Service Line 1<br>Service Line 2<br>Service Line 3<br>Service Line 4</p>
        </div>
        <button class="ms-menu-btn" type="button" aria-label="Open Menu" aria-controls="ms-menu" aria-expanded="false">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </button>
        <div class="ms-menu" id="ms-menu" inert data-slot="menu-drawer">
          <nav class="ms-menu__nav u-en" aria-label="Main menu">
            <ul class="ms-menu__ul">${li("index.html", "Home")}${li("about.html", "About")}</ul>
            <ul class="ms-menu__ul is-case"><li class="ms-menu__title">Case</li>
              ${li("detail.html", "Case 1")}${li("detail.html?case=2", "Case 2")}${li("detail.html?case=3", "Case 3")}${li("detail.html?case=4", "Case 4")}${li("detail.html?case=5", "Case 5")}
            </ul>
            <ul class="ms-menu__ul">${li("list.html?case=contact", "Contact")}</ul>
          </nav>
        </div>
      </div>`;
    MS.markCurrent = () => head.querySelectorAll(".ms-menu a").forEach((a) => {
      const u = new URL(a.href);
      const on = !u.search && !u.hash && file(a.href) === file(location.href);
      on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
    MS.markCurrent();

    const btn = head.querySelector(".ms-menu-btn");
    const menu = head.querySelector(".ms-menu");
    const items = [...menu.querySelectorAll(".ms-menu__li, .ms-menu__title")];
    const dots = [...btn.querySelectorAll(".dot")];
    const css = (el, n) => parseFloat(getComputedStyle(el).getPropertyValue(n));
    let open = false;
    let tl = null;
    const fresh = () => (tl && tl.kill(), (tl = gsap.timeline()));
    const show = () => {
      if (open) return;
      open = true;
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close Menu");
      menu.removeAttribute("inert");
      gsap.set(menu, { pointerEvents: "auto" });
      const t = fresh();
      const E = "elastic.out(1, 0.62)";
      t.to(menu, { width: css(menu, "--menu-width"), height: css(menu, "--menu-height"), duration: 0.9, ease: E }, 0);
      const off = css(btn, "--dot-offset"), cw = css(btn, "--dot-cross-width"), ch = css(btn, "--dot-cross-height");
      t.to(dots[0], { y: off, rotate: 45, width: cw, height: ch, duration: 0.9, ease: E }, 0);
      t.to(dots[2], { y: -off, rotate: -45, width: cw, height: ch, duration: 0.9, ease: E }, 0);
      t.to(dots[1], { autoAlpha: 0, scale: 0, duration: 0.2, ease: "power2.in" }, 0);
      t.fromTo(items, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.05 }, 0.22);
    };
    const hide = () => {
      if (!open) return;
      open = false;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open Menu");
      if (menu.contains(document.activeElement)) btn.focus();
      menu.setAttribute("inert", "");
      gsap.set(menu, { pointerEvents: "none" });
      const t = fresh();
      const S = css(menu, "--menu-closed-size"), d = css(btn, "--dot-size");
      t.to(items, { autoAlpha: 0, y: 8, duration: 0.2, ease: "power2.in" }, 0);
      t.to(menu, { width: S, height: S, duration: 0.45, ease: "power3.inOut" }, 0.2);
      t.to([dots[0], dots[2]], { y: 0, rotate: 0, width: d, height: d, duration: 0.45, ease: "power3.inOut" }, 0.2);
      t.to(dots[1], { autoAlpha: 1, scale: 1, duration: 0.25, ease: "power2.out" }, 0.4);
    };
    btn.addEventListener("click", () => (open ? hide() : show()));
    document.addEventListener("click", (e) => { if (open && !menu.contains(e.target) && !btn.contains(e.target)) hide(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) hide(); });
    addEventListener("resize", () => { if (open) gsap.set(menu, { width: css(menu, "--menu-width"), height: css(menu, "--menu-height") }); });
    MS.closeMenu = hide;
  }

  // ── Cursor circle: on entering a target it grows .6→1 as it appears and follows the mouse .4s late ──
  MS.stalker = (el, targets = []) => {
    if (!el || reduced || MS.isMobile() || !matchMedia("(hover: hover) and (pointer: fine)").matches) return null;
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.6 });
    const qx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const qy = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    let on = false;
    const move = (e) => { qx(e.clientX); qy(e.clientY); };
    const show = (e) => {
      if (on) return;
      on = true;
      qx(e.clientX, e.clientX); qy(e.clientY, e.clientY);
      addEventListener("mousemove", move);
      gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    };
    const hide = () => {
      if (!on) return;
      on = false;
      removeEventListener("mousemove", move);
      gsap.to(el, { autoAlpha: 0, scale: 0.6, duration: 0.2, ease: "power2.in", overwrite: "auto" });
    };
    targets.forEach((t) => { t.addEventListener("mouseenter", show); t.addEventListener("mouseleave", hide); });
    const destroy = () => {
      hide();
      gsap.killTweensOf(el);
      removeEventListener("mousemove", move);
      targets.forEach((t) => { t.removeEventListener("mouseenter", show); t.removeEventListener("mouseleave", hide); });
    };
    return { show, hide, destroy };
  };

  // ── One-sheet stage (original values as is) — props are image files, About and Contact spots are alpha videos that play once from the start when they enter ──
  const D = 0.8, E = "power3.inOut", AT = 0.4, SPEED = 90;
  const has = (o) => (Array.isArray(o) ? o.length > 0 : !!o);
  const set = (o, v) => has(o) && gsap.set(o, v);
  const fill = (track, p, gap) => {
    const w = p.getBoundingClientRect().width;
    if (!w) return;
    let n = track.getBoundingClientRect().width;
    while (n - (w + gap) < innerWidth) { track.appendChild(p.cloneNode(true)); n += w + gap; }
  };
  const marquee = (track) => {
    const p = track.querySelector("p");
    if (!p) return null;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    fill(track, p, gap);
    const d = p.getBoundingClientRect().width + gap;
    return d ? gsap.fromTo(track, { x: 0 }, { x: -d, duration: d / SPEED, ease: "none", repeat: -1, paused: true }) : null;
  };
  MS.stage = {
    make(main, bg) {
      return {
        main, bg: bg || null, track: bg ? bg.firstElementChild : null,
        titleInner: main.querySelector(".ms-stage__title > span"),
        image: main.querySelector(".ms-stage__image"),
        video: main.querySelector(".ms-stage__image video"),
        fades: [...main.querySelectorAll(".ms-stage__sub, .ms-stage__text, .ms-stage__tags")],
        bgInners: bg ? [...bg.querySelectorAll("p span")] : [],
        loop: null,
      };
    },
    stop(s) {
      set(s.main, { autoAlpha: 0 });
      if (s.video) { s.video.pause(); s.video.currentTime = 0; }
      if (s.loop) s.loop.pause();
    },
    prime(s) {
      if (s.video) Object.assign(s.video, { muted: true, defaultMuted: true, playsInline: true, loop: false });
      MS.stage.stop(s);
      set(s.titleInner, { yPercent: 100 });
      set(s.bgInners, { yPercent: 100 });
    },
    layout(s, active) {
      if (s.loop) { s.loop.kill(); s.loop = null; }
      if (!s.track) return;
      const old = new Set(s.bgInners);
      gsap.set(s.track, { x: 0 });
      s.loop = reduced ? null : marquee(s.track);
      s.bgInners = [...s.bg.querySelectorAll("p span")];
      set(s.bgInners.filter((x) => !old.has(x)), { yPercent: active ? 0 : 100 });
      if (s.loop && active) s.loop.play();
    },
    leave(s) {
      const t = gsap.timeline();
      if (has(s.titleInner)) t.to(s.titleInner, { yPercent: -100, duration: D, ease: E }, 0);
      if (has(s.bgInners)) t.to(s.bgInners, { yPercent: -100, duration: D, ease: E }, 0);
      if (has(s.image)) t.to(s.image, { autoAlpha: 0, scale: 0.85, duration: 0.35, ease: "power2.in" }, 0);
      if (has(s.fades)) t.to(s.fades, { autoAlpha: 0, y: -10, duration: 0.35, ease: "power2.in" }, 0);
      t.add(() => MS.stage.stop(s));
      return t;
    },
    enter(s) {
      const t = gsap.timeline();
      t.set(s.main, { autoAlpha: 1 }, 0);
      if (has(s.titleInner)) t.fromTo(s.titleInner, { yPercent: 100 }, { yPercent: 0, duration: D, ease: E }, 0);
      if (has(s.bgInners)) t.fromTo(s.bgInners, { yPercent: 100 }, { yPercent: 0, duration: D, ease: E }, 0);
      if (has(s.image)) {
        t.fromTo(s.image, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "none" }, AT);
        t.fromTo(s.image, { scale: 0.4 }, { scale: 1, duration: 1.1, ease: "elastic.out(1, 0.6)" }, AT);
        t.add(() => { if (s.video) { s.video.currentTime = 0; s.video.play().catch(() => {}); } }, AT);
      }
      if (has(s.fades)) t.fromTo(s.fades, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.08 }, AT + 0.12);
      t.add(() => s.loop && s.loop.play(), 0);
      return t;
    },
  };
  MS.stage.kill = (s) => { if (s.loop) s.loop.kill(); s.loop = null; if (s.video) { s.video.pause(); s.video.currentTime = 0; } };
  MS.fontsReady = () => (document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]) : Promise.resolve());

  // ── Page transition: barba 2.10.3 same as the original (sync false). On leaving, wait for the curtain to fill from the bottom (.6), and when the new section attaches it lifts upward (.6) ──
  const curtain = document.querySelector("[data-transition]");
  const cover = () => gsap.timeline()
    .set(curtain, { transformOrigin: "bottom", scaleY: 0, pointerEvents: "auto" })
    .to(curtain, { scaleY: 1, duration: reduced ? 0 : 0.6, ease: "power3.inOut" });
  const uncover = () => gsap.timeline()
    .set(curtain, { transformOrigin: "top", scaleY: 1 })
    .to(curtain, { scaleY: 0, duration: reduced ? 0 : 0.6, ease: "power3.inOut" })
    .set(curtain, { pointerEvents: "none" });

  // Section registered by the page script — returns an unbind function when attached
  MS.view = (ns, enter) => (MS.views[ns] = enter);
  let off = null;
  const unmount = () => { if (off) off(); off = null; };
  const mount = (ns, container) => {
    unmount();
    const enter = MS.views[ns];
    off = (enter && enter(container)) || null;
  };

  // Attach any css and scripts from the next page that are missing, and remove css that the page doesn’t have once it has arrived
  const abs = (h) => new URL(h, location.href).href;
  const load = (tag, attrs) => new Promise((res) => {
    const el = Object.assign(document.createElement(tag), attrs);
    el.onload = el.onerror = res;
    (tag === "link" ? document.head : document.body).append(el);
  });
  const bring = async (doc) => {
    const sheets = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href);
    await Promise.all(sheets.filter((h) => !have.includes(h)).map((href) => load("link", { rel: "stylesheet", href })));
    const haveJs = [...document.querySelectorAll("script[src]")].map((sc) => sc.src);
    for (const sc of doc.querySelectorAll("script[src]")) {
      const src = abs(sc.getAttribute("src"));
      if (!haveJs.includes(src)) await load("script", { src });
    }
    return sheets;
  };
  const prune = (keep) => document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => keep.includes(l.href) || l.remove());
  // Like the original, swap the description and share meta for the new page’s, and tell screen readers about the moved page
  const META = "meta[name='description'], meta[property^='og'], meta[name^='twitter'], link[rel='canonical']";
  const swapHead = (doc) => {
    document.title = doc.title;
    document.head.querySelectorAll(META).forEach((m) => m.remove());
    doc.head.querySelectorAll(META).forEach((m) => document.head.append(m));
  };
  const announce = (container) => {
    const r = document.querySelector("[data-route-announcer]");
    if (r) r.textContent = `${document.title} Moved to the page`;
    container.focus({ preventScroll: true });
  };

  // On file:// barba can’t fetch the next page — cover with the same curtain then navigate normally, and the new page opens covered and then lifts
  const plain = (first) => {
    MS.entered = document.documentElement.classList.contains("is-entering");
    sessionStorage.removeItem("ms-curtain");
    if (MS.entered) { document.documentElement.classList.remove("is-entering"); uncover(); }
    mount(first.dataset.barbaNamespace, first);
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("data-barba-prevent")) return;
      const u = new URL(a.href, location.href);
      if (u.protocol !== location.protocol || !/\.html$/.test(u.pathname)) return;
      if (u.pathname === location.pathname && !u.search && u.hash) return;
      e.preventDefault();
      sessionStorage.setItem("ms-curtain", "1");
      cover().eventCallback("onComplete", () => (location.href = a.href));
    });
    // Returning via back leaves the curtain covering the page — clear it
    addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(curtain, { scaleY: 0, pointerEvents: "none" }); });
  };

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    if (!first) return;
    if (!window.barba || !/^https?:$/.test(location.protocol)) return plain(first);
    let keep = null;
    barba.init({
      prevent: ({ el }) => el.getAttribute("href")?.startsWith("#"),
      transitions: [{
        sync: false,
        async leave() { if (MS.closeMenu) MS.closeMenu(); await cover(); },
        async beforeEnter({ next }) {
          const doc = new DOMParser().parseFromString(next.html, "text/html");
          keep = await bring(doc);
          swapHead(doc);
          if (MS.markCurrent) MS.markCurrent();
          scrollTo(0, 0);
        },
        afterEnter({ next }) {
          if (keep) prune(keep);
          uncover();
          announce(next.container);
        },
      }],
      views: ["home", "case", "single"].map((namespace) => ({
        namespace,
        afterOnce: ({ next }) => mount(namespace, next.container),
        afterEnter: ({ next }) => mount(namespace, next.container),
        afterLeave: unmount,
      })),
    });
  };
  // Starts after the page script (loaded later) registers its sections
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : setTimeout(start);
})();
