// Shared across the site — Lenis (1.3.21) · header text color (mixes white↔black into the scroll by how far it crosses section borders, .3s power2.out when the overlay appears) · phone menu · contact card · section-jump links
(() => {
  const PD = (window.PD = window.PD || {});
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pg = probe.getContext("2d", { willReadFrequently: true });
  PD.rgb = (name, scope = document.body) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    scope.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    pg.clearRect(0, 0, 1, 1); pg.fillStyle = "transparent"; pg.fillStyle = c; pg.fillRect(0, 0, 1, 1);
    const d = pg.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };
  const css = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

  const lenis = new Lenis({ autoRaf: false });
  PD.lenis = window.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  if (reduce) lenis.options.lerp = 1;

  // ───── Header text color — data-header is dark (dark text over a light panel) or light (white text over a dark panel). Blends while the section top passes the header bar height.
  const header = document.querySelector(".pd-header");
  const onLight = PD.rgb("--kf-contrast-ink"), onDark = PD.rgb("--kf-ink");
  const want = (sec) => (sec.dataset.header === "dark" ? onLight : onDark);
  let ranges = [], override = null, tw = null;
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const derived = () => {
    if (!ranges.length) return onDark;
    const y = lenis.scroll;
    let c = ranges[0].from;
    for (const r of ranges) {
      if (y <= r.st.start) break;
      c = y >= r.st.end ? r.to : mix(r.from, r.to, (y - r.st.start) / (r.st.end - r.st.start || 1));
    }
    return c;
  };
  const paint = () => { if (!override && !tw?.isActive()) header.style.color = css(derived()); };
  PD.headerColor = {
    push(color) { override = color; tw?.kill(); tw = gsap.to(header, { color: css(color === "ink" ? onLight : onDark), duration: 0.3, ease: "power2.out" }); },
    pop() { override = null; tw?.kill(); tw = gsap.to(header, { color: css(derived()), duration: 0.3, ease: "power2.out" }); },
  };
  PD.setHeaderRanges = (root = document) => {
    ranges.forEach((r) => r.st.kill());
    ranges = [];
    const secs = [...root.querySelectorAll("[data-header]")];
    secs.forEach((sec, i) => {
      if (!i) return;
      const from = want(secs[i - 1]), to = want(sec);
      ranges.push({ from, to, st: ScrollTrigger.create({ trigger: sec, start: () => `top ${header.offsetHeight}px`, end: "top top" }) });
    });
    if (secs[0]) header.style.color = css(want(secs[0]));
    paint();
  };
  lenis.on("scroll", paint);

  // ───── Phone menu
  const menuBtn = header.querySelector(".pd-menu-btn"), menu = document.querySelector(".pd-mobile-menu");
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    open ? lenis.stop() : lenis.start();
    open ? PD.headerColor.push("paper") : PD.headerColor.pop();
  };
  menuBtn?.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));

  // ───── Contact card — overlay .3s, card from X axis −90° with perspective 800 over .6s power3.out
  const contact = document.querySelector(".pd-contact"), card = contact?.querySelector(".pd-contact__card");
  let ctw = null;
  const setContact = (open) => {
    if (!contact) return;
    ctw?.kill();
    if (open) {
      contact.classList.add("is-open");
      contact.setAttribute("aria-hidden", "false");
      lenis.stop();
      ctw = gsap.timeline().to(contact, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0).fromTo(card, { rotationX: reduce ? 0 : -90, transformOrigin: "50% 100%" }, { rotationX: 0, duration: reduce ? 0 : 0.6, ease: "power3.out" }, 0);
    } else {
      ctw = gsap.timeline({ onComplete: () => { contact.classList.remove("is-open"); contact.setAttribute("aria-hidden", "true"); lenis.start(); } })
        .to(card, { rotationX: reduce ? 0 : 90, transformOrigin: "50% 0%", duration: reduce ? 0 : 0.4, ease: "power2.in" }, 0).to(contact, { opacity: 0, duration: 0.3, ease: "power2.out" }, 0.1);
    }
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-contact]");
    if (a) { e.preventDefault(); if (menu?.classList.contains("is-open")) setMenu(false); setContact(true); return; }
    if (e.target.closest("[data-contact-close]") || e.target === contact || e.target.classList?.contains("pd-contact__stage")) setContact(false);
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { if (contact?.classList.contains("is-open")) setContact(false); if (menu?.classList.contains("is-open")) setMenu(false); } });

  // ───── Same-page section jumps (Work, About) are smooth, if the section is on another page, go to that page
  // Header menu items are buttons — smooth scroll if the section is on the same page, otherwise go to that section on the other page
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-go]");
    if (!b || b.hasAttribute("data-contact")) return;
    const url = new URL(b.dataset.go, location.href), to = url.pathname === location.pathname && url.hash ? document.querySelector(url.hash) : null;
    if (menu?.classList.contains("is-open")) setMenu(false);
    if (to) lenis.scrollTo(to, { duration: reduce ? 0 : 1.2 }); else location.href = url.href;
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || a.hasAttribute("data-contact")) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const to = document.querySelector(url.hash);
    if (!to) return;
    e.preventDefault();
    if (menu?.classList.contains("is-open")) setMenu(false);
    lenis.scrollTo(to, { duration: reduce ? 0 : 1.2 });
  });

  const ready = () => PD.setHeaderRanges();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true }); else ready();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
