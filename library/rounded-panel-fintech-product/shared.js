// Motion shared across pages — header (shrinks 82→64px on scroll with a frosted glass panel, pressing the menu unfolds a panel downward), mobile drawer,
// When the panel head is visible, items rise in order (label .5s · description 1s · button 1.25s), consent card, QR veil, page transition (fades out, then back on)
document.documentElement.classList.add("js");
gsap.registerPlugin(ScrollTrigger, CustomEase);

// The original uses a spring for each motion (mass, damping, stiffness, or visible length, bounce) — the same springs are solved and converted to GSAP curves and durations
window.avSpring = (o) => {
  let { mass = 1, damping, stiffness } = o;
  if (o.visualDuration != null) {
    const bounce = o.bounce ?? 0;
    stiffness = (2 * Math.PI / (o.visualDuration * 1.2)) ** 2;
    damping = 2 * Math.min(1, Math.max(0.05, 1 - bounce)) * Math.sqrt(stiffness * mass);
  }
  const key = `av-spring-${mass}-${damping.toFixed(3)}-${stiffness.toFixed(3)}`;
  const dt = 1 / 240;
  let x = 0, v = 0, t = 0, still = 0;
  const pts = [[0, 0]];
  while (t < 4) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt; x += v * dt; t += dt;
    pts.push([t, x]);
    still = Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.01 ? still + 1 : 0;
    if (still > 6) break;
  }
  const duration = t;
  const step = Math.max(1, Math.floor(pts.length / 60));
  const path = ["M0,0"];
  for (let i = step; i < pts.length; i += step) path.push(`L${(pts[i][0] / duration).toFixed(4)},${pts[i][1].toFixed(4)}`);
  path.push("L1,1");
  return { ease: CustomEase.get(key) || CustomEase.create(key, path.join(" ")), duration };
};

(() => {
  const head = document.querySelector(".av-head");
  const drop = head?.querySelector(".av-drop");
  const mm = gsap.matchMedia();

  // On scroll the header shrinks and a glass pane is laid down
  const onScroll = () => head?.classList.toggle("is-scrolled", scrollY > 0);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menu panel — closes when the pointer leaves the header (desktop) or when the same button or the outside is tapped (touch). Panel height opens and closes with a spring
  let openKey = null;
  const setOpen = (key) => {
    if (!head || !drop) return;
    const panels = drop.querySelectorAll(".av-drop__panel");
    head.querySelectorAll(".av-head__link[data-key]").forEach((b) => {
      const on = b.dataset.key === key;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-expanded", on ? "true" : "false");
    });
    const wasOpen = openKey !== null;
    openKey = key;
    head.classList.toggle("is-open", key !== null);
    if (key && key !== "mobile") panels.forEach((p) => p.classList.toggle("is-on", p.dataset.key === key));
    if (key) gsap.set(drop, { height: "auto" });
    const full = drop.scrollHeight;
    if (key) gsap.set(drop, { height: wasOpen ? drop.dataset.h || 0 : 0 });
    gsap.to(drop, { height: key ? full : 0, duration: (key ? grow : shrink).duration, ease: (key ? grow : shrink).ease, overwrite: true, onUpdate: () => (drop.dataset.h = drop.offsetHeight) });
    // As in the original, one link-card group (panel) is toggled on and off — cards don’t fade separately
    const shown = drop.querySelector(".av-drop__panel.is-on");
    if (key && !wasOpen) gsap.fromTo(key === "mobile" ? drop : shown, { opacity: 0.09 }, { opacity: 1, duration: 0.35, ease: "power1.out", overwrite: "auto" });
    if (!key && shown) gsap.to(shown, { opacity: 0, duration: 0.18, ease: "power1.out", overwrite: "auto" });
    if (key && wasOpen && shown) gsap.set(shown, { opacity: 1 });
  };
  // The curve exactly as measured from the original height spring (visible length .2s · bounce 0) — .217s
  const grow = { duration: 0.217, ease: CustomEase.create("av-grow", "M0,0 L0.1,0.06 0.2,0.17 0.3,0.49 0.4,0.61 0.5,0.71 0.6,0.85 0.7,0.89 0.8,0.93 0.9,0.96 0.95,0.975 1,1") };
  const shrink = { duration: 0.217, ease: CustomEase.create("av-shrink", "M0,0 L0.1,0.07 0.2,0.21 0.3,0.52 0.4,0.63 0.5,0.74 0.6,0.86 0.7,0.9 0.8,0.93 0.9,0.97 0.95,0.98 1,1") };
  // On desktop, hovering over the menu opens it right away and leaving the header closes it. On touch, it opens by press
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  head?.querySelectorAll(".av-head__link[data-key]").forEach((b) => {
    let wait = 0;
    if (fine) {
      b.addEventListener("pointerenter", () => { clearTimeout(wait); wait = setTimeout(() => setOpen(b.dataset.key), 45); });
      b.addEventListener("pointerleave", () => clearTimeout(wait));
    }
    b.addEventListener("click", (e) => {
      e.preventDefault();
      if (!fine) setOpen(openKey === b.dataset.key ? null : b.dataset.key);
    });
  });
  let leaving = 0;
  if (fine) {
    head?.addEventListener("pointerleave", () => { leaving = setTimeout(() => { if (openKey && openKey !== "mobile") setOpen(null); }, 25); });
    head?.addEventListener("pointerenter", () => clearTimeout(leaving));
  }
  head?.querySelector(".av-head__burger")?.addEventListener("click", () => setOpen(openKey ? null : "mobile"));
  document.addEventListener("click", (e) => { if (openKey && !head.contains(e.target)) setOpen(null); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { openKey && setOpen(null); closeModal(); } });

  // Logo eye — every few seconds it closes vertically to .04 in .15s and reopens in .3s (the original logo’s blink)
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) document.querySelectorAll(".av-logo svg").forEach((svg) => {
    const eyes = svg.querySelectorAll("circle");
    if (!eyes.length) return;
    gsap.set(eyes, { transformOrigin: "50% 50%" });
    const blink = () => gsap.timeline({ onComplete: () => gsap.delayedCall(gsap.utils.random(2.5, 6), blink) })
      .to(eyes, { scaleY: 0.04, duration: 0.15, ease: "power2.in" })
      .to(eyes, { scaleY: 1, duration: 0.3, ease: "power2.out" });
    gsap.delayedCall(gsap.utils.random(1.5, 4), blink);
  });

  // Consent card — disappears once chosen (saving the chosen value is added by the side that uses it)
  const consent = document.querySelector(".av-consent");
  if (consent) {
    // Original: on select, shrinks to .94 and disappears quickly (expo.out .2s)
    consent.querySelectorAll("[data-consent]").forEach((b) => b.addEventListener("click", () => {
      gsap.to(consent, { scale: 0.94, opacity: 0, duration: 0.2, ease: "expo.out", onComplete: () => gsap.delayedCall(0.2, () => consent.remove()) });
    }));
  }

  // QR curtain — app download button (desktop)
  const modal = document.querySelector(".av-modal");
  function closeModal() { modal?.classList.remove("is-open"); }
  document.querySelectorAll("[data-av-qr]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); modal?.classList.add("is-open"); }));
  modal?.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".av-modal__close")) closeModal(); });

  // Panel header rises in sequence — label and description when visible, button right on attach (the original also doesn’t wait for the button to be visible).
  const easeOut = kfFx.ease("0.25,0.1,0.25,1", "power1.out");
  mm.add({ reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
    const items = document.querySelectorAll("[data-av-in]");
    if (conditions.reduce) { gsap.set(items, { opacity: 1, y: 0 }); return; }
    items.forEach((el) => {
      const [kind, delay] = (el.dataset.avIn || "view,0").split(",");
      const y = +(el.dataset.avY ?? 8), dur = +(el.dataset.avDur ?? 0.35);
      const tw = gsap.fromTo(el, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur, delay: +delay, ease: easeOut, paused: kind === "view" });
      if (kind === "view") ScrollTrigger.create({ trigger: el.closest("[data-av-group]") || el, start: "top bottom", once: true, onEnter: () => tw.play() });
    });
  });

  // Accordion (FAQ, interview steps) — only one in a group opens at a time. Height runs on mass .2, damping 18, stiffness 280, and the answer text turns on .1s later with mass .5, damping 18, stiffness 200
  const height = avSpring({ mass: 0.2, damping: 18, stiffness: 280 });
  const fade = avSpring({ mass: 0.5, damping: 18, stiffness: 200 });
  const items = [...document.querySelectorAll(".av-qa, .av-step")];
  const toggle = (qa, open) => {
    const a = qa.querySelector(".av-qa__a");
    qa.classList.toggle("is-open", open);
    qa.querySelector("button").setAttribute("aria-expanded", open ? "true" : "false");
    const from = a.offsetHeight;
    gsap.set(a, { height: open ? "auto" : 0 });
    const to = a.offsetHeight;
    gsap.fromTo(a, { height: from }, { height: open ? to : 0, duration: height.duration, ease: height.ease, overwrite: true, onComplete: () => open && gsap.set(a, { height: "auto" }) });
    gsap.to(a.firstElementChild, { opacity: open ? 1 : 0, duration: fade.duration, ease: fade.ease, delay: open ? 0.1 : 0, overwrite: true });
  };
  items.forEach((qa) => {
    gsap.set(qa.querySelector(".av-qa__a p"), { opacity: 0 });
    qa.querySelector("button").addEventListener("click", () => {
      const open = !qa.classList.contains("is-open");
      items.forEach((o) => o !== qa && o.parentElement === qa.parentElement && o.classList.contains("is-open") && toggle(o, false));
      toggle(qa, open);
    });
  });

  // Page transition — between our own pages the body fades out in .2s and then navigates, and the new page turns on in .3s
  const main = document.querySelector("main");
  if (main && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (sessionStorage.getItem("av-nav")) { sessionStorage.removeItem("av-nav"); gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }); }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || url.pathname === location.pathname) return;
      e.preventDefault();
      sessionStorage.setItem("av-nav", "1");
      gsap.to(main, { opacity: 0, duration: 0.2, ease: "power1.in", onComplete: () => (location.href = url.href) });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(main, { opacity: 1 }); });
  }
})();
