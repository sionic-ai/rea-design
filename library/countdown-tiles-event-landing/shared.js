// Shared across sections — smooth scroll · header row reveal · menu transition · cursor glow · flowing strip
window.CK = (() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const isMobile = () => innerWidth <= 767;
  // Original scale — based on 1600 (.64~1.6), phone based on 402 (.75~1.194)
  const k = () => Math.min(1.6, Math.max(0.64, innerWidth / 1600));
  const km = () => Math.min(1.194, Math.max(0.75, innerWidth / 402));
  const px = (v) => v * k();
  const pxm = (v) => v * km();

  // Lenis 1.3.23 — original settings as is (.9s · cubic out · wheel ×.92)
  let lenis = null;
  if (!reduce.matches) {
    lenis = new Lenis({ duration: 0.9, easing: (t) => 1 - (1 - t) ** 3, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.92, anchors: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const offsetTop = (el) => { let t = 0; for (let n = el; n; n = n.offsetParent) t += n.offsetTop; return t; };
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const head = document.querySelector(".ck-header")?.getBoundingClientRect().height ?? 0;
    const y = offsetTop(el) + (["top", "concept", "speakers", "timetable"].includes(id) ? 0 : -head);
    history.pushState(null, "", `#${id}`);
    if (lenis) lenis.scrollTo(y, { duration: 1.35, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), force: true });
    else scrollTo({ top: y, behavior: "auto" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-scroll-target]");
    if (!a) return;
    e.preventDefault();
    scrollToId(a.dataset.scrollTarget);
  });

  // ───── Flowing band — left (−.5 → −1.5 width)·right (−1.5 → −.5 width), repeating with no curve
  const loopTrack = (track, copy, dir, dur) => {
    const w = () => Math.max(copy.getBoundingClientRect().width, 1);
    return gsap.fromTo(track, { x: () => w() * (dir === "left" ? -0.5 : -1.5) }, { x: () => w() * (dir === "left" ? -1.5 : -0.5), duration: dur, ease: "none", repeat: -1, repeatRefresh: true });
  };
  // Name band — shifts left by one set (100vw)
  const loopNames = (track, set, dur) => gsap.fromTo(track, { x: 0 }, { x: () => -Math.max(set.getBoundingClientRect().width, 1), duration: dur, ease: "none", repeat: -1, repeatRefresh: true });
  // Runs only while on screen
  const playInView = (tween, owner) => {
    tween.pause();
    return ScrollTrigger.create({ trigger: owner, start: "top bottom", end: "bottom top", onToggle: ({ isActive }) => (isActive && !document.hidden ? tween.play() : tween.pause()) });
  };

  // ───── Header row — comes down when the sponsor band touches the bottom of the screen, and goes back up while the apply oval is pinned and from 85% of the logo band above the Footer.
  const header = document.querySelector(".ck-header");
  const headerMotion = () => {
    const logos = document.querySelector(".ck-sponsors .ck-logos");
    const cta = document.querySelector(".ck-cta");
    const app = document.querySelector("#application");
    const foot = document.querySelector(".ck-fsponsors");
    if (!header || !logos || !cta || !app || !foot) return;
    let shown, tw, a, b, c, raf = 0;
    const set = (on, now) => {
      if (shown === on && !now) return;
      shown = on;
      header.dataset.motionState = on ? "visible" : "hidden";
      header.inert = !on;
      tw?.kill();
      if (now || reduce.matches) { gsap.set(header, { autoAlpha: on ? 1 : 0, yPercent: on ? 0 : -110 }); return; }
      tw = gsap.to(header, { autoAlpha: on ? 1 : 0, yPercent: on ? 0 : -110, duration: on ? 0.78 : 0.48, ease: on ? "power3.out" : "power3.inOut", overwrite: "auto" });
    };
    const judge = (now) => {
      if (!a || !b || !c) return;
      const y = scrollY;
      set(y >= a.start && !(y >= b.start && y < b.end) && !(y >= c.start), now);
    };
    const soon = (now) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => judge(now)); };
    gsap.set(header, { autoAlpha: 0, yPercent: -110 });
    shown = false;
    a = ScrollTrigger.create({ trigger: logos, start: "top bottom", end: "max", invalidateOnRefresh: true, onEnter: () => judge(), onLeaveBack: () => judge(), onRefresh: () => soon(true) });
    b = ScrollTrigger.create({ trigger: cta, start: "top top", endTrigger: app, end: () => `top ${header.getBoundingClientRect().height}px`, invalidateOnRefresh: true, onToggle: () => judge(), onRefresh: () => soon(true) });
    c = ScrollTrigger.create({ trigger: foot, start: "top 85%", end: "max", invalidateOnRefresh: true, onEnter: () => judge(), onLeaveBack: () => judge(), onRefresh: () => soon(true) });
    soon(true);
  };

  // ───── Cursor light — turns on in .48s on enter and off in .36s on leave
  const glow = (surface) => {
    const g = document.createElement("span");
    g.className = "ck-glow";
    g.setAttribute("aria-hidden", "true");
    surface.append(g);
    gsap.set(g, { autoAlpha: 0, x: 0, y: 0, xPercent: -50, yPercent: -50 });
    const sx = gsap.quickSetter(g, "x", "px"), sy = gsap.quickSetter(g, "y", "px");
    let on = false;
    const at = (e) => { const r = surface.getBoundingClientRect(); sx(e.clientX - r.left); sy(e.clientY - r.top); };
    const enter = (e) => { if (e.pointerType !== "mouse") return; on = true; at(e); gsap.to(g, { autoAlpha: 1, duration: 0.48, ease: "power2.out", overwrite: "auto" }); };
    const move = (e) => { if (e.pointerType !== "mouse") return; if (!on) return enter(e); at(e); };
    const leave = () => { on = false; gsap.to(g, { autoAlpha: 0, duration: 0.36, ease: "power2.out", overwrite: "auto" }); };
    surface.addEventListener("pointerenter", enter);
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", leave);
  };
  if (fine.matches && !reduce.matches) document.querySelectorAll(".ck-glow-surface").forEach(glow);

  return { reduce, fine, isMobile, k, km, px, pxm, lenis, scrollToId, loopTrack, loopNames, playInView, headerMotion };
})();
