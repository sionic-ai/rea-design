// Spanning several pages: header, phone menu, logo wave, bracket link, page transition strip, cross cursor, magnetic hover, lava board, footer, Lenis.
// The page script receives these as window.PP.
(() => {
  const PAGES = [
    { key: "list", href: "#", label: "Work", w: 49, drop: [{ href: "list.html", label: "Category 1" }, { href: "list.html#long", label: "Category 2" }] },
    { key: "directors", href: "#", label: "Directors", w: 78 },
    { key: "clients", href: "clients.html", label: "Clients", w: 61 },
    { key: "locations", href: "#", label: "Locations", w: 78 },
    { key: "about", href: "about.html", label: "About", w: 53 },
  ];
  const page = document.body.dataset.page;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const br = (label, attrs = "") => `<a ${attrs} data-brackets>${label}</a>`;

  // The logo isn’t the original but a two-line placeholder wordmark at the same position and size (152×42) — each letter waves separately
  const logoSVG = () => `<svg viewBox="0 0 152 42" aria-hidden="true">
      ${[..."LOGO"].map((c) => `<text data-logo-letter data-row="1" y="18">${c}</text>`).join("")}
      <circle data-logo-seal cx="0" cy="5" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/>
      ${[..."STUDIO"].map((c) => `<text data-logo-letter data-row="2" y="40">${c}</text>`).join("")}
    </svg>`;
  // The second line stretches to fill the width like the original wordmark — the letter wave delay is proportional to x/152 so it spreads over 0~.25s like the original
  const layoutLogo = (svg) => {
    let x1 = 0;
    const row2 = [];
    svg.querySelectorAll("text").forEach((t) => {
      const w = t.getComputedTextLength() - 0.9;
      if (t.dataset.row === "1") { t.setAttribute("x", x1); x1 += w; } else row2.push([t, w]);
    });
    // Spread the letters evenly so the last letter’s x matches the original wordmark’s last letter position (about 127px)
    const lead = row2.slice(0, -1).reduce((s, [, w]) => s + w, 0), gap = row2.length > 1 ? Math.max(0, (127 - lead) / (row2.length - 1)) : 0;
    let x2 = 0;
    row2.forEach(([t, w]) => { t.setAttribute("x", x2); x2 += w + gap; });
    svg.querySelector("circle").setAttribute("cx", x1 + 5);
  };

  const renderHeader = () => {
    const slot = document.querySelector('[data-slot="header"]');
    if (!slot) return;
    const cur = (p) => (p.key === page ? 'aria-current="page"' : "");
    const [work, ...rest] = PAGES;
    slot.className = "pp-header";
    slot.innerHTML = `
      <a class="pp-logo" href="index.html" aria-label="Home">${logoSVG()}</a>
      <nav class="pp-nav" data-label="Menu English names — Work (two categories), Director, Client, Location, About, Language, Contact">
        <div class="pp-drop">
          ${br(work.label, `class="pp-drop__trigger" href="${work.href}" style="--w:${work.w}px"`)}
          <div class="pp-drop__menu">${work.drop.map((d, i) => br(d.label, `href="${d.href}" ${i === 0 ? cur(work) : ""}`)).join("")}</div>
        </div>
        <div class="pp-nav__group">${rest.map((p) => br(p.label, `href="${p.href}" ${cur(p)} style="--w:${p.w}px"`)).join("")}</div>
        <div class="pp-nav__group">${br("KOR", 'class="pp-lang" href="#" style="--w:38px"')}${br("Contact", 'href="#contact" style="--w:84px"')}</div>
      </nav>
      <button class="pp-menu-toggle" type="button">[ Menu ]</button>`;
    layoutLogo(slot.querySelector("svg"));
    const menu = document.createElement("div");
    menu.className = "pp-menu";
    menu.dataset.slot = "mobile-menu";
    menu.inert = true;
    menu.innerHTML = `
      <div class="pp-menu__lang">[ KOR ]</div>
      <button class="pp-menu__close" type="button">[ Close ]</button>
      <div class="pp-menu__links" data-label="Menu English names — Home·Work·Director·Clients·Location·About·Contact">
        <a class="pp-menu__link" href="index.html"><span>Home</span></a>
        ${PAGES.map((p) => `<a class="pp-menu__link" href="${p.drop ? p.drop[0].href : p.href}"><span>${p.label}</span></a>`).join("")}
        <a class="pp-menu__link" href="#contact"><span>Contact</span></a>
      </div>
      <a class="pp-menu__label" href="#contact"><span class="pp-square"></span><span>Your one-line note under the menu here</span></a>`;
    slot.after(menu);
  };

  const renderFooter = () => {
    const f = document.querySelector('footer[data-slot="footer"]');
    if (!f) return;
    f.classList.add("footer", "is-paper");
    f.id = "contact";
    f.innerHTML = `
      <div class="footer__media"><div class="footer__video wf-img pp-shot wf-video" style="--h:205" data-video="footer" data-label="Video following low behind a car on a coastal road · overcast day · tall half-screen portrait"></div></div>
      <div class="footer__info">
        <h3 class="t-head footer__heading" data-label="Your closing English headline here, three lines · last word in italics">
          <span class="pp-line"><span>Write the</span></span>
          <span class="pp-line"><span>Last Line.</span></span>
          <span class="pp-line"><span>Say <i>Hello</i></span></span>
        </h3>
        <div>
          <div class="footer__loc t-body"><span>Your location here</span><span>Country</span></div>
          <div class="footer__addr t-body"><span>Your first office address goes here in one line 00-000</span><span>Phone: +00 000 000 000</span><span>Your second office address here, one line 00000</span></div>
          <div class="footer__links t-body"><a href="#">Terms of service</a><a href="#">Privacy policy</a><span>All rights reserved</span></div>
        </div>
        <div class="footer__nav t-body" data-label="Menu English name">${br("Work", 'href="list.html"')}${br("Clients", 'href="clients.html"')}${br("About", 'href="about.html"')}${br("Locations", 'href="#"')}</div>
      </div>
      <div class="footer__hi">
        <div class="wf-img pp-shot wf-video no-label" style="--h:195" data-video="footer-hi" data-label="Seaside cliff video · 10.07s loop"></div>
        <div class="footer__hi-body">
          <h4 class="t-sub" data-label="Your short English contact heading here">Get in Touch</h4>
          <div class="t-body"><a href="#">mail@example.com</a><a href="#">mail2@example.com</a></div>
        </div>
      </div>`;
  };

  const renderLava = () => {
    document.querySelectorAll(".pp-lava:empty").forEach((el) => { el.innerHTML = "<i></i><i></i><i></i><i></i><i></i>"; });
  };

  const initBrackets = () => {
    document.querySelectorAll("[data-brackets]").forEach((el) => {
      if (el.querySelector(".bracket-mark")) return;
      const label = el.textContent.trim().replace(/^\[\s*/, "").replace(/\s*\]$/, "");
      el.innerHTML = `<span class="bracket-mark">[</span><span class="bracket-label">${label}</span><span class="bracket-mark">]</span>`;
    });
  };

  // Logo wave: lifted -3.8px and -5° then lowered, with a delay proportional to letter x position (max .3s)
  const initLogo = () => {
    const link = document.querySelector(".pp-logo");
    const letters = [...(link?.querySelectorAll("[data-logo-letter], [data-logo-seal]") || [])];
    if (!link || !letters.length) return;
    layoutLogo(link.querySelector("svg"));
    const tl = gsap.timeline({ paused: true });
    letters.forEach((el) => {
      const d = (el.getBBox().x / 152) * 0.3;
      tl.to(el, { y: -3.8, rotation: -5, transformOrigin: "50% 75%", duration: 0.28, ease: "power2.inOut" }, d)
        .to(el, { y: 0, rotation: 0, duration: 0.58, ease: "power3.out" }, d + 0.28);
    });
    // The rotation origin (50% 75%) of SVG text is measured with getBBox on first play — run once beforehand so the first hover frame isn’t held up by that calculation (no visible change)
    tl.progress(1).progress(0).pause();
    const play = () => { if (!tl.isActive()) tl.restart(); };
    link.addEventListener("mouseenter", play);
    link.addEventListener("focus", play);
  };

  // Phone menu: curtain .7s → links .85s (.05 interval) → top and bottom handles .6s, with the three waves overlapping
  const initMenu = () => {
    const menu = document.querySelector(".pp-menu");
    const toggle = document.querySelector(".pp-menu-toggle");
    const close = menu?.querySelector(".pp-menu__close");
    if (!menu || !toggle) return;
    const links = [...menu.querySelectorAll(".pp-menu__link > span")];
    const head = [close, menu.querySelector(".pp-menu__lang")];
    const foot = [menu.querySelector(".pp-menu__label")];
    const E = {
      curtain: CustomEase.create("ppCurtain", "0.45, 0, 0.15, 1"),
      coast: CustomEase.create("ppCoast", "0.165, 0.84, 0.44, 1"),
      fade: CustomEase.create("ppFade", "0.215, 0.61, 0.355, 1"),
      fadeOut: CustomEase.create("ppFadeOut", "0.55, 0.055, 0.675, 0.19"),
    };
    const t = (s) => (reduced ? 0 : s);
    let tl, open = false;
    const reset = () => {
      gsap.set(menu, { visibility: "hidden", clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(links, { yPercent: 110 });
      gsap.set([...head, ...foot], { opacity: 0, y: 12 });
      menu.inert = true;
    };
    reset();
    toggle.addEventListener("click", () => {
      if (open) return;
      open = true;
      tl?.kill();
      menu.inert = false;
      PP.lenis?.stop();
      gsap.set(menu, { visibility: "visible" });
      tl = gsap.timeline()
        .to(menu, { clipPath: "inset(0% 0% 0% 0%)", duration: t(0.7), ease: E.curtain }, 0)
        .to(links, { yPercent: 0, duration: t(0.85), stagger: t(0.05), ease: E.coast }, t(0.25))
        .to(head, { opacity: 1, y: 0, duration: t(0.6), stagger: t(0.05), ease: E.fade }, t(0.25))
        .to(foot, { opacity: 1, y: 0, duration: t(0.6), ease: E.fade }, t(0.55));
    });
    close.addEventListener("click", () => {
      if (!open) return;
      open = false;
      tl?.kill();
      tl = gsap.timeline({ onComplete: () => { reset(); PP.lenis?.start(); } })
        .to([...head, ...foot], { opacity: 0, duration: t(0.2), ease: E.fadeOut }, 0)
        .to(links, { yPercent: -110, duration: t(0.45), stagger: t(0.03), ease: "power3.in" }, 0)
        .to(menu, { clipPath: "inset(0% 0% 100% 0%)", duration: t(0.6), ease: E.curtain }, t(0.25));
    });
  };

  // Page transition: a link to one of our pages is covered by a band and navigates after 850ms, and the new page opens as the band slides away
  const DURATION = 850;
  const transition = document.createElement("div");
  const initTransition = () => {
    transition.className = "pp-transition";
    transition.dataset.slot = "page-transition";
    transition.innerHTML = '<div class="pp-transition__line"></div>'.repeat(5);
    // Original DOM order: swipe strip → cursor → head
    document.body.prepend(transition);
    const enter = () => {
      transition.classList.remove("is-leaving");
      transition.classList.add("is-entering");
      setTimeout(() => transition.classList.remove("is-entering"), DURATION);
    };
    // Original: only on another page, or on a first page whose intro was already seen in this tab, does the band slide away to open
    if (page !== "home" || sessionStorage.getItem("pp-intro-seen")) enter();
    addEventListener("pageshow", (e) => { if (e.persisted) enter(); });
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.includes("#") || /^(mailto|tel):/.test(href) || a.href === location.href) return;
      e.preventDefault();
      void transition.offsetWidth;
      transition.classList.add("is-leaving");
      setTimeout(() => { location.href = a.href; }, reduced ? 0 : DURATION);
    });
  };

  // Cross cursor (original values): sticks to the spot on the next frame (no lag), and only the text follows, 10% later per frame at 60fps.
  // Over something clickable the frame widens to 52×32 and the data-cursor-text letters come in one by one, staggered up and down
  const initCursor = () => {
    if (!fine) return;
    const c = document.createElement("div");
    c.className = "pp-cursor";
    c.dataset.slot = "cursor";
    c.innerHTML = `<div class="pp-cursor__frame">
      <i class="pp-cursor__corner tl"></i><i class="pp-cursor__corner tr"></i><i class="pp-cursor__corner bl"></i><i class="pp-cursor__corner br"></i>
      <i class="pp-cursor__line v t"></i><i class="pp-cursor__line v b"></i><i class="pp-cursor__line h l"></i><i class="pp-cursor__line h r"></i>
    </div><span class="pp-cursor__text"></span>`;
    const veil = document.querySelector(".pp-transition");
    veil ? veil.after(c) : document.body.prepend(c);
    document.body.classList.add("pp-has-cursor");
    const text = c.querySelector(".pp-cursor__text");
    const INTERACTIVE = "a, button, [role='button'], [data-cursor]";
    const pos = { x: 0, y: 0, tx: 0, ty: 0, on: false };
    let raf = 0, lastT = 0, target = null, holding = false;
    const place = (x, y) => { c.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`; };
    const setText = (str) => {
      text.classList.remove("is-revealed");
      text.innerHTML = [...(str || "")].map((ch) => `<span class="pp-cursor__char"><span>${ch === " " ? "&nbsp;" : ch}</span></span>`).join("");
      if (str) requestAnimationFrame(() => requestAnimationFrame(() => text.classList.add("is-revealed")));
    };
    const render = (time) => {
      raf = 0;
      const elapsed = lastT ? Math.min(time - lastT, 64) : 1000 / 60;
      lastT = time;
      const k = reduced ? 1 : 1 - Math.pow(0.9, elapsed / (1000 / 60));
      pos.tx += (pos.x - pos.tx) * k;
      pos.ty += (pos.y - pos.ty) * k;
      if (!holding) place(pos.x, pos.y);
      text.style.transform = `translate3d(${pos.tx - pos.x}px, ${pos.ty - pos.y}px, 0)`;
      if (Math.abs(pos.x - pos.tx) + Math.abs(pos.y - pos.ty) > 0.05) raf = requestAnimationFrame(render);
      else lastT = 0;
    };
    const aim = (el) => {
      // As in the original, the frame widens only for pressable things (links · buttons), and hint text shows if it has data-cursor-text even when not pressable
      const t = el instanceof Element ? el.closest(INTERACTIVE) : null;
      c.classList.toggle("is-interactive", !!t && !t.closest("[data-cursor-plain]"));
      const say = el instanceof Element ? el.closest("[data-cursor-text]") : null;
      if (say === target) return;
      target = say;
      setText(holding ? "" : say?.dataset.cursorText || "");
    };
    addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      pos.x = e.clientX; pos.y = e.clientY;
      if (!pos.on) { pos.tx = pos.x; pos.ty = pos.y; pos.on = true; }
      c.classList.add("is-visible");
      aim(e.target);
      if (!raf) raf = requestAnimationFrame(render);
    }, { passive: true });
    document.addEventListener("pointerover", (e) => aim(e.target));
    addEventListener("pointerdown", (e) => { if (e.pointerType !== "touch" && c.classList.contains("is-interactive")) c.classList.add("is-pressed"); });
    addEventListener("pointerup", () => c.classList.remove("is-pressed"));
    const hide = () => { c.classList.remove("is-visible", "is-interactive", "is-pressed"); pos.on = false; target = null; cancelAnimationFrame(raf); raf = 0; lastT = 0; setText(""); };
    document.documentElement.addEventListener("pointerleave", hide);
    addEventListener("blur", hide);
    // While held (About magnifier) the page owns cursor position and size and hides the text — on release it returns straight to the mouse position and aims again
    PP.cursor = {
      el: c, place,
      hold(on) {
        holding = on;
        c.classList.toggle("is-hold", on);
        if (on) { setText(""); return; }
        place(pos.x, pos.y);
        pos.tx = pos.x; pos.ty = pos.y;
        text.style.transform = "translate3d(0, 0, 0)";
        target = null;
        aim(document.elementFromPoint(pos.x, pos.y));
      },
    };
  };

  // Magnetic hover: gives --psp-hover-x (max ±9px) and y (±4.5px) from the mouse position within the row, and CSS pulls the text by that much
  const initMagnet = () => {
    if (!fine || reduced) return;
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest?.("[data-magnet]");
      if (!el) return;
      const b = el.getBoundingClientRect();
      const xr = (e.clientX - b.left) / b.width, yr = (e.clientY - b.top) / b.height;
      el.style.setProperty("--psp-hover-x", `${(xr - 0.5) * Math.min(b.width * 0.12, 18)}px`);
      el.style.setProperty("--psp-hover-y", `${(yr - 0.5) * Math.min(b.height * 0.35, 9)}px`);
      el.style.setProperty("--psp-hover-origin", xr < 0.5 ? "left" : "right");
    }, { passive: true });
    document.addEventListener("pointerout", (e) => {
      const el = e.target.closest?.("[data-magnet]");
      if (el && !el.contains(e.relatedTarget)) { el.style.setProperty("--psp-hover-x", "0px"); el.style.setProperty("--psp-hover-y", "0px"); }
    });
  };

  const initLenis = () => {
    if (!fine || reduced || !window.Lenis) return null;
    const lenis = new Lenis({ lerp: 0.085 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    return lenis;
  };

  gsap.registerPlugin(ScrollTrigger, CustomEase);
  renderHeader();
  renderFooter();
  renderLava();
  initBrackets();

  // Canvas and shaders can’t read CSS variables — resolve the skin variable to a computed color, paint it on 1px and pass it as [r,g,b] (oklch relative syntax·color-mix resolve too)
  const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    document.body.append(probe);
    swatch.clearRect(0, 0, 1, 1);
    swatch.fillStyle = getComputedStyle(probe).color;
    swatch.fillRect(0, 0, 1, 1);
    probe.remove();
    return [...swatch.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  const font = (name = "--kf-font-sans") => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // Video slot: each .wf-video gets a placeholder video (media/*.mp4 — length measured from the original · 16:9) and the same playback method as the original.
  // data-video="reel-a" Any video · data-play="auto"(Autoplay, default) | "view"(plays only when within 100px of the screen, stops when it leaves — original work list) | "manual"(played by the page script)
  // data-loop="false" If so, does not repeat (the home showreel moves on to the next work when it ends)
  const CLIPS = ["reel-a", "reel-b", "reel-c", "reel-d"];
  const inView = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach(({ target, isIntersecting }) => (isIntersecting ? target.play()?.catch(() => {}) : target.pause())), { rootMargin: "100px" })
    : null;
  const mountVideo = (el) => {
    const had = el.querySelector(":scope > video");
    if (had) return had;
    const v = document.createElement("video");
    v.className = "pp-video";
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.loop = el.dataset.loop !== "false";
    v.setAttribute("aria-hidden", "true");
    const hue = parseFloat(el.style.getPropertyValue("--h")) || 0;
    v.src = `media/${el.dataset.video || CLIPS[Math.round(hue / 15) % CLIPS.length]}.mp4`;
    el.prepend(v);
    const mode = el.dataset.play || "auto";
    if (mode === "auto") { v.autoplay = true; v.play()?.catch(() => {}); }
    else if (mode === "view") inView?.observe(v);
    return v;
  };
  const mountVideos = (root) => root.querySelectorAll(".wf-video").forEach(mountVideo);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.matches(".wf-video")) mountVideo(n);
    mountVideos(n);
  }))).observe(document.body, { childList: true, subtree: true });
  mountVideos(document);

  window.PP = { fine, reduced, lenis: null, page, rgb, font, mountVideo };
  PP.lenis = initLenis();
  initMenu();
  initTransition();
  initCursor();
  initMagnet();
  addEventListener("load", () => (document.fonts?.ready ?? Promise.resolve()).then(initLogo));
})();
