// Motion shared by all pages: Lenis, character-roll splitting, hiding header band, menu opening from the center, first-session loader (the page flies in like paper),
// Parallax photo frame, contact card reveal, form validation, page transition (same barba 2.10.3 as the original — the next page opens from the center · project photo frame shrinks).
// Page scenes are added with RK.scene(fn) (fn(rk, container) returns a teardown function that is called on leaving). Set up once after all fonts have loaded so pin lengths are correct.
// Header band, menu and footer are outside the container so they’re set up only once, while those inside the container are set up and torn down with gsap.context on each transition.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The page script <script data-ns="home"> Like this, each one arrives with its own page name and gathers scenes under that name
  const pages = {};
  let introDone;
  const RK = (window.RK = {
    reduced,
    lenis: null,
    scene: (fn) => (pages[document.currentScript?.dataset.ns || "home"] ||= []).push(fn),
    intro: new Promise((r) => (introDone = r)),
  });
  if (!root.classList.contains("has-intro")) introDone();

  if (!reduced) {
    const lenis = (RK.lenis = new Lenis({ autoRaf: false }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Text roll: stack two copies of each letter (top · bottom) ──
  function splitLetters(el) {
    const text = el.textContent.trim();
    const wrap = document.createElement("span");
    wrap.setAttribute("aria-hidden", "true");
    let i = 0;
    text.split(/\s+/).forEach((word, w) => {
      if (w) wrap.append(" ");
      const wEl = document.createElement("span");
      wEl.className = "rk-letters__word";
      for (const ch of word) {
        const c = document.createElement("span");
        c.className = "rk-letters__char";
        c.style.setProperty("--i", i++);
        c.innerHTML = `<span class="rk-letters__a"></span><span class="rk-letters__b"></span>`;
        c.firstChild.textContent = ch;
        c.lastChild.textContent = ch;
        wEl.append(c);
      }
      wrap.append(wEl);
    });
    const sr = document.createElement("span");
    sr.className = "rk-hidden";
    sr.textContent = text;
    el.replaceChildren(sr, wrap);
  }
  document.querySelectorAll("[data-letters]").forEach((el) => !el.closest('[data-barba="container"]') && splitLetters(el));

  // ── Header band: hides upward when scrolling down past 80px, returns when scrolling up ──
  const header = document.querySelector(".rk-header");
  if (header && !reduced) {
    const hide = gsap.to(header, { yPercent: -100, duration: 0.35, ease: "power2.out", paused: true });
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        const down = self.direction === 1 && self.scroll() > 80 && !root.classList.contains("is-menu-open");
        down ? hide.play() : hide.reverse();
      },
    });
    header.addEventListener("focusin", () => hide.reverse());
  }

  // ── Menu: backdrop .4s, panel from center to both sides .6s, links from below at .06s intervals. On close it rewinds 1.4x faster ──
  const menu = document.getElementById("rk-menu");
  const toggle = document.querySelector('[aria-controls="rk-menu"]');
  if (menu && toggle) {
    const panel = menu.querySelector(".rk-menu__panel");
    const links = menu.querySelectorAll(".rk-menu__nav a");
    let open = false;
    let last = null;
    const hideMenu = () => { if (!open) { menu.hidden = true; RK.lenis?.start(); } };
    const tl = reduced ? null : gsap.timeline({ paused: true, onReverseComplete: hideMenu })
      .fromTo(menu.querySelector(".rk-menu__backdrop"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0)
      .fromTo(panel, { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.inOut" }, 0)
      .fromTo(links, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 }, 0.25)
      .fromTo(menu.querySelectorAll(".rk-menu__intro, .rk-menu__legal"), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0.45);
    const show = () => {
      if (open) return;
      open = true;
      last = document.activeElement;
      menu.hidden = false;
      root.classList.add("is-menu-open");
      toggle.setAttribute("aria-expanded", "true");
      RK.lenis?.stop();
      tl?.timeScale(1).play();
      panel.querySelector("a, button")?.focus();
    };
    const close = () => {
      if (!open) return;
      open = false;
      root.classList.remove("is-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      (last instanceof HTMLElement ? last : toggle).focus();
      tl ? tl.timeScale(1.4).reverse() : hideMenu();
    };
    RK.closeMenu = close;
    // When moving to another page, close at once without rewinding — so the transition curtain isn’t laid under the menu
    RK.killMenu = () => {
      if (!open) return;
      open = false;
      root.classList.remove("is-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      tl?.pause(0);
      menu.hidden = true;
    };
    toggle.addEventListener("click", () => (open ? close() : show()));
    menu.querySelectorAll("[data-menu-close]").forEach((b) => b.addEventListener("click", close));
    addEventListener("keydown", (e) => {
      if (!open) return;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      const f = [...panel.querySelectorAll("a, button")];
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    });
  }

  // ── Same-page navigation ──
  const scrollToTarget = (sel) => {
    const t = document.querySelector(sel);
    if (!t) return false;
    RK.lenis ? RK.lenis.scrollTo(t, { force: true }) : t.scrollIntoView({ behavior: "smooth" });
    return true;
  };

  // ── Contact form: only validates without sending, then swaps to a thank-you message ──
  document.querySelectorAll(".rk-contact__body").forEach((body) => {
    const form = body.querySelector("form");
    const fields = { name: form.elements.name, email: form.elements.email };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const err = {};
      if (!fields.name.value.trim()) err.name = "Please write your name.";
      const mail = fields.email.value.trim();
      if (!mail) err.email = "Please write your email address.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) err.email = "Please check the email address format.";
      for (const [k, input] of Object.entries(fields)) {
        document.getElementById(`${input.id}-error`).textContent = err[k] || "";
        input.setAttribute("aria-invalid", err[k] ? "true" : "false");
      }
      const first = Object.keys(fields).find((k) => err[k]);
      if (first) return void fields[first].focus();
      body.innerHTML = `<p class="rk-contact__done-title t-h2" tabindex="-1">A short thank-you line</p>
        <p class="rk-contact__done-text">Your two or so lines of guidance after sending go here.</p>`;
      body.firstElementChild.focus();
    });
  });

  // ── Session first loader ──
  function runLoader() {
    const loader = document.querySelector(".rk-loader");
    if (!loader) return;
    if (!root.classList.contains("has-intro")) return void loader.remove();
    clearTimeout(window.__rkIntroTimer);
    const page = document.querySelector(".rk-page");
    const out = loader.querySelector("[data-loader-percent]");
    scrollTo(0, 0);
    RK.lenis?.stop();

    const waits = [document.fonts?.ready ?? Promise.resolve()];
    if (document.readyState !== "complete") waits.push(new Promise((r) => addEventListener("load", r, { once: true })));
    let done = 0;
    waits.forEach((p) => p.then(() => done++));
    const t0 = performance.now();
    let shown = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      root.classList.remove("has-intro");
      gsap.set(page, { clearProps: "transform,visibility,boxShadow" });
      loader.remove();
      RK.lenis?.start();
      ScrollTrigger.refresh();
      introDone();
    };
    // A tilted thumbnail pops up from the bottom right, tilts briefly, then straightens and fills the screen
    const flyIn = () => {
      if (reduced) {
        gsap.set(page, { visibility: "visible" });
        loader.classList.add("is-leaving");
        loader.addEventListener("transitionend", finish, { once: true });
        return void setTimeout(finish, 800);
      }
      const w = innerWidth;
      const h = innerHeight;
      gsap.timeline({ onComplete: finish })
        .set(page, { visibility: "visible", x: w * 0.06, y: h * 1.12, rotation: -18, scale: 0.47 })
        .to(page, { x: -w * 0.09, y: h * 0.08, scale: 0.49, duration: 1.3, ease: "expo.out" })
        .to(page, { rotation: -10.5, duration: 1.3, ease: "back.out(1.6)" }, "<")
        .to(page, { rotation: 0, duration: 0.7, ease: "power2.inOut" }, "+=0.2")
        .to(page, { x: 0, y: 0, scale: 1, duration: 1.1, ease: "power3.inOut" }, "<")
        .to(page, { boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.3 }, ">-0.3");
    };
    // Counts for at least 1.5s, and ends after 8s even if not everything is received. The number follows the target by 15% each frame
    const tick = () => {
      const elapsed = performance.now() - t0;
      const ratio = elapsed >= 8000 ? 1 : done / waits.length;
      const target = Math.min(100, Math.round(100 * Math.min(ratio, elapsed / 1500)));
      shown += (target - shown) * 0.15;
      const v = target >= 100 && target - shown < 0.5 ? 100 : Math.floor(shown);
      out.textContent = String(v);
      if (v === 100) return void setTimeout(flyIn, 250);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Page Turn ──
  const wipe = document.querySelector(".rk-wipe");
  function leave(href) {
    RK.killMenu?.();
    if (reduced || !wipe) return void (location.href = href);
    RK.lenis?.stop();
    gsap.set(wipe, { visibility: "visible" });
    gsap.fromTo(wipe, { clipPath: "inset(0% 50% 0% 50%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.inOut",
      onComplete: () => (location.href = href),
    });
  }
  // Home page project View: the caption bar drops out and the photo frame shrinks into the first photo slot of the detail page (the detail side picks it up)
  function leaveToProject(a, href) {
    const project = a.closest("[data-project]");
    const media = project?.querySelector("[data-project-media]");
    if (reduced || !media) return leave(href);
    RK.lenis?.stop();
    const r = media.getBoundingClientRect();
    sessionStorage.setItem("rk:morph", JSON.stringify({ left: r.left, top: r.top, width: r.width, height: r.height, label: media.dataset.label || "" }));
    gsap.to(project.querySelectorAll("[data-project-bar] > *"), {
      autoAlpha: 0, y: 20, duration: 0.35, ease: "power2.in",
      onComplete: () => (location.href = href),
    });
  }
  function arriveFromProject() {
    const raw = sessionStorage.getItem("rk:morph");
    sessionStorage.removeItem("rk:morph");
    const target = document.querySelector("[data-morph-target]");
    if (!raw || !target || reduced) return;
    const from = JSON.parse(raw);
    const main = document.querySelector("main");
    const layer = document.createElement("div");
    layer.className = "rk-morph";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `<div class="rk-morph__frame"><div class="wf-img"></div></div>`;
    const frame = layer.firstChild;
    frame.firstChild.dataset.label = target.querySelector(".wf-img")?.dataset.label || from.label;
    document.body.append(layer);
    const rect = () => target.getBoundingClientRect();
    gsap.set(main, { autoAlpha: 0 });
    gsap.set(frame, from);
    gsap.timeline({ onComplete: () => layer.remove() })
      .to(frame, { left: () => rect().left, top: () => rect().top, width: () => rect().width, height: () => rect().height, duration: 0.9, ease: "power3.inOut" })
      .to(main, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, ">-0.36")
      .to(layer, { autoAlpha: 0, duration: 0.25, ease: "power2.out" }, ">-0.05");
  }

  const here = () => location.pathname.split("/").pop() || "index.html";
  // In-page anchors and empty links scroll instead of transitioning (barba also blocks these links)
  const samePage = (a) => {
    const href = a.getAttribute("href") || "";
    const file = href.split("#")[0];
    return href === "#" || !file || file === here();
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    const href = a.getAttribute("href");
    if (href === "#") return void e.preventDefault();
    const [file, hash] = href.split("#");
    if (samePage(a)) {
      e.preventDefault();
      if (menu && root.classList.contains("is-menu-open")) RK.closeMenu();
      if (hash && scrollToTarget(`#${hash}`)) return;
      RK.lenis ? RK.lenis.scrollTo(0, { force: true }) : scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Where barba runs (http), barba handles the transition — here only the fallback transition for places like file:// where barba can’t be used
    if (RK.barba || !/^[\w-]+\.html$/.test(file)) return;
    e.preventDefault();
    if (hash) sessionStorage.setItem("rk:hash", hash);
    a.hasAttribute("data-morph") ? leaveToProject(a, file) : leave(file);
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    gsap.set(wipe, { visibility: "hidden", clipPath: "inset(0% 50% 0% 50%)" });
    RK.lenis?.start();
  });

  // ── Parallax photo frame: the inner photo is enlarged by (2p+4)% and drifts ±p% of the frame height ──
  function parallax(box) {
    const mm = gsap.matchMedia();
    mm.add({ desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", mobile: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)" }, ({ conditions: c }) => {
      box.querySelectorAll("[data-parallax]").forEach((frame) => {
        const inner = frame.firstElementChild;
        const d = Number(frame.dataset.parallax) || 8;
        const p = c.desktop ? d : Number(frame.dataset.parallaxMobile) || d;
        const s = 1 + (2 * p + 4) / 100;
        gsap.fromTo(inner, { yPercent: -p, scale: s }, { yPercent: p, scale: s, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
  }

  // ── Contact card: while the white footer plate clears, the card plate follows from above by one screen height and settles in place ──
  function footerReveal() {
    const contact = document.querySelector(".rk-contact");
    if (!contact || reduced) return;
    gsap.fromTo(contact.querySelector(".rk-contact__inner"), { y: () => -innerHeight }, {
      y: 0, ease: "none",
      scrollTrigger: { trigger: contact, start: "top bottom", end: "clamp(top top)", scrub: true, invalidateOnRefresh: true },
    });
  }

  function scrollRoll(box) {
    box.querySelectorAll(".rk-scroll-roll").forEach((el) =>
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", toggleClass: "is-rolled" }));
  }

  // ── Container setup · walking ──
  let live = null;
  function mount(box) {
    const offs = [];
    const ctx = gsap.context(() => {
      box.querySelectorAll("[data-letters]").forEach(splitLetters);
      parallax(box);
      scrollRoll(box);
      (pages[box.dataset.barbaNamespace] || []).forEach((fn) => {
        const off = fn(RK, box);
        if (typeof off === "function") offs.push(off);
      });
    }, box);
    live = { ctx, offs };
  }
  function unmount() {
    if (!live) return;
    live.offs.forEach((f) => f());
    live.ctx.revert();
    live = null;
  }

  // ── barba: the same two transitions as the original — first page ‹View› → detail shrinks the photo frame, and the rest open the next page from the center in .9s (sync) ──
  // CSS and scene scripts used only by the next page are loaded and attached on first visit (no overlapping selectors, so they stack up)
  const loaded = (tag, attr, url) => [...document.querySelectorAll(tag)].some((n) => n[attr] === url);
  function bring(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.title) document.title = doc.title;
    const waits = [];
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      const url = new URL(l.getAttribute("href"), location.href).href;
      if (loaded('link[rel="stylesheet"]', "href", url)) return;
      const n = Object.assign(document.createElement("link"), { rel: "stylesheet", href: url });
      waits.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.head.append(n);
    });
    doc.querySelectorAll("script[data-ns]").forEach((sc) => {
      const url = new URL(sc.getAttribute("src"), location.href).href;
      if (loaded("script[src]", "src", url)) return;
      const n = Object.assign(document.createElement("script"), { src: url });
      n.dataset.ns = sc.dataset.ns;
      waits.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.body.append(n);
    });
    return Promise.all(waits);
  }
  const FIXED = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 35, overflow: "hidden" };
  const CLEAR = "position,top,left,width,height,zIndex,overflow,backgroundColor,clipPath,opacity,visibility";
  const fixNext = (box, extra) => { gsap.set(box, { ...FIXED, ...extra }); box.style.backgroundColor = "var(--kf-bg)"; };
  const rectOf = (el) => { const { left, top, width, height } = el.getBoundingClientRect(); return { left, top, width, height }; };
  function morph({ media, frame, bars, current, next }) {
    const layer = document.createElement("div");
    layer.className = "rk-morph";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `<div class="rk-morph__frame"><div class="wf-img"></div></div>`;
    const box = layer.firstChild;
    box.firstChild.dataset.label = frame.querySelector(".wf-img")?.dataset.label || media.dataset.label || "";
    return new Promise((done) => {
      gsap.timeline({ onComplete: () => { layer.remove(); done(); } })
        .to(bars, { autoAlpha: 0, y: 20, duration: 0.35, ease: "power2.in" })
        .add(() => { gsap.set(box, rectOf(media)); document.body.append(layer); gsap.set(current, { autoAlpha: 0 }); })
        .to(box, { left: () => rectOf(frame).left, top: () => rectOf(frame).top, width: () => rectOf(frame).width, height: () => rectOf(frame).height, duration: 0.9, ease: "power3.inOut" })
        .to(next, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, ">-0.36")
        .to(layer, { autoAlpha: 0, duration: 0.25, ease: "power2.out" }, ">-0.05");
    });
  }
  function startBarba() {
    RK.barba = true;
    history.scrollRestoration = "manual";
    // barba drops the #anchor from the address when navigating — keep the anchor from the clicked link and scroll to that spot on the next page
    let hash = "";
    const before = ({ trigger }) => {
      hash = trigger instanceof HTMLAnchorElement ? trigger.hash : "";
      document.dispatchEvent(new CustomEvent("rk:navigate"));
      RK.killMenu?.();
      RK.lenis?.stop();
    };
    const after = ({ next }) => {
      unmount();
      gsap.set(next.container, { clearProps: CLEAR });
      RK.lenis?.scrollTo(0, { immediate: true, force: true });
      scrollTo(0, 0);
      mount(next.container);
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      RK.lenis?.start();
      // If Lenis does not yet know the new container height, it gets clipped to 0 — measure first, then scroll
      RK.lenis?.resize();
      const t = hash && document.getElementById(hash.slice(1));
      if (t) history.replaceState(history.state, "", hash);
      if (t) RK.lenis ? RK.lenis.scrollTo(t, { immediate: true, force: true }) : t.scrollIntoView();
      next.container.focus({ preventScroll: true });
    };
    barba.init({
      prevent: ({ el }) => samePage(el) || el.hasAttribute("data-scroll-to") || el.target === "_blank" || !!el.closest(".wf-ui"),
      requestError: (trigger, action, url) => { if (action === "click") location.assign(url); return false; },
      transitions: [
        {
          name: "project-morph",
          sync: true,
          custom: ({ trigger }) => trigger instanceof HTMLElement && trigger.hasAttribute("data-morph"),
          from: { namespace: ["home"] },
          to: { namespace: ["project"] },
          before,
          async enter({ current, next, trigger }) {
            await bring(next.html);
            const media = trigger.closest("[data-project]")?.querySelector("[data-project-media]");
            const frame = next.container.querySelector("[data-morph-target]");
            if (reduced || !media || !frame) return;
            fixNext(next.container, { autoAlpha: 0 });
            return morph({ media, frame, bars: [...current.container.querySelectorAll("[data-project-bar]")], current: current.container, next: next.container });
          },
          after,
        },
        {
          name: "centre-split",
          sync: true,
          before,
          async enter({ next }) {
            await bring(next.html);
            if (reduced) return;
            if (next.container.querySelector(".rk-hero")) root.classList.add("is-loading");
            fixNext(next.container);
            return gsap.fromTo(next.container, { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.inOut" });
          },
          after,
        },
      ],
    });
  }

  const ready = Promise.all([document.fonts?.ready, new Promise((r) => (document.readyState === "loading" ? addEventListener("DOMContentLoaded", r) : r()))]);
  ready.then(() => {
    root.style.setProperty("--sbw", `${innerWidth - root.clientWidth}px`);
    runLoader();
    const first = document.querySelector('[data-barba="container"]');
    // barba fetches the next page, file:// can’t fetch, so a curtain-opening transition replaces it
    const spa = window.barba && /^https?:$/.test(location.protocol);
    if (!spa) arriveFromProject();
    mount(first);
    footerReveal();
    ScrollTrigger.refresh();
    if (spa) startBarba();
    const hash = sessionStorage.getItem("rk:hash");
    sessionStorage.removeItem("rk:hash");
    if (hash) RK.intro.then(() => setTimeout(() => {
      const t = document.getElementById(hash);
      if (t) RK.lenis ? RK.lenis.scrollTo(t, { immediate: true, force: true }) : t.scrollIntoView();
    }, 50));
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
