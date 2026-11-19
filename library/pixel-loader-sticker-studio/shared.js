// Shared across several pages — header (hide, text colour over light surfaces, service drawer, phone menu), cursor, Let's talk” hidden, cookie window, scroll progress line,
// Rise (fade, reveal, words), price switch and speech bubble, FAQ, footer top line. The loader is handled by the _fx/pixel-logo-loader part
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)");

  // When the first-visit loader lifts (fx:done), or immediately if there is no loader — original page-entered (4s fallback)
  const entered = (fn) => {
    if (root.dataset.fxLoader !== "on") return fn();
    let done = false;
    const go = () => { if (!done) { done = true; fn(); } };
    document.addEventListener("fx:done", go, { once: true });
    setTimeout(go, 4000);
  };
  window.dkEntered = entered;

  /* Header — hides after scrolling down over 6px, returns on scroll up. Text color switches by the brightness of the surface beneath the header */
  const nav = document.querySelector(".dk-nav");
  if (nav) {
    const bar = nav.querySelector(".dk-nav__bar");
    const trigger = nav.querySelector("[data-sub-trigger]");
    const sub = nav.querySelector(".dk-sub");
    const scrim = nav.querySelector(".dk-nav__scrim");
    let closeT = 0, last = scrollY;
    const setSub = (on) => {
      clearTimeout(closeT);
      if (!trigger || !sub) return;
      nav.toggleAttribute("data-sub", on);
      trigger.setAttribute("aria-expanded", String(on));
      sub.inert = !on;
    };
    const lum = (rgb) => {
      const [r, g, b] = rgb.map((v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const under = () => {
      const y = (bar?.offsetHeight ?? 0) / 2;
      const hit = document.elementsFromPoint(innerWidth / 2, y).find((e) => !nav.contains(e));
      for (let e = hit; e; e = e.parentElement) {
        const t = e.dataset?.navTheme;
        if (t === "dark" || t === "light") return t;
        const m = getComputedStyle(e).backgroundColor.match(/rgba?\(([^)]+)\)/)?.[1]?.split(/[\s,/]+/).filter(Boolean).map(Number);
        if (!m || m.length < 3 || m.some(Number.isNaN) || (m[3] ?? 1) < 0.5) continue;
        return lum(m.slice(0, 3)) > 0.4 ? "light" : "dark";
      }
      return null;
    };
    const hide = () => {
      const y = Math.max(0, scrollY);
      let h = nav.hasAttribute("data-hidden");
      if (y === 0 || nav.hasAttribute("data-mobile")) h = false;
      else if (Math.abs(y - last) >= 6) h = y > last;
      else return;
      last = y;
      if (h !== nav.hasAttribute("data-hidden")) { nav.toggleAttribute("data-hidden", h); if (h) setSub(false); }
    };
    const over = () => {
      if (scrollY <= 0) return nav.removeAttribute("data-over");
      if (nav.hasAttribute("data-hidden")) return;
      const t = under();
      t ? nav.setAttribute("data-over", t) : nav.removeAttribute("data-over");
    };
    const tick = () => { hide(); over(); };
    if (last > 0) nav.toggleAttribute("data-hidden", true);
    tick();
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", over, { passive: true });
    nav.addEventListener("focusin", () => { nav.removeAttribute("data-hidden"); over(); });
    if (trigger && sub) {
      sub.inert = true;
      trigger.addEventListener("click", (e) => { if (!fine.matches && !nav.hasAttribute("data-sub")) { e.preventDefault(); setSub(true); } });
      [trigger, sub].forEach((t) => {
        t.addEventListener("pointerenter", () => { if (fine.matches) { clearTimeout(closeT); if (t === trigger) setSub(true); } });
        t.addEventListener("pointerleave", () => { if (fine.matches && nav.hasAttribute("data-sub")) closeT = setTimeout(() => setSub(false), 180); });
      });
      scrim?.addEventListener("click", () => setSub(false));
    }
    const burger = nav.querySelector(".dk-burger"), mobile = nav.querySelector(".dk-mobile");
    const setMobile = (on) => {
      if (!burger || !mobile) return;
      nav.toggleAttribute("data-mobile", on);
      burger.setAttribute("aria-expanded", String(on));
      burger.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
      mobile.inert = !on;
      root.style.overflow = on ? "hidden" : "";
    };
    if (mobile) mobile.inert = true;
    burger?.addEventListener("click", () => setMobile(!nav.hasAttribute("data-mobile")));
    mobile?.addEventListener("click", (e) => { if (e.target.closest("a")) setMobile(false); });
    matchMedia("(min-width: 64rem)").addEventListener("change", () => { setMobile(false); setSub(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (nav.hasAttribute("data-sub")) { setSub(false); trigger?.focus(); }
      if (nav.hasAttribute("data-mobile")) { setMobile(false); burger?.focus(); }
    });
  }

  /* Cursor — the dot sticks right to the cursor position, and only its shape (hover·view·video·hidden) changes by what it is over */
  const cursor = document.querySelector(".dk-cursor");
  const wide = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
  if (cursor && wide.matches) {
    const VIEW = "[data-cursor-view] a, a[data-cursor-view], .dk-case__link, .dk-wcard a, .dk-post a";
    const TEXT = "input:not([type='checkbox']):not([type='radio']):not([type='submit']):not([type='button']), textarea";
    let x = -100, y = -100, raf = 0, video = null;
    const place = () => { raf = 0; cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`; };
    const paused = () => cursor.toggleAttribute("data-paused", !!video?.paused);
    const stateOf = (t) => {
      if (!t) return "default";
      const set = t.closest("[data-cursor]")?.dataset.cursor;
      if (set === "none") return "default";
      if (set === "view") return "view";
      if (t.closest(TEXT)) return "hidden";
      if (t.closest(VIEW)) return "view";
      if (t.closest("[data-cursor-video]")) return "video";
      if (t.closest("a, button, [role='button'], label, summary, select")) return "hover";
      return "default";
    };
    const read = (t) => {
      const s = stateOf(t);
      cursor.dataset.state = s;
      cursor.toggleAttribute("data-hidden", s === "hidden");
      const v = s === "video" ? t.closest("[data-cursor-video]") : null;
      video = v ? { paused: v.hasAttribute("data-paused") } : null;
      paused();
    };
    root.classList.add("dk-cursor-on");
    cursor.toggleAttribute("data-hidden", true);
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      if (cursor.dataset.state !== "hidden") cursor.toggleAttribute("data-hidden", false);
      if (!raf) raf = requestAnimationFrame(place);
    }, { passive: true });
    document.addEventListener("pointerover", (e) => read(e.target));
    document.addEventListener("dk:video", () => read(document.elementFromPoint(x, y)));
    addEventListener("scroll", () => { if (x >= 0) read(document.elementFromPoint(x, y)); }, { passive: true });
    root.addEventListener("mouseleave", () => cursor.toggleAttribute("data-hidden", true));
    root.addEventListener("mouseenter", () => { if (cursor.dataset.state !== "hidden") cursor.toggleAttribute("data-hidden", false); });
    wide.addEventListener("change", (e) => root.classList.toggle("dk-cursor-on", e.matches));
  }

  /* 「Let's talk” — hides once the top edge of the Contact section rises 15% above the bottom of the screen */
  const talk = document.querySelector(".dk-talk"), contact = document.querySelector("[data-talk-hide]");
  if (talk && contact) new IntersectionObserver(([e]) => { if (e) talk.toggleAttribute("data-hidden", e.isIntersecting || e.boundingClientRect.top < 0); }, { rootMargin: "0px 0px -15% 0px" }).observe(contact);

  /* Scroll progress line */
  const bar = document.querySelector(".dk-progress");
  if (bar) addEventListener("scroll", () => { const max = root.scrollHeight - innerHeight; bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`; }, { passive: true });

  /* Cookie window — turns on in .4s at 1.5s after entry, turns off in .25s once chosen */
  const cb = document.querySelector(".dk-cb");
  if (cb) {
    let stored = null;
    try { stored = localStorage.getItem("dk-consent"); } catch {}
    const panel = cb.querySelector(".dk-cb__panel"), adjust = cb.querySelector("[data-cb='adjust']");
    const close = () => {
      try { localStorage.setItem("dk-consent", String(Date.now())); } catch {}
      gsap.to(cb, { autoAlpha: 0, duration: reduce ? 0 : 0.25, ease: "power1.in", onComplete: () => { cb.hidden = true; } });
    };
    cb.querySelectorAll("[data-cb='accept'], [data-cb='reject'], [data-cb='save']").forEach((b) => b.addEventListener("click", close));
    adjust?.addEventListener("click", () => { const open = panel.hidden; panel.hidden = !open; adjust.setAttribute("aria-expanded", String(open)); });
    if (stored) cb.hidden = true;
    else entered(() => setTimeout(() => gsap.fromTo(cb, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.4, ease: "power1.out" }), 1500));
  }

  /* Float-up — original Layout: big text y60 1s power3.out (85%), small items y30 .8s power2.out (88%, siblings staggered .12s), words .15→1 scrub */
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-hero-line]").forEach((h) => gsap.from(h, { yPercent: 110, opacity: 0, duration: 1.2, ease: "power4.out" }));
    document.querySelectorAll(".dk-reveal").forEach((e) => gsap.from(e, { y: 60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: e, start: "top 85%", once: true } }));
    document.querySelectorAll(".dk-fade").forEach((e) => {
      const sibs = e.parentElement ? [...e.parentElement.children].filter((c) => c.classList.contains("dk-fade")) : [];
      gsap.from(e, { y: 30, opacity: 0, duration: 0.8, delay: sibs.length > 1 ? sibs.indexOf(e) * 0.12 : 0, ease: "power2.out", scrollTrigger: { trigger: e, start: "top 88%", once: true } });
    });
    document.querySelectorAll(".dk-words").forEach((e) => gsap.fromTo(e.querySelectorAll(".dk-word"), { opacity: 0.15 }, { opacity: 1, ease: "none", stagger: 1, scrollTrigger: { trigger: e, start: "top 80%", end: "bottom 65%", scrub: 0.5 } }));
  });

  /* Price switch — the current panel slides up in .25s (.03s stagger) and after .34s the new panel rises from 2rem below in .9s, while the height adjusts in .6s */
  document.querySelectorAll(".dk-plans").forEach((p) => {
    const sw = p.querySelector(".dk-switch"), views = p.querySelectorAll("[data-view]"), boxes = p.querySelectorAll(".dk-plans__intros, .dk-plans__views");
    const intros = p.querySelectorAll("[data-intro]");
    let t = 0;
    const show = (anim) => {
      const mode = p.dataset.mode, before = [...boxes].map((b) => b.offsetHeight);
      [...views, ...intros].forEach((v) => {
        const on = (v.dataset.view || v.dataset.intro) === mode;
        v.hidden = !on;
        v.classList.remove("is-leaving", "is-entering");
        if (on && anim) { void v.offsetWidth; v.classList.add("is-entering"); }
      });
      boxes.forEach((b, i) => {
        b.style.height = "";
        if (!anim) return;
        const h = b.offsetHeight;
        if (h === before[i]) return;
        b.style.height = `${before[i]}px`; void b.offsetHeight; b.style.height = `${h}px`;
        setTimeout(() => { b.style.height = ""; }, 650);
      });
    };
    const set = (mode) => {
      if (p.dataset.mode === mode) return;
      p.dataset.mode = mode;
      sw?.setAttribute("aria-checked", String(mode === "projects"));
      clearTimeout(t);
      if (reduce) return show(false);
      [...views, ...intros].forEach((v) => { if (!v.hidden) { v.classList.remove("is-entering"); v.classList.add("is-leaving"); } });
      t = setTimeout(() => show(true), 340);
    };
    sw?.addEventListener("click", () => set(p.dataset.mode === "projects" ? "subscriptions" : "projects"));
    p.querySelectorAll("[data-set-mode]").forEach((l) => l.addEventListener("click", () => set(l.dataset.setMode)));
    show(false);
  });
  const tips = [...document.querySelectorAll(".dk-tip")];
  const closeTips = (but) => tips.forEach((t) => t !== but && t.removeAttribute("data-open"));
  tips.forEach((t) => {
    const b = t.querySelector(".dk-tip__btn");
    t.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { closeTips(t); t.setAttribute("data-open", ""); } });
    t.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && document.activeElement !== b) t.removeAttribute("data-open"); });
    b?.addEventListener("focus", () => { closeTips(t); t.setAttribute("data-open", ""); });
    b?.addEventListener("blur", () => t.removeAttribute("data-open"));
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeTips(); });

  /* FAQ — only one opens */
  document.querySelectorAll(".dk-faq").forEach((f) => {
    const triggers = f.querySelectorAll(".dk-faq__trigger");
    const set = (b, on) => { b.setAttribute("aria-expanded", String(on)); b.closest(".dk-faq__item")?.classList.toggle("is-open", on); };
    triggers.forEach((b) => {
      b.addEventListener("click", () => {
        const on = b.getAttribute("aria-expanded") !== "true";
        if (on) triggers.forEach((o) => o !== b && set(o, false));
        set(b, on);
      });
      b.closest(".dk-faq__item")?.querySelector(".dk-faq__panel")?.addEventListener("transitionend", (e) => { if (e.propertyName === "grid-template-rows") ScrollTrigger.refresh(); });
    });
  });

  /* Footer — draw a top line when the surface just above is dark */
  const foot = document.querySelector(".dk-footer");
  if (foot) new IntersectionObserver(([e], ob) => {
    if (!e?.isIntersecting || e.boundingClientRect.top <= 2) return;
    const top = foot.getBoundingClientRect().top;
    const hit = document.elementsFromPoint(innerWidth / 2, top - 2).find((el) => !foot.contains(el) && !el.closest(".dk-nav"));
    let dark = true;
    for (let el = hit; el; el = el.parentElement) {
      const cs = getComputedStyle(el), bg = cs.backgroundImage.includes("gradient") ? cs.backgroundImage.match(/rgba?\([^)]+\)/g)?.at(-1) : cs.backgroundColor;
      const m = bg?.match(/rgba?\(([^)]+)\)/)?.[1]?.split(/[\s,/]+/).filter(Boolean).map(Number);
      if (!m || m.length < 3 || (m[3] ?? 1) < 0.5) continue;
      dark = Math.max(m[0], m[1], m[2]) < 24;
      break;
    }
    foot.toggleAttribute("data-line", dark);
    ob.disconnect();
  }).observe(foot);
})();
