// Scenes — hero panel sinking · craft panel unfolding to cover (roller is roller-press-lines, sample pile is pile-deal) · horizontal process flow with per-cell die-cut·stamp·punch·fold ·
// Work tray slides out · cardboard layers gather and the original plate flies into the sample-box slot and snaps in · box lid rises · closing light comes in. Text press is handled in relief-press-text
(() => {
  const mm = gsap.matchMedia();
  const recipe = (el, token, prop) => { const b = el.style[prop]; el.style[prop] = `var(${token})`; const v = getComputedStyle(el)[prop]; el.style[prop] = b; return v; };
  const mirror = (v) => v.replace(/(-?\d*\.?\d+)px\s+(-?\d*\.?\d+)px/g, (m, x, y) => `${-parseFloat(x)}px ${y}px`);

  // ── Hero: from when the panel’s bottom edge touches the screen bottom until it exits upward, the panel moves down one screen at .86x (phone .9) and the curtain darkens to .42 ──
  mm.add({ wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", narrow: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)" }, (ctx) => {
    const hero = document.getElementById("hero"), flap = hero.querySelector(".hero__flap"), wash = hero.querySelector(".hero__wash");
    gsap.timeline({ scrollTrigger: { trigger: hero, start: "bottom bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true, onUpdate: (s) => hero.toggleAttribute("data-sinking", s.progress > 0) } })
      .fromTo(flap, { y: 0, scale: 1, transformOrigin: "50% 40%" }, { y: () => innerHeight, scale: ctx.conditions.narrow ? 0.9 : 0.86, ease: "none" }, 0)
      .fromTo(wash, { opacity: 0 }, { opacity: 0.42, ease: "none" }, 0);
    // The next panel unfolds from .94x (phone .92) around its top edge and covers the screen
    const craft = document.getElementById("craft");
    gsap.timeline({ scrollTrigger: { trigger: craft, start: "top bottom", end: "top top", scrub: true } })
      .fromTo(craft.querySelector(".craft__flap"), { scale: ctx.conditions.narrow ? 0.92 : 0.94, transformOrigin: "50% 0%" }, { scale: 1, ease: "none" }, 0);
    return () => hero.removeAttribute("data-sinking");
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // The six samples use pile-deal (no pinning · from the first card .08 · pile height of the first row)

    // ── Work: the tray moves from the envelope hole spot into place, the photo from 1.14x to 1x ──
    document.querySelectorAll(".work__item").forEach((it) => {
      const sleeve = it.querySelector(".work__sleeve-wrap"), tray = it.querySelector(".work__tray"), photo = tray.firstElementChild;
      const off2 = (ax) => () => { const a = sleeve.getBoundingClientRect(), b = tray.getBoundingClientRect(), c = gsap.getProperty(tray, ax); return ax === "x" ? a.left - (b.left - c) : a.top - (b.top - c); };
      gsap.timeline({ scrollTrigger: { trigger: it, start: "top 85%", end: "center 50%", scrub: true, invalidateOnRefresh: true } })
        .fromTo(tray, { x: off2("x"), y: off2("y") }, { x: 0, y: 0, ease: "power2.inOut", duration: 1 }, 0)
        .fromTo(photo, { scale: 1.14 }, { scale: 1, ease: "none", duration: 1 }, 0);
    });

    // ── Cardboard layers: gather from the gap (by line spacing) ──
    document.querySelectorAll(".materials__item").forEach((it) => {
      const sec = it.querySelector(".materials__section"), plies = [...sec.querySelectorAll(".materials__ply")], mid = (plies.length - 1) / 2;
      const gap = () => parseFloat(getComputedStyle(sec).rowGap) || 0;
      gsap.timeline({ scrollTrigger: { trigger: it, start: "top 88%", end: "center 52%", scrub: true, invalidateOnRefresh: true } })
        .fromTo(plies, { y: (i) => (mid - i) * gap() }, { y: 0, ease: "power2.inOut", duration: 1 }, 0);
    });

    // ── The disc is lifted (1.08x, convex), flies to the sample box lid groove and locks in ──
    const disc = document.querySelector(".materials__disc"), socket = document.querySelector(".kit__socket"), lid = socket?.closest(".kit__lid");
    if (disc && socket) {
      const flush = getComputedStyle(disc).boxShadow, raised = recipe(disc, "--rv-sh-1", "boxShadow");
      const centre = (el, own) => { const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2 - own.x, y: b.top + b.height / 2 - own.y }; };
      const travel = (ax) => () => {
        const from = centre(disc, { x: gsap.getProperty(disc, "x"), y: gsap.getProperty(disc, "y") });
        const to = centre(socket, { x: gsap.getProperty(lid, "x"), y: gsap.getProperty(lid, "y") });
        return to[ax] - from[ax];
      };
      gsap.timeline({ scrollTrigger: { trigger: document.getElementById("materials"), start: "bottom bottom", end: "bottom 20%", scrub: true, invalidateOnRefresh: true } })
        .fromTo(disc, { scale: 1, boxShadow: flush }, { scale: 1.08, boxShadow: raised, duration: 0.2, ease: "power2.out" }, 0)
        .fromTo(disc, { x: 0 }, { x: travel("x"), duration: 0.7, ease: "power1.inOut" }, 0.2)
        .fromTo(disc, { y: 0 }, { y: travel("y"), duration: 0.7, ease: "power2.in" }, 0.2)
        .to(disc, { scale: 1, boxShadow: flush, duration: 0.1, ease: "power2.in" }, 0.9);
    }
    // ── Box lid: rises from 14% below the screen with a faint shadow and settles ──
    if (lid) {
      const rest = getComputedStyle(lid).boxShadow;
      gsap.timeline({ scrollTrigger: { trigger: document.getElementById("kit"), start: "top bottom", end: "top 20%", scrub: true, invalidateOnRefresh: true } })
        .fromTo(lid, { y: () => innerHeight * 0.14, boxShadow: recipe(lid, "--rv-sh-12", "boxShadow") }, { y: 0, boxShadow: rest, ease: "power1.out", duration: 1 }, 0);
    }

    // ── Closing: light enters from 55% on the right and the text and input shadows turn in the matching direction ──
    const contact = document.getElementById("contact");
    const sun = gsap.timeline({ defaults: { ease: "none", duration: 1 }, scrollTrigger: { trigger: contact, start: "top bottom", end: "top 10%", scrub: true, invalidateOnRefresh: true } });
    sun.fromTo(contact.querySelector(".contact__light"), { x: () => innerWidth * 0.55 }, { x: 0 }, 0);
    contact.querySelectorAll(".contact__word").forEach((w) => { const r = getComputedStyle(w).textShadow; sun.fromTo(w, { textShadow: mirror(r) }, { textShadow: r }, 0); });
    contact.querySelectorAll(".rv-field__input").forEach((f) => { const r = getComputedStyle(f).boxShadow; sun.fromTo(f, { boxShadow: mirror(r) }, { boxShadow: r }, 0); });
  });

  // ── Process: cells flow horizontally inside the pinned plate, and while a cell passes 82% → 46% of the screen its hand moves ──
  mm.add({ wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", narrow: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)" }, (ctx) => {
    const sec = document.getElementById("process"), channel = sec.querySelector(".process__channel"), track = sec.querySelector(".process__track");
    const [draw, press, cut, fold] = sec.querySelectorAll(".process__step");
    sec.setAttribute("data-track", "");
    const dist = () => Math.max(0, track.scrollWidth - channel.clientWidth);
    const measure = () => sec.style.setProperty("--process-distance", `${dist()}px`);
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);
    const travel = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
    const station = (step, start = "center 82%", end = "center 46%") => ({ trigger: step, containerAnimation: travel, start, end, scrub: true });
    if (draw) gsap.timeline({ scrollTrigger: station(draw) })
      .fromTo(draw.querySelector(".process__dieline-cut"), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0)
      .fromTo(draw.querySelector(".process__dieline-score"), { opacity: 0 }, { opacity: 0.75, ease: "none", duration: 0.35 }, 0.65);
    if (press) gsap.timeline({ scrollTrigger: station(press) })
      .fromTo(press.querySelector(".process__seal"), { scale: 1.08 }, { scale: 1, ease: "power2.in", duration: 1 }, 0)
      .fromTo(press.querySelector(".process__seal-up"), { opacity: 1 }, { opacity: 0, ease: "none", duration: 0.45 }, 0.55)
      .fromTo(press.querySelector(".process__seal-down"), { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.45 }, 0.55);
    if (cut) gsap.timeline({ scrollTrigger: station(cut) })
      .fromTo(cut.querySelector(".process__hole"), { clipPath: "inset(50% 50% 50% 50% round 999px 999px 6px 6px)" }, { clipPath: "inset(0% 0% 0% 0% round 999px 999px 6px 6px)", ease: "power2.out", duration: 1 }, 0);
    if (fold) {
      const face = (n) => fold.querySelector(`.process__face--${n}`);
      gsap.timeline({ defaults: { ease: "power1.inOut", duration: 1 }, scrollTrigger: ctx.conditions.narrow ? station(fold, "center 60%", "center 28%") : station(fold, "center 74%", "center 45%") })
        .fromTo(fold.querySelector(".process__tilt"), { rotationX: 0, scale: 1 }, { rotationX: 52, scale: 1.2 }, 0)
        .fromTo(fold.querySelector(".process__net"), { rotation: 0 }, { rotation: -40 }, 0)
        .fromTo(face("n"), { rotationX: 0, filter: "brightness(1)" }, { rotationX: -90, filter: "brightness(.78)" }, 0)
        .fromTo(face("s"), { rotationX: 0, filter: "brightness(1)" }, { rotationX: 90, filter: "brightness(.95)" }, 0)
        .fromTo(face("w"), { rotationY: 0, filter: "brightness(1)" }, { rotationY: 90, filter: "brightness(.84)" }, 0)
        .fromTo(face("e"), { rotationY: 0, filter: "brightness(1)" }, { rotationY: -90, filter: "brightness(.92)" }, 0);
    }
    return () => { ScrollTrigger.removeEventListener("refreshInit", measure); sec.removeAttribute("data-track"); sec.style.removeProperty("--process-distance"); };
  });
})();
