// First page: tunnel intro → title unravel → eye button. Pressing the eye button dives 12x into the eye in the photo and closes to black.
// Original values: starts .9s after intro · hole 1→screen height×.5 1.2s power2.out · sentence unravel 1.6/1.2s · scatter 1.2s · next sentence overlaps .25s
//           · last hole diagonal across the screen/.25 1.6s power2.inOut · header .5s linear · button .6s power1.inOut
//           · Diving into the eye: text scatter .6s · header · button .4s · 12^t zoom 2s power3.in · blur .35 · black curtain .55s (at 1.45s)
(() => {
  const SW = window.SW;
  const head = document.querySelector(".sw-head");
  const cta = document.querySelector(".hero__cta");
  const iMask = document.querySelector(".i-mask");
  const intro = document.querySelector(".intro");
  const plane = document.querySelector(".home-bg__plane");
  const heroLines = [...document.querySelectorAll("[data-hero-line]")].map(SW.glText);
  const introLines = [...document.querySelectorAll("[data-intro-line]")].map(SW.glText);
  const fromPage = !!sessionStorage.getItem("sw-enter");

  // Photo panel: pushed away from the mouse by .012 of the panel width so depth is felt (the original tilts with a depth map)
  const view = { c: 1, t: 0, tx: 0, ty: 0, blur: 0 };
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  const E = { x: 0.807, y: 0.339 };
  const render = () => {
    const W = plane.offsetWidth, H = plane.offsetHeight, L = plane.offsetLeft, T = plane.offsetTop;
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const f0x = (cx - L) / W, f0y = (cy - T) / H;
    const c = view.c;
    const fx = E.x - (E.x - f0x) * (1 - view.t) / c;
    const fy = E.y - (E.y - f0y) * (1 - view.t) / c;
    const x = cx - fx * c * W - L - tilt.x * 0.012 * W;
    const y = cy - fy * c * H - T - tilt.y * 0.012 * W;
    plane.style.transform = `translate(${x}px, ${y}px) scale(${c})`;
    plane.style.filter = view.blur > 0.001 ? `blur(${(view.blur * 34).toFixed(1)}px)` : "";
  };
  if (!SW.reduced && matchMedia("(hover: hover)").matches) {
    addEventListener("mousemove", (e) => {
      tilt.tx = (e.clientX / innerWidth - 0.5) * 2;
      tilt.ty = (e.clientY / innerHeight - 0.5) * 2;
    });
  }
  gsap.ticker.add((_, dt) => {
    const k = 1 - Math.exp(-3 * (dt / 1000));
    tilt.x += (tilt.tx - tilt.x) * k;
    tilt.y += (tilt.ty - tilt.y) * k;
    render();
  });

  const showHero = () => {
    intro.remove();
    heroLines.forEach((g) => g.setReveal(1));
    gsap.set([cta, head], { autoAlpha: 1 });
  };

  if (SW.reduced) {
    iMask.remove();
    showHero();
    SW.enter();
    return;
  }

  gsap.set(head, { autoAlpha: 0 });
  heroLines.forEach((g) => g.hide());
  introLines.forEach((g) => g.hide());

  const done = () => gsap.to(cta, { autoAlpha: 1, duration: 0.6, ease: "power1.inOut" });
  const revealHero = () => heroLines.forEach((g) => gsap.to(g.st, { r: 1, duration: 1.4, ease: "none", onUpdate: () => g.setReveal(g.st.r) }));

  // Coming back from another page skips the intro: only the eyelids open and the title unblurs (the original also has the intro on the first visit only)
  if (fromPage) {
    iMask.remove();
    intro.remove();
    gsap.set(head, { autoAlpha: 1 });
    SW.enter();
    revealHero();
    gsap.delayedCall(0.6, done);
  } else {
    SW.enter();
    gsap.to(iMask, { autoAlpha: 0, duration: 0.5, ease: "linear", delay: 0.2, onComplete: () => iMask.remove() });

    // Tunnel mask: inside hole radius .25r everything is visible, darkening with smoothstep out to r. The center follows the mouse by 1-e^(-6dt)
    const cv = intro.querySelector(".intro__mask");
    const ctx = cv.getContext("2d");
    const hole = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2, r: 1 };
    const size = () => { cv.width = innerWidth; cv.height = innerHeight; };
    size();
    addEventListener("resize", size);
    addEventListener("mousemove", (e) => { hole.tx = e.clientX; hole.ty = e.clientY; });
    const draw = (_, dt) => {
      const k = 1 - Math.exp(-6 * (dt / 1000));
      hole.x += (hole.tx - hole.x) * k;
      hole.y += (hole.ty - hole.y) * k;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-bg");
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = "destination-out";
      const r = Math.max(hole.r, 1);
      const g = ctx.createRadialGradient(hole.x, hole.y, 0, hole.x, hole.y, r);
      [[0, 1], [0.25, 1], [0.4375, 0.84375], [0.625, 0.5], [0.8125, 0.15625], [1, 0]].forEach(([s, a]) => g.addColorStop(s, `rgba(0,0,0,${a})`)); // Not skin: a hole punched with destination-out, so only alpha is used
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cv.width, cv.height);
    };
    gsap.ticker.add(draw);

    const st = introLines.map(() => ({ r: 0, c: 0 }));
    const upd = (i) => () => { introLines[i].setReveal(st[i].r); introLines[i].setConceal(st[i].c); };
    gsap.timeline({
      delay: 0.9,
      defaults: { ease: "none" },
      onComplete: () => {
        gsap.ticker.remove(draw);
        intro.remove();
        gsap.to(head, { autoAlpha: 1, duration: 0.5, ease: "linear" });
        done();
      },
    })
      .to(hole, { r: innerHeight * 0.5, duration: 1.2, ease: "power2.out" }, 0)
      .to(st[0], { r: 1, duration: 1.6, onUpdate: upd(0) }, 0)
      .to(st[0], { c: 1, duration: 1.2, onUpdate: upd(0) }, "+=1")
      .to(st[1], { r: 1, duration: 1.2, onUpdate: upd(1) }, "<0.25")
      .to(st[1], { c: 1, duration: 1.2, onUpdate: upd(1) }, "+=1")
      .to(st[2], { r: 1, duration: 1.2, onUpdate: upd(2) }, "<0.25")
      .to(st[2], { c: 1, duration: 1.2, onUpdate: upd(2) }, "+=2")
      .to(hole, { r: Math.hypot(innerWidth, innerHeight) / 0.25, duration: 1.6, ease: "power2.inOut" }, "<")
      .add(revealHero, "<");
  }

  // Only when leaving via the eye button does it dive into the eye. Other links use the common eyelid transition
  let eyeLeave = false;
  document.querySelectorAll('[data-leave="eye"]').forEach((a) => a.addEventListener("click", () => (eyeLeave = true), true));
  SW.leaveOverride = (href) => {
    if (!eyeLeave) return false;
    eyeLeave = false;
    SW.markEnter("mask");
    const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power1" }, onComplete: () => (location.href = href) });
    const conceal = { c: 0 };
    tl.to(conceal, { c: 1, duration: 0.6, ease: "none", onUpdate: () => heroLines.forEach((g) => g.setConceal(conceal.c)) }, 0)
      .to([head, cta], { autoAlpha: 0, duration: 0.4 }, 0)
      .to(view, { t: 1, duration: 2, ease: "power3.in", onUpdate: () => { view.c = 12 ** view.t; view.blur = 0.35 * view.t; } }, 0)
      .to(SW.tmask, { autoAlpha: 1, duration: 0.55, ease: "power1.in" }, 2 - 0.55);
    return true;
  };
})();
