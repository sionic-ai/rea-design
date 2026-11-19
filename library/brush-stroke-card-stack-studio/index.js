// Home-only motion: cursor card · logo marquee · collage push-out · 3D card stack.
// Like the original, the marquee and card stack attach before entering (scroll), the cursor card and collage attach after the brush stroke clears (hand).
(() => {
const { reduce, finePointer } = EF;

const hand = (box, k) => {
  // ── Cursor card: follows with 1s power4, tilts by the distance moved, and switches to the next video every 300px of movement
  k.mm.add("(min-width: 992px) and (hover: hover) and (pointer: fine)", () => {
    const zone = box.querySelector("[data-cursor-cards]");
    const card = zone.querySelector("[data-cursor-card]");
    const medias = zone.querySelector("[data-cursor-medias]");
    const items = [...medias.children];
    const qx = gsap.quickTo(card, "x", { duration: 1, ease: "power4" });
    const qy = gsap.quickTo(card, "y", { duration: 1, ease: "power4" });
    const qr = gsap.quickTo(card, "rotation", { duration: 1, ease: "power4" });
    const mx = gsap.quickTo(medias, "xPercent", { duration: 0.6, ease: "power2" });
    const my = gsap.quickTo(medias, "yPercent", { duration: 0.7, ease: "power2" });
    gsap.set(card, { autoAlpha: 0, xPercent: -50, yPercent: -50, translate: "none", left: "50%", top: "50%" });
    let lx = 0, ly = 0, dist = 0, idx = 1, started = false, blocked = false, idle = 0;
    const move = (e) => {
      const x = e.clientX, y = e.clientY;
      const r = zone.getBoundingClientRect();
      if (e.target.closest("a, button")) {
        if (!blocked) (blocked = true), gsap.to(card, { autoAlpha: 0, duration: 0.25, ease: "power2.out" });
        lx = x; ly = y;
        return;
      }
      if (blocked) (blocked = false), gsap.to(card, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
      if (!started) {
        started = true; lx = x; ly = y;
        gsap.set(card, { x: x - r.width / 2, y: y - r.top - r.height / 2 });
        gsap.to(card, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
      }
      const dx = (x - lx) / 2, dy = (y - ly) / 2;
      qr((x - lx) / 4);
      qx(x - r.width / 2);
      qy(y - r.top - r.height / 2);
      mx(-gsap.utils.clamp(-8, 8, dx));
      my(-gsap.utils.clamp(-8, 8, dy));
      lx = x; ly = y;
      dist += Math.abs(dx) + Math.abs(dy);
      if (dist > 300) {
        dist = 0;
        items.forEach((m) => m.classList.remove("on"));
        items[idx++ % items.length].classList.add("on");
      }
      clearTimeout(idle);
      idle = setTimeout(() => (qr(0), mx(0), my(0)), 66);
    };
    const leave = () => {
      started = false; blocked = false;
      clearTimeout(idle);
      qr(0); mx(0); my(0);
      gsap.to(card, { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
    };
    zone.addEventListener("mousemove", move);
    zone.addEventListener("mouseleave", leave);
    const p = EF.pointer;
    const zr = zone.getBoundingClientRect();
    if (p && p.y >= zr.top && p.y <= zr.bottom) {
      const el = document.elementFromPoint(p.x, p.y);
      el && move({ clientX: p.x, clientY: p.y, target: el });
    }
    return () => {
      zone.removeEventListener("mousemove", move);
      zone.removeEventListener("mouseleave", leave);
      gsap.set([card, medias], { clearProps: "all" });
    };
  });

  // ── Collage: the hovered piece scales 1.075×, neighbors are pushed by the overlap and move less the farther away (0.8s move curve)
  const collage = (root) => {
    const list = root.querySelector("[data-collage-list]");
    const items = [...root.querySelectorAll("[data-collage-item]")];
    const inner = (el) => el.querySelector("[data-collage-inner]");
    const rot = new Map(items.map((el) => [el, gsap.utils.random(-5, 5, 0.1)]));
    const falloff = (d) => { const x = 1 / (1 + Math.pow(d - 1, 1.2) * 0.45); return d === 2 ? x * 1.1 : x; };
    const go = (el, xp, yp, s, r = 0) => gsap.to(inner(el), { xPercent: xp, yPercent: yp, scale: s, rotation: r, duration: 0.8, ease: "move", overwrite: true });
    let active = null;
    const reset = () => { active = null; items.forEach((el) => go(el, 0, 0, 1, 0)); };
    const focus = (el) => {
      if (active === el) return;
      active = el;
      const lr = list.getBoundingClientRect();
      const cy = lr.top + lr.height / 2;
      const gap = lr.width / 100;
      const sorted = [...items].sort((a, b) => { const A = a.getBoundingClientRect(), B = b.getBoundingClientRect(); return A.left + A.width / 2 - (B.left + B.width / 2); });
      const i = sorted.indexOf(el);
      const r = el.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const left = c - (r.width * 1.075) / 2, right = c + (r.width * 1.075) / 2;
      let pushL = 0, pushR = 0;
      if (sorted[i - 1]) { const b = sorted[i - 1].getBoundingClientRect(); pushL = Math.min(0, left - gap - (b.left + b.width / 2 + (b.width * 0.9) / 2)) * 0.5; }
      if (sorted[i + 1]) { const b = sorted[i + 1].getBoundingClientRect(); pushR = Math.max(0, right + gap - (b.left + b.width / 2 - (b.width * 0.9) / 2)) * 0.5; }
      sorted.forEach((o, j) => {
        if (o === el) return go(o, 0, 0, 1.075, 0);
        const b = o.getBoundingClientRect();
        const d = j - i, f = falloff(Math.abs(d));
        const dy = (cy - (b.top + b.height / 2)) / (lr.height / 2);
        go(o, ((d < 0 ? pushL : pushR) * f / b.width) * 100, 15 * dy * f, 0.9 - (1 - f) * 0.12, rot.get(o) * f);
      });
    };
    if (finePointer) {
      k.on(root, "pointermove", (e) => {
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-collage-item]");
        el && root.contains(el) ? focus(el) : reset();
      });
      k.on(root, "pointerleave", reset);
    } else {
      items.forEach((el) => el.addEventListener("click", (e) => (e.stopPropagation(), active === el ? reset() : focus(el))));
      k.on(document, "click", (e) => root.contains(e.target) || reset());
    }
  };
  if (!reduce) box.querySelectorAll("[data-collage]").forEach(collage);
};

const scroll = (box, k) => {
  // ── Logo marquee: flows left, reverses when scrolling backward, and shifts by 10vw with the scroll
  box.querySelectorAll("[data-marquee]").forEach((m) => {
    const set = m.querySelector("[data-marquee-set]");
    const scroller = m.querySelector("[data-marquee-scroll]");
    for (let i = 0; i < 2; i++) scroller.appendChild(set.cloneNode(true));
    if (reduce) return;
    const f = innerWidth < 479 ? 0.25 : innerWidth < 991 ? 0.5 : 1;
    const speed = parseFloat(m.dataset.marqueeSpeed) * (set.offsetWidth / innerWidth) * f;
    const sp = parseFloat(m.dataset.marqueeScroll) || 0;
    scroller.style.marginLeft = `${-sp}%`;
    scroller.style.width = `${sp * 2 + 100}%`;
    const sets = m.querySelectorAll("[data-marquee-set]");
    const loop = gsap.to(sets, { xPercent: -100, repeat: -1, duration: speed, ease: "none" }).totalProgress(0.5);
    gsap.set(sets, { xPercent: -100 });
    loop.play();
    ScrollTrigger.create({ trigger: m, start: "top bottom", end: "bottom top", onUpdate: (st) => loop.timeScale(st.direction === 1 ? 1 : -1) });
    gsap.fromTo(scroller, { x: `${sp}vw` }, { x: `${-sp}vw`, ease: "none", scrollTrigger: { trigger: m, start: "0% 100%", end: "100% 0%", scrub: 0 } });
  });

  // ── Card stack: pinned to the screen, 1.2 screens per card. The front card falls 0.9 screen with power2.in and vanishes, while the cards behind pull z·y forward.
  //    The pile tilts with the mouse up to rotationX 6 · rotationY 10, and the round badge rotates a full 180 degrees.
  k.mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
    const sec = box.querySelector("[data-featured-stack]");
    const pin = sec.querySelector("[data-featured-pin]");
    const root = sec.querySelector("[data-featured-root]");
    const slides = [...sec.querySelectorAll("[data-featured-slide]")];
    const badge = sec.querySelector("[data-featured-badge]");
    const depth = 120, offset = 40, tiltX = 6, tiltY = 10, per = 1.2;
    slides.forEach((s, i) => gsap.set(s, { z: -i * depth, y: -i * offset, zIndex: slides.length - i, autoAlpha: 1, transformOrigin: "center center" }));
    const tl = gsap.timeline({ paused: true });
    slides.forEach((s, i) => {
      if (i === slides.length - 1) return;
      tl.to(s, { y: "+=" + innerHeight * 0.9, ease: "power2.in", duration: 1 }, i);
      tl.to(s, { autoAlpha: 0, ease: "none", duration: 0.25 }, i + 0.7);
      slides.slice(i + 1).forEach((n, j) => tl.to(n, { z: -j * depth, y: -j * offset, ease: "none", duration: 1 }, i));
    });
    tl.fromTo(badge, { rotation: 0 }, { rotation: 180, ease: "none", duration: slides.length - 1 }, 0);
    tl.totalDuration(slides.length - 1);
    const st = ScrollTrigger.create({
      trigger: sec, start: "top top", end: () => `+=${innerHeight * per * (slides.length - 1)}`,
      pin, pinSpacing: true, scrub: 0.3, invalidateOnRefresh: true, onUpdate: (s) => tl.progress(s.progress),
    });
    const rx = gsap.quickTo(root, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(root, "rotationY", { duration: 0.6, ease: "power3" });
    const move = (e) => { const r = pin.getBoundingClientRect(); rx(-((e.clientY - r.top) / r.height - 0.5) * tiltX); ry(((e.clientX - r.left) / r.width - 0.5) * tiltY); };
    const out = () => (rx(0), ry(0));
    pin.addEventListener("mousemove", move);
    pin.addEventListener("mouseleave", out);
    return () => {
      pin.removeEventListener("mousemove", move);
      pin.removeEventListener("mouseleave", out);
      st.kill(); tl.kill();
      gsap.set([root, ...slides, badge], { clearProps: "all" });
    };
  });
};

EF.page("home", { scroll, hand });
})();
