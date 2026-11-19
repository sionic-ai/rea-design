// Shared by all pages — Lenis (original 1.3.17 defaults), photo reveal, underline / CTA line / arrow hovers, service expand text, cursor tooltip,
// Contact panel, phone menu, footer (revealed from behind the body + particle video once → repeat), header line shuffle mode
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = matchMedia("(min-width: 64rem)");
  const TW = (window.TW = {});

  const lenis = new Lenis();
  TW.lenis = lenis;
  history.scrollRestoration = "manual";
  lenis.scrollTo(0, { immediate: true });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on("scroll", ScrollTrigger.update);

  // Wrap each letter in a 1lh-high mask — the base for a line of text rising from below (110%)
  const chars = (el) => {
    const text = el.textContent;
    el.textContent = "";
    return [...text].map((c) => {
      const box = document.createElement("span");
      Object.assign(box.style, { display: "inline-block", overflow: "hidden", lineHeight: "1lh", height: "1lh", verticalAlign: "top" });
      const ch = document.createElement("span");
      ch.style.display = "inline-block";
      ch.textContent = c === " " ? " " : c;
      box.append(ch);
      el.append(box);
      return ch;
    });
  };
  TW.chars = chars;
  TW.rise = (els, vars = {}) => {
    gsap.set(els, { yPercent: 110 });
    return gsap.to(els, { yPercent: 0, duration: reduce ? 0 : 1, stagger: 0.01, ease: "power4.out", ...vars });
  };

  // Photo entrance — photos and video in view go transparent → visible in 1s, 1.2 → 1 in 2.5s (power2.out). Off-screen ones play on entering
  TW.reveal = (els) => {
    if (!els.length) return;
    gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 1, ease: "power2.out" });
    gsap.fromTo(els, { scale: 1.2 }, { scale: 1, duration: reduce ? 0 : 2.5, ease: "power2.out" });
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    TW.reveal([...e.target.querySelectorAll(":scope > .wf-img, :scope > video")].filter((m) => !(m.previousElementSibling?.tagName === "VIDEO")));
  }), { rootMargin: "0px 0px 10% 0px" });
  document.querySelectorAll(".tw-img:not([data-manual])").forEach((b) => io.observe(b));

  // Underline — enters from -110% to 0, exits to 110% (.6s power4.inOut)
  let uCur = null;
  const uOut = (el) => gsap.to(el, { "--translate": "110%", duration: 0.6, ease: "power4.inOut", overwrite: true });
  document.addEventListener("mouseover", (e) => {
    const n = e.target.closest(".tw-uline");
    if (n === uCur || !n) return;
    if (uCur) uOut(uCur);
    gsap.fromTo(n, { "--translate": "-110%" }, { "--translate": "0%", duration: 0.6, ease: "power4.inOut", overwrite: true });
    uCur = n;
  });
  document.addEventListener("mouseout", (e) => {
    if (!uCur) return;
    const r = e.relatedTarget;
    if ((r && uCur.contains(r)) || r?.closest(".tw-uline")) return;
    uOut(uCur);
    uCur = null;
  });

  // CTA — two arrows .5s (.05 stagger), first row (primary) two top lines .7s (.1 stagger), all power4.inOut
  const lines = (t, on) => {
    const [a, b] = t.querySelectorAll(".tw-cta__lines i");
    if (!a || !b) return;
    gsap.to(a, { x: on ? "110%" : "0%", delay: on ? 0 : 0.1, duration: 0.7, ease: "power4.inOut", overwrite: true });
    gsap.to(b, { x: on ? "0%" : "-110%", delay: on ? 0.1 : 0, duration: 0.7, ease: "power4.inOut", overwrite: true });
  };
  const arrows = (t, on) => {
    const [a, b] = t.querySelectorAll(".tw-arr i");
    if (!a || !b) return;
    gsap.to(a, { x: on ? "110%" : "0%", delay: on ? 0 : 0.05, duration: 0.5, ease: "power4.inOut", overwrite: true });
    gsap.to(b, { x: on ? "0%" : "-110%", delay: on ? 0.05 : 0, duration: 0.5, ease: "power4.inOut", overwrite: true });
  };
  let cCur = null;
  const cta = (t, on) => { arrows(t, on); if (t.classList.contains("tw-cta")) lines(t, on); };
  document.addEventListener("mouseover", (e) => {
    const n = e.target.closest(".tw-cta, .tw-cta2");
    if (n === cCur) return;
    if (cCur) cta(cCur, false);
    if (n) cta(n, true);
    cCur = n;
  });
  document.addEventListener("mouseout", (e) => {
    if (!cCur) return;
    const r = e.relatedTarget;
    if ((r && cCur.contains(r)) || r?.closest(".tw-cta, .tw-cta2")) return;
    cta(cCur, false);
    cCur = null;
  });

  // Service expansion — build an inner chunk for each row (original menu-child-inner) and hide it above (-110%) from the start. Hovering raises the plate and
  // Lines drop in and stand over 1s power4.out (.05 stagger), and on leave retract upward over .5s from the last line before the panel turns off
  document.querySelectorAll(".tw-sub").forEach((li) => {
    const ul = li.querySelector(":scope > ul");
    const rows = [...ul.querySelectorAll(":scope > li")].map((r) => {
      r.style.overflow = "hidden";
      const inner = document.createElement("span");
      inner.style.display = "block";
      while (r.firstChild) inner.append(r.firstChild);
      r.append(inner);
      return inner;
    });
    gsap.set(rows, { yPercent: -110 });
    gsap.set(ul, { opacity: 0 });
    li.addEventListener("mouseenter", () => {
      gsap.set(ul, { opacity: 1 });
      gsap.to(rows, { yPercent: 0, duration: 1, stagger: 0.05, ease: "power4.out", overwrite: true });
    });
    li.addEventListener("mouseleave", () => {
      gsap.to(rows, { yPercent: -110, duration: 0.5, stagger: { each: 0.05, from: "end" }, ease: "power4.out", overwrite: true,
        onComplete: () => gsap.set(ul, { opacity: 0 }) });
    });
  });

  // Cursor tooltip — visible only over cards and stuck to the mouse position (for cards labeled on the left, shifted left by the text width)
  const tip = document.querySelector(".tw-tip");
  if (tip) {
    let mx = 0, my = 0, raf;
    const place = (x, y) => {
      const left = document.elementFromPoint(x, y)?.closest("[data-tip]")?.hasAttribute("data-tip-left");
      tip.style.left = `${left ? x - tip.offsetWidth : x}px`;
      tip.style.top = `${y}px`;
    };
    const check = () => {
      const c = document.elementFromPoint(mx, my)?.closest("[data-tip]");
      if (c) { tip.textContent = c.dataset.tip; place(mx, my); tip.classList.add("is-on"); } else tip.classList.remove("is-on");
    };
    document.addEventListener("scroll", check, { passive: true, capture: true });
    document.addEventListener("mouseover", (e) => { const c = e.target.closest("[data-tip]"); if (c) { tip.textContent = c.dataset.tip; tip.classList.add("is-on"); } });
    document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; if (tip.classList.contains("is-on")) { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => place(mx, my)); } });
    document.addEventListener("mouseout", (e) => { const c = e.target.closest("[data-tip]"); if (c && !c.contains(e.relatedTarget)) tip.classList.remove("is-on"); });
  }

  // Contact panel — backdrop .25s (.4s on close) power2.out, the panel enters from beyond the right screen edge in 1.5s power4.out and leaves in 1s power3.in (on phone it blurs in place)
  const contact = document.querySelector(".tw-contact");
  if (contact) {
    const veil = contact.querySelector(".tw-contact__veil");
    const panel = contact.querySelector(".tw-contact__panel");
    const track = contact.querySelector(".tw-contact__track");
    const hot = contact.querySelector(".tw-contact__hot");
    const box = contact.querySelector(".tw-contact__box");
    const hots = [...contact.querySelectorAll("[data-hot]")];
    const moveHot = (a, dur) => {
      const r = a.getBoundingClientRect(), b = box.getBoundingClientRect();
      gsap.to(hot, { top: r.top - b.top - 1, left: r.left - b.left - 4, width: r.width + 8, height: r.height + 3, duration: dur, ease: "power4.inOut", overwrite: true });
      hots.forEach((o) => o.classList.toggle("is-dim", o !== a));
    };
    if (track && !reduce) gsap.to(track, { x: () => -track.firstElementChild.offsetWidth, duration: 20, ease: "none", repeat: -1 });
    let open = false;
    const show = (on) => {
      if (on === open) return;
      open = on;
      contact.classList.toggle("is-open", on);
      document.body.classList.toggle("tw-open", on);
      gsap.to(contact, { autoAlpha: on ? 1 : 0, duration: on ? 0.25 : 0.4, ease: "power2.out", overwrite: true });
      if (on) {
        lenis.stop();
        gsap.fromTo(panel, { autoAlpha: 0, x: wide.matches ? innerWidth : 0 }, { autoAlpha: 1, x: 0, duration: reduce ? 0 : 1.5, ease: "power4.out", overwrite: true, onStart: () => hots[0] && moveHot(hots[0], 0) });
      } else {
        lenis.start();
        gsap.to(panel, { autoAlpha: 0, x: wide.matches ? innerWidth : 0, duration: reduce ? 0 : 1, ease: "power3.in", overwrite: true });
      }
    };
    document.querySelectorAll("[data-contact-open]").forEach((b) => b.addEventListener("click", () => show(!open)));
    contact.querySelector(".tw-contact__close").addEventListener("click", () => show(false));
    veil.addEventListener("click", () => show(false));
    addEventListener("keydown", (e) => e.key === "Escape" && show(false));
    // Hovering a link in the panel slides a gray box to that row with .5s power4.inOut (on opening it stands at the first row right away)
    hots.forEach((a) => a.addEventListener("mouseenter", () => moveHot(a, 0.5)));
  }

  // Phone menu — two lines turn into an X (.5s power4.out) and big text rises. On close it runs in reverse, twice as fast
  const burger = document.querySelector(".tw-nav__burger button");
  const mmenu = document.querySelector(".tw-mmenu");
  if (burger && mmenu) {
    const [l1, l2] = burger.querySelectorAll("line");
    const items = [...mmenu.querySelectorAll(".tw-mmenu__big > li > *:first-child")].flatMap(chars);
    const tl = gsap.timeline({ paused: true })
      .set(mmenu, { visibility: "visible" })
      .fromTo(l1, { attr: { y1: 0.5, y2: 0.5 }, rotation: 0, svgOrigin: "10 4" }, { attr: { y1: 4, y2: 4 }, rotation: 45, svgOrigin: "10 4", duration: 0.5, ease: "power4.out" }, 0)
      .fromTo(l2, { attr: { y1: 7.5, y2: 7.5 }, rotation: 0, svgOrigin: "10 4" }, { attr: { y1: 4, y2: 4 }, rotation: -45, svgOrigin: "10 4", duration: 0.5, ease: "power4.out" }, 0)
      .fromTo(mmenu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "power4.inOut" }, 0)
      .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.01, ease: "power4.out" }, 0.3);
    let on = false;
    burger.addEventListener("click", () => { on = !on; on ? tl.timeScale(1).play(0) : tl.timeScale(2).reverse(); on ? lenis.stop() : lenis.start(); });
  }

  // Footer — a footer pinned to the screen under the body (z 1) rises into place from 80% down (scroll-linked)
  const foot = document.querySelector(".tw-foot");
  const main = document.querySelector(".tw-main");
  if (foot && main) {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      const spacer = document.createElement("div");
      spacer.className = "tw-foot-space";
      foot.before(spacer);
      const fit = () => (spacer.style.height = `${foot.offsetHeight}px`);
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(foot);
      gsap.set(foot, { position: "fixed", bottom: 0, left: 0, width: "100%", zIndex: 0 });
      gsap.fromTo(foot, { yPercent: 80 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: spacer, start: "top bottom", end: "bottom bottom", scrub: true } });
      return () => { ro.disconnect(); spacer.remove(); gsap.set(foot, { clearProps: "all" }); };
    });
    const boom = foot.querySelector(".tw-foot__vid--boom video");
    const loop = foot.querySelector(".tw-foot__vid--loop video");
    if (boom && loop) {
      boom.addEventListener("ended", () => { boom.parentElement.style.display = "none"; loop.parentElement.style.visibility = "visible"; loop.currentTime = 0; loop.play().catch(() => {}); });
      ScrollTrigger.create({ trigger: document.body, start: "bottom bottom", once: true, onEnter: () => boom.play().catch(() => {}) });
    }
  }

  // Video cell — plays only when visible
  const vio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())));
  document.querySelectorAll("video[data-auto]").forEach((v) => vio.observe(v));
})();
