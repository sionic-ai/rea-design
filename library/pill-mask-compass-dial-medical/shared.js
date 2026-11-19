// Site-wide: menu pill open/close, echo button text splitting, transition mask engine, subsection header, overlapping cards, footer settle
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CP = (window.CP = { reduce });

  /* ── Menu and footer shared by all sections ── slot (<header data-slot="nav">·<footer data-slot="footer">) gets filled in */
  const pages = [
    { h: "Who We Are", href: "about.html", links: ["Our Purpose", "Team", "Join Us", "News"] },
    { h: "Our Work", href: "service.html", links: ["Publications"], hrefs: ["news.html"] },
    { h: "Who We Serve", href: "page.html", links: ["Patients & Caregivers", "Healthcare Professionals"] },
    { h: "Investors", href: "#", links: ["News", "Stock Info", "Financials", "Governance", "Stay Informed"] },
  ];
  const navSlot = document.querySelector('header[data-slot="nav"]');
  if (navSlot) {
    navSlot.outerHTML = `<div class="cp-nav-veil" aria-hidden="true"></div>
<nav class="cp-nav" data-slot="nav" data-open="false" aria-label="Main menu">
  <div class="cp-nav__head">
    <a class="cp-nav__logo" href="index.html" data-label="Brand wordmark (one lowercase word)">brand</a>
    <button class="cp-nav__toggle" type="button" aria-expanded="false" aria-label="Open Menu"><svg viewBox="0 0 24 24" aria-hidden="true"><rect class="menu-line--top" x="6" y="8.25" width="12" height="1.5" rx=".75" fill="currentColor"/><rect class="menu-line--bottom" x="6" y="14.25" width="12" height="1.5" rx=".75" fill="currentColor"/></svg></button>
  </div>
  <div class="cp-nav__content">
    <ul class="cp-nav__cols">${pages.map((p) => `<li class="cp-nav__col"><a class="cp-nav__heading" href="${p.href}">${p.h}</a><ul class="cp-nav__links">${p.links.map((l, i) => `<li><a class="cp-nav__link" href="${p.hrefs?.[i] || p.href}"><i></i>${l}</a></li>`).join("")}</ul></li>`).join("")}</ul>
  </div>
  <span class="cp-nav__tab" data-label="One tail line under the menu (brand slogan)">Unlocking pathways</span>
</nav>`;
  }
  const footSlot = document.querySelector('footer[data-slot="footer"]');
  if (footSlot) {
    const cols = [["About Us", ["Who We Are", "Our Purpose", "Our Team", "Join Us"], "about.html"], ["Science & Research", ["Our Work", "Publications"], "service.html"], ["Get Started", ["Who We Serve", "Healthcare Professionals", "Patients & Caregivers"], "page.html"], ["Investors", ["News & Events", "Stock Info", "Financials", "Governance", "Stay Informed"], "#"]];
    const tri = (cls) => `<svg class="${cls}" viewBox="0 0 7 8" aria-hidden="true"><path d="M0 0l7 4-7 4z" fill="currentColor"/></svg>`;
    footSlot.outerHTML = `<footer class="cp-footer" data-slot="footer">
  <div class="cp-footer__media wf-img wf-video" data-label="Sunset ridge video · low golden backlight · full width · auto loop"></div>
  <div class="cp-footer__panel">
    <div class="cp-footer__main">
      <a class="cp-footer__logo" href="index.html" data-label="Brand wordmark (bold lowercase)">brand</a>
      <div class="cp-footer__cols">${cols.map(([h, ls, href]) => `<div class="cp-footer__col"><a class="cp-link-mono" href="${href}">${tri("cp-tri-l")}${h}${tri("")}</a><ul>${ls.map((l, i) => `<li><a class="lnk" href="${h === "Science & Research" && i === 1 ? "news.html" : href}">${l}</a></li>`).join("")}</ul></div>`).join("")}</div>
    </div>
    <hr class="cp-footer__rule">
    <div class="cp-footer__bar">
      <span class="t-legal">© 0000 Company name. Copyright line here.</span>
      <div class="cp-footer__social"><a href="#" aria-label="Video channel"><svg viewBox="0 0 18 18" aria-hidden="true"><rect x="1" y="4" width="16" height="10" rx="3" fill="currentColor"/><path d="M8 7l3 2-3 2z" fill="var(--site-noir-dark)"/></svg></a><a href="#" aria-label="X"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 3l12 12M15 3L3 15" stroke="currentColor" stroke-width="1.6"/></svg></a><a href="#" aria-label="Professional network"><svg viewBox="0 0 18 18" aria-hidden="true"><rect x="2" y="2" width="14" height="14" rx="2" fill="currentColor"/></svg></a></div>
      <nav class="cp-footer__legal" aria-label="Terms">${["Privacy policy", "Terms of service", "Information We Don’t Collect", "Zoom-in access", "Inquiry", "Frequently asked questions"].map((l) => `<a href="#">${l}</a>`).join("")}</nav>
    </div>
  </div>
  <div class="cp-footer__reveal"><p class="cp-footer__statement t-h5" data-label="Brand slogan, one English line">Unlocking pathways to a better tomorrow</p></div>
</footer>`;
  }

  /* ── Echo button: letters split one by one into two sets, an outgoing row and an incoming row ── */
  const tri = '<svg class="cp-btn__arrow" viewBox="0 0 7 8" aria-hidden="true"><path d="M0 0l7 4-7 4z" fill="currentColor"/></svg>';
  document.querySelectorAll(".cp-btn[data-roll]").forEach((btn) => {
    const label = btn.dataset.roll;
    const chars = (s) => [...s].map((c, i) => `<span class="cp-btn__ch" style="--i:${i}">${c}</span>`).join("") + `<span class="cp-btn__ch" style="--i:${[...s].length}">${tri}</span>`;
    const echoes = (side) => `<span class="cp-btn__echoes cp-btn__echoes--${side}" aria-hidden="true"><span class="cp-btn__echo"></span><span class="cp-btn__echo"></span><span class="cp-btn__echo"></span></span>`;
    btn.setAttribute("aria-label", label);
    btn.innerHTML = `${btn.hasAttribute("data-plain") ? "" : echoes("l")}<span class="cp-btn__pill"><span class="cp-btn__roll" aria-hidden="true"><span class="cp-btn__track"><span class="cp-btn__exit">${chars(label)}</span><span class="cp-btn__enter">${chars(label)}</span></span></span></span>${btn.hasAttribute("data-plain") ? "" : echoes("r")}`;
  });

  /* ── Menu pill ── entrance y -(height+48) .48s, open .26 width·corners → .34 expo height → items blur 3px .46s .018 stagger */
  const nav = document.querySelector(".cp-nav");
  if (nav) {
    const veil = document.querySelector(".cp-nav-veil");
    const content = nav.querySelector(".cp-nav__content");
    const tab = nav.querySelector(".cp-nav__tab");
    const toggle = nav.querySelector(".cp-nav__toggle");
    const items = [...nav.querySelectorAll(".cp-nav__heading, .cp-nav__link")];
    const lineT = nav.querySelector(".menu-line--top");
    const lineB = nav.querySelector(".menu-line--bottom");
    if (!reduce) gsap.fromTo(nav, { y: -(nav.offsetHeight + 48), autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.48, ease: "power2.out", onComplete: () => gsap.set(nav, { clearProps: "y" }) });
    // The original builds the open timeline up front so fromTo draws right away — items in the closed panel at rest are opacity 0 · 10px below · blur 3px
    const rest = { opacity: 0, y: 10, filter: "blur(3px)" };
    if (!reduce) gsap.set(items, rest);
    // A closed board sits outside the pill height (64) so it isn’t visible — only focus and press are blocked (inert)
    content.inert = true;
    let open = false;
    let w0 = 0, h0 = 0;
    const lock = (on) => {
      const sb = innerWidth - document.documentElement.clientWidth;
      document.body.classList.toggle("is-locked", on);
      document.body.style.paddingRight = on && sb > 0 ? `${sb}px` : "";
    };
    const openTl = () => {
      w0 = nav.offsetWidth; h0 = nav.offsetHeight;
      const tl = gsap.timeline();
      // The curtain is always laid out (transparent, not pressable) and only its background color fills up from 0. Inside the panel, items appear one by one
      // Item appear: the original code says .34, but the first change measured at 1440 is 471ms after the click (width change at 88ms as the basis, +383) — set to .38 to match the measured value
      content.inert = false;
      tl.set(veil, { pointerEvents: "auto" }, 0)
        .fromTo(veil, { backgroundColor: "rgba(11,5,3,0)", backdropFilter: "blur(0px)" }, { backgroundColor: "rgba(11,5,3,0.32)", backdropFilter: "blur(12px)", duration: 0.26, ease: "power2.out" }, 0) /* not a skin: the ink-black translucent of the original curtain (a shadow-like cover) */
        .fromTo(lineT, { y: 0, rotation: 0, svgOrigin: "12 9" }, { y: 3, rotation: 45, svgOrigin: "12 9", duration: 0.3, ease: "power2.inOut" }, 0)
        .fromTo(lineB, { y: 0, rotation: 0, svgOrigin: "12 15" }, { y: -3, rotation: -45, svgOrigin: "12 15", duration: 0.3, ease: "power2.inOut" }, 0)
        .fromTo(nav, { width: w0, borderRadius: 80 }, { width: () => Math.max(w0, Math.min(800, innerWidth - 64)), borderRadius: 32, duration: 0.26, ease: "power2.out" }, 0)
        .to(nav, { height: "auto", duration: 0.34, ease: "expo.out" }, 0.18)
        .set(nav, { overflow: "visible" }, 0.35)
        .fromTo(items, rest, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.46, stagger: 0.018, ease: "power2.out" }, 0.38);
      if (tab) tl.to(tab, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.4);
      return tl;
    };
    const closeTl = () => {
      const tl = gsap.timeline({ onComplete: () => { lock(false); gsap.set(nav, { clearProps: "width,borderRadius,height,overflow" }); gsap.set(veil, { clearProps: "all" }); gsap.set(tab, { clearProps: "opacity,visibility" }); gsap.set(items, rest); } });
      content.inert = true;
      tl.set(nav, { overflow: "hidden" }, 0)
        .to(veil, { backgroundColor: "rgba(11,5,3,0)", backdropFilter: "blur(0px)", duration: 0.26, ease: "power2.out" }, 0) /* not skin: the original curtain’s translucent ink-black */
        .to([lineT, lineB], { y: 0, rotation: 0, duration: 0.3, ease: "power2.inOut" }, 0)
        .to(nav, { height: h0, duration: 0.34, ease: "expo.out" }, 0)
        .to(nav, { width: w0, duration: 0.26, ease: "power2.out" }, 0.14);
      if (tab) tl.set(tab, { autoAlpha: 0 }, 0);
      return tl;
    };
    let tl = null;
    const set = (on) => {
      if (on === open) return;
      open = on;
      nav.dataset.open = on;
      toggle.setAttribute("aria-expanded", on);
      toggle.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
      tl?.kill();
      if (on) lock(true);
      if (reduce) {
        content.inert = !on; gsap.set(veil, { pointerEvents: on ? "auto" : "none" });
        gsap.set(nav, on ? { width: Math.min(800, innerWidth - 64), height: "auto", borderRadius: 32 } : { clearProps: "width,height,borderRadius" });
        if (!on) lock(false);
        return;
      }
      tl = on ? openTl() : closeTl();
    };
    toggle.addEventListener("click", () => set(!open));
    veil?.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  /* ── Transition mask engine ── values from the original SvgMaskTransition: progress p → r=min(1,p/(1-hold)) → linear interpolation between frames r×(N-1).
     A pill (rect) is translate(tx,ty) rotate(rotation) followed by x·y·w·h·rx, the crescent is an ellipse clipped once more by its own clipping box into a half-moon. The 1440×1024 board is fit with cover */
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  CP.mask = (stage, o) => {
    const src = window.CPFrames[o.frames];
    const data = { ...src, shapes: o.count ? src.shapes.map((s) => s.slice(0, o.count)) : src.shapes };
    const target = o.target;
    const N = data.shapes[0].length;
    const id = `cp-clip-${++uid}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "cp-mask__defs");
    svg.setAttribute("aria-hidden", "true");
    const clip = document.createElementNS(NS, "clipPath");
    clip.id = id;
    clip.setAttribute("clipPathUnits", "userSpaceOnUse");
    svg.append(clip);
    const crescent = o.frames === "CRESCENT_FRAMES";
    const nodes = data.shapes.map((kf, i) => {
      if (!crescent) { const r = document.createElementNS(NS, "rect"); clip.append(r); return { r, kf }; }
      const cid = `${id}-crop-${i}`;
      const cp = document.createElementNS(NS, "clipPath");
      cp.id = cid; cp.setAttribute("clipPathUnits", "userSpaceOnUse");
      const box = document.createElementNS(NS, "rect"); cp.append(box); svg.append(cp);
      const el = document.createElementNS(NS, "ellipse"); el.setAttribute("clip-path", `url(#${cid})`); clip.append(el);
      return { el, box, kf };
    });
    stage.append(svg);
    target.style.clipPath = `url(#${id})`;
    let W = 1, H = 1, frame = 0;
    const lerp = (a, b, t) => a + (b - a) * t;
    const draw = (f) => {
      frame = f;
      const n = Math.max(W / data.w, H / data.h), ox = (data.w * n - W) / 2, oy = (data.h * n - H) / 2;
      const a = Math.floor(f), b = Math.min(a + 1, N - 1), t = f - a;
      for (const s of nodes) {
        const A = s.kf[a], B = s.kf[b];
        const v = A.map((x, k) => lerp(x, B[k], t));
        if (!crescent) {
          s.r.setAttribute("x", v[0] * n); s.r.setAttribute("y", v[1] * n);
          s.r.setAttribute("width", Math.max(0, v[2] * n)); s.r.setAttribute("height", Math.max(0, v[3] * n));
          s.r.setAttribute("rx", v[4] * n); s.r.setAttribute("ry", v[5] * n);
          s.r.setAttribute("transform", `translate(${v[6] * n - ox} ${v[7] * n - oy}) rotate(${v[8]})`);
        } else {
          s.el.setAttribute("cx", v[0] * n - ox); s.el.setAttribute("cy", v[1] * n - oy);
          s.el.setAttribute("rx", Math.max(0, v[2] * n)); s.el.setAttribute("ry", Math.max(0, v[3] * n));
          s.box.setAttribute("x", v[4] * n - ox); s.box.setAttribute("y", v[5] * n - oy);
          s.box.setAttribute("width", Math.max(0, v[6] * n)); s.box.setAttribute("height", Math.max(0, v[7] * n));
        }
      }
    };
    const measure = () => { W = target.clientWidth || stage.clientWidth; H = target.clientHeight || stage.clientHeight; draw(frame); };
    new ResizeObserver(measure).observe(target);
    measure();
    const dwell = o.dwell ?? 0;
    const pre = o.preroll ?? 0;
    if (o.fadeIn) target.style.opacity = 0;
    let faded = false;
    const update = (p) => {
      const r = Math.min(1, (pre > 0 ? Math.max(0, (p - pre) / (1 - pre)) : p) / (dwell > 0 ? 1 - dwell : 1));
      const f = r * (N - 1);
      draw(f);
      if (o.fadeIn && !faded) { const k = Math.min(1, r / 0.15); target.style.opacity = k; if (k === 1) faded = true; }
      o.onProgress?.(p, f);
    };
    if (reduce) { update(1); return null; }
    return ScrollTrigger.create({
      trigger: o.trigger || stage, pin: o.pin ?? stage, pinSpacing: true, anticipatePin: 1,
      start: o.start || "top top", end: o.end || "+=200%", scrub: o.scrub ?? 0.5,
      onUpdate: (st) => update(st.progress), onRefresh: (st) => update(st.progress),
    });
  };

  /* ── Subpage section header ── text box children .8s·.15 stagger·.2 delay, text exits in the first 20% of scroll, and the photo goes .9x as the frame goes 2.8→3 ── */
  CP.lpHero = (stage, { frames, solid, direction }) => {
    const box = stage.querySelector(".lp-hero__box");
    const content = stage.querySelector(".lp-hero__content");
    const media = stage.querySelector(".lp-hero__media");
    if (box && !reduce) {
      gsap.set(box.children, { opacity: 0, y: 24 });
      gsap.to(box.children, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: "power2.out", delay: 0.2 });
    }
    if (!frames) return;
    const target = stage.querySelector(".cp-mask__reveal");
    CP.mask(stage, {
      frames, target, dwell: 0.09, preroll: 0.2, end: "+=220%", scrub: 0.5,
      count: frames === "CRESCENT_FRAMES" ? (innerWidth < 400 ? 6 : innerWidth < 800 ? 5 : 4) : 0,
      onProgress: (p, f) => {
        const k = Math.max(0, 1 - p / 0.2);
        content.style.opacity = k;
        content.style.transform = `translateY(${-24 * Math.min(1, p / 0.2)}px)`;
        content.style.pointerEvents = k <= 0.05 ? "none" : "auto";
        if (direction === "content-mask" && media) {
          let s = 1;
          if (f >= 2.8 && f <= 3) s = 1 - ((f - 2.8) / 0.2) * 0.1; else if (f > 3) s = 0.9;
          gsap.set(media, { scale: s, transformOrigin: "center center" });
        }
      },
    });
  };

  /* ── Overlapping cards ── scroll positions of the original useStackableCards (in screen-height m units): the headline rises from below to center over 0~.6m (cubic ease-out),
     Slides up and out at .6~1.65m (power 1.3) and the first card rises (power 2 deceleration). The next card comes one per 1m, and back cards recede .04x and 20px per section */
  CP.stack = (wrap) => {
    const cards = [...wrap.querySelectorAll(".stack-card")];
    const head = wrap.querySelector(".stack__statement");
    if (!cards.length || reduce) return;
    const n = cards.length, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    let m = innerHeight, b = 0;
    const size = () => { m = innerHeight; b = (1.65 + n - 1 + 0.25) * m; wrap.style.height = `${b + m}px`; };
    size();
    const render = (T) => {
      const i = 0.6 * m, k = 1.65 * m;
      if (head) {
        const hh = head.offsetHeight, l = m / 2 - hh / 2, o = l + hh + 60;
        const y = T <= i ? m - (1 - Math.pow(1 - clamp(T / i, 0, 1), 3)) * (m - l) : T <= k ? l - Math.pow(clamp((T - i) / (k - i), 0, 1), 1.3) * o : l - o;
        gsap.set(head, { y: y - l });
      }
      const s = cards.map((_, j) => (j === 0 ? (T > i ? 1 - Math.pow(1 - clamp((T - i) / (k - i), 0, 1), 2) : 0) : clamp((T - k - (j - 1) * m) / m, 0, 1)));
      cards.forEach((c, j) => {
        let later = 0;
        for (let q = j + 1; q < n; q++) later += s[q];
        gsap.set(c, { y: (1 - s[j]) * m - 20 * later, scale: Math.max(0.82, 1 - 0.04 * later), zIndex: j + 1 });
      });
    };
    render(0);
    ScrollTrigger.create({ trigger: wrap, start: "top top", end: () => `+=${b}`, invalidateOnRefresh: true, onRefreshInit: size, onUpdate: (st) => render(st.progress * b), onRefresh: (st) => render(st.progress * b) });
  };

  /* ── Photo row ── arrows slide one card (width+24) at a time, smoothly (snap) */
  CP.carousel = (root) => {
    if (!root) return;
    const track = root.querySelector(".carousel__track");
    root.querySelectorAll(".carousel__arrow").forEach((b) => b.addEventListener("click", () => {
      const item = track.querySelector(".carousel__item");
      track.scrollBy({ left: +b.dataset.dir * ((item?.offsetWidth || 320) + 24), behavior: reduce ? "auto" : "smooth" });
    }));
  };

  /* ── Accordion list ── height auto .35s power2.out */
  CP.accordion = (root = document) => {
    root.querySelectorAll(".acc__row").forEach((row) => {
      const btn = row.querySelector(".acc__trigger"), panel = row.querySelector(".acc__panel");
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", open);
        row.classList.toggle("is-open", open);
        if (reduce) { panel.style.height = open ? "auto" : "0px"; return; }
        if (open) gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.35, ease: "power2.out", onComplete: () => gsap.set(panel, { height: "auto" }) });
        else gsap.to(panel, { height: 0, duration: 0.35, ease: "power2.out" });
      });
    });
  };

  /* ── Float up ── original useFadeUp · useStagger: opacity 0 · y 40 → .8s power2.out, ”top 80%” once */
  CP.fadeUps = (root = document) => {
    if (reduce) return;
    root.querySelectorAll("[data-fade]").forEach((el) => {
      const kids = el.dataset.fade === "kids" ? [...el.children] : [el];
      gsap.from(kids, { opacity: 0, y: el.dataset.fadeY ? +el.dataset.fadeY : 40, duration: el.dataset.fadeDur ? +el.dataset.fadeDur : 0.8, ease: "power2.out", stagger: kids.length > 1 ? 0.15 : 0, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    });
  };

  /* ── Footer ── the main body shrinks toward the bottom by pad-x on both sides, and the footer sentence floats up */
  const main = document.querySelector("main.cp-main");
  const footer = document.querySelector(".cp-footer");
  if (main && footer && !reduce) {
    const pad = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pad-x")) || 40;
    // At progress 0 the transform is removed — if a transform remains on the body, the pinned scene inside loses position:fixed
    ScrollTrigger.create({
      trigger: footer, start: "top 80%", end: "max", invalidateOnRefresh: true,
      onUpdate: (s) => {
        if (s.progress <= 0) { main.style.transform = ""; return; }
        const min = Math.max(0, (main.offsetWidth - 2 * pad()) / main.offsetWidth);
        main.style.transformOrigin = "50% 100%";
        main.style.transform = `scale(${1 - (1 - min) * s.progress})`;
      },
      onLeaveBack: () => (main.style.transform = ""),
    });
    const st = footer.querySelector(".cp-footer__statement");
    if (st) gsap.fromTo(st, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.8, scrollTrigger: { trigger: footer, start: "top bottom", end: "max", scrub: true, invalidateOnRefresh: true } });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();

/* ── Window (modal) ── data-modal opens it, and the overlay · close button · Esc close it in .15s */
(() => {
  const modal = document.querySelector(".cp-modal");
  if (!modal) return;
  let back = null;
  const close = () => {
    if (modal.hidden || modal.classList.contains("is-closing")) return;
    modal.classList.add("is-closing");
    setTimeout(() => { modal.hidden = true; modal.classList.remove("is-closing"); back?.focus(); }, 150);
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-modal]");
    if (b) { back = b; modal.hidden = false; modal.querySelector(".cp-modal__x").focus(); return; }
    if (e.target.closest("[data-close]")) close();
  });
  addEventListener("keydown", (e) => e.key === "Escape" && close());
})();
