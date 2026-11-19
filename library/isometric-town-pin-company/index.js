/* Home — the order of the original TopPage.start as is: after 200ms of transition village · people · background · scroll · mouse, after 300ms slogan · helicopter · business panel, after 1.7s pin · product road · case band */
SB.page("home", (view) => {
  const mobile = matchMedia("(max-width: 767px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const kv = view.querySelector("#js-kv"), bg = kv.querySelector("#js-kv-bg");
  const L = kv.querySelector("#js-kv-bg-left"), R = kv.querySelector("#js-kv-bg-right");
  const offs = [];
  if (reduce) return;
  const later = (s, fn) => gsap.delayedCall(s, fn);

  later(0.2, () => {
    // Village three layers: the left one comes from the upper left (-r*.85), the right one from the lower right (r) at .93s power4.out, each layer continuing at 80% of the previous one (89% for the right)
    const r = 44 * (innerWidth / 1440);
    const steps = (side) => [1, 2, 3].map((n) => side.querySelectorAll(".js-step-0" + n));
    const build = (side, from, each, lap) => {
      const tl = gsap.timeline();
      gsap.set(steps(side), from);
      steps(side).forEach((g, t) => {
        tl.to(g, { y: 0, x: 0, duration: 0.93, ease: "power4.out", stagger: { each } }, t ? `-=${0.93 * lap}` : 0);
        tl.to(g, { autoAlpha: 1, duration: 0.1, ease: "none", stagger: { each } }, "<");
      });
    };
    build(L, { x: -r * 0.85, y: -r * 0.85 }, 0.085, 0.8);
    build(R, { x: r, y: r }, 0.075, 0.89);
    // Person: after .6s, pops up from below with back.out(1.4) over .6s
    const ppl = [...L.querySelectorAll(".js-persons"), ...R.querySelectorAll(".js-persons")];
    gsap.set(ppl, { y: 20 });
    gsap.timeline({ delay: 0.6 }).to(ppl, { y: 0, duration: 0.6, ease: "back.out(1.4)", stagger: 0.1 }).to(ppl, { autoAlpha: 1, duration: 0.11, ease: "power1.in", stagger: 0.1 }, "<");
    // Ground · tree · sky: turn on over .3s after 1.3s while sliding in 12px, and the two whole panels settle from 20px over 2.8s cubic.out
    const grounds = [L, R].map((s) => s.querySelectorAll(".js-bg, .js-tree"));
    gsap.set(grounds[0], { x: -12, y: -12 }); gsap.set(grounds[1], { x: 12, y: 12 });
    gsap.timeline({ delay: 1.3 }).to([...grounds, kv.querySelector("#js-sky-bg")], { autoAlpha: 1, duration: 0.3, ease: "power1.in" }).to(grounds, { x: 0, y: 0, duration: 1, ease: "power1.out" }, "<");
    gsap.fromTo(L, { x: -20, y: -20 }, { x: 0, y: 0, duration: 2.8, ease: "cubic.out" });
    gsap.fromTo(R, { x: 20, y: 20 }, { x: 0, y: 0, duration: 2.8, ease: "cubic.out" });
    // Scroll: the village panel drops 120px while the hero passes, and the lime-green stage follows up from 200px below
    if (!mobile) {
      if (innerWidth < 2000) gsap.to(bg, { y: 120, ease: "none", scrollTrigger: { trigger: kv, start: "top top", end: "bottom top", scrub: 0 } });
      gsap.fromTo(view.querySelector("#js-body"), { visibility: "visible", y: 200 }, { y: 0, ease: "none", scrollTrigger: { trigger: view.querySelector("#js-body"), start: "top bottom", end: "top top", scrub: 0 } });
    } else gsap.set(view.querySelector("#js-body"), { visibility: "visible" });
    // Mouse: follows the share away from screen center (-1~1) at 5% per frame, shifting the town opposite by 4% of the screen width and the helicopter by 1.2x
    if (!mobile) {
      const heli = kv.querySelector(".sb-kv__heli .inner");
      let target = 0, pos = 0, skip = 3, on = true, raf = 0;
      const move = (e) => { if (skip < 3) { skip++; return; } skip = 0; const h = innerWidth >> 1; target = (e.clientX - h) / h; };
      const loop = () => {
        if (!on) return;
        raf = requestAnimationFrame(loop);
        pos += (target - pos) * 0.05;
        const x = -pos * ((innerWidth * 0.04) | 0);
        bg.style.translate = `${x}px 0`;
        heli.style.translate = `${x * 1.2}px 0px`;
      };
      ScrollTrigger.create({ trigger: kv, start: "top top", end: "bottom 60%", onEnter: () => { on = true; loop(); }, onEnterBack: () => { on = true; cancelAnimationFrame(raf); loop(); }, onLeave: () => (on = false) });
      addEventListener("mousemove", move);
      loop();
      offs.push(() => { on = false; cancelAnimationFrame(raf); removeEventListener("mousemove", move); });
    }
  });

  later(0.5, () => {
    // Tagline: the line group rises from 70px below over 2s back, letters rise from 130px below inside a clipped frame over 1.5s quint.inOut (.6s spread overall), after .9s green→ink color, the Korean line comes in from 12px to the side after .6s
    const hd = kv.querySelector(".sb-kv__hd"), en = hd.querySelectorAll(".en .l"), jp = hd.querySelectorAll(".jp .l");
    const tint = getComputedStyle(view).getPropertyValue("--site-hd-green").trim();
    const ink = getComputedStyle(hd).color;
    const tl = gsap.timeline();
    tl.fromTo(hd.querySelector(".en"), { y: 70 }, { y: 0, duration: 2, ease: sbBack })
      .fromTo(en, { autoAlpha: 1, y: 130, clipPath: "inset(0% -18% 100% 0%)" }, { y: 0, clipPath: "inset(0% -18% 0% 0%)", duration: 1.5, ease: "quint.inOut", stagger: { amount: 0.6 }, onComplete: () => gsap.set(en, { clipPath: "unset" }) }, "<")
      .fromTo(en, { color: tint }, { color: ink, duration: 0.4, delay: 0.9, ease: "none", stagger: { amount: 0.5 } }, "<")
      .fromTo(jp, { color: tint, x: 12, autoAlpha: 0 }, { color: ink, x: 0, autoAlpha: 1, duration: 0.45, ease: "quad.out", stagger: { amount: 0.4 } }, "<+=.6")
      .to([view.querySelector(".sb-desc__hd"), view.querySelector(".sb-desc__txt")], { y: 0, autoAlpha: 1, duration: 1.2, ease: sbEase, stagger: { each: 0.15 } }, "-=.1");
    // Helicopter: lands from 60px top right over 1.2s after .5s, then tied to scroll and exits to the bottom left
    const h1 = kv.querySelector(".sb-kv__heli"), h2 = kv.querySelector(".sb-kv__heli2");
    gsap.fromTo(h1, { y: -60, x: 60 }, { autoAlpha: 1, y: 0, x: 0, duration: 1.2, delay: 0.5, ease: "power1.out", onComplete: () => gsap.to(h1, { y: mobile ? 300 : 350, x: mobile ? -450 : -350, overwrite: true, ease: "none", scrollTrigger: { trigger: kv, start: "top -1px", end: "bottom top", scrub: 0 } }) });
    gsap.to(h2, { autoAlpha: 1, duration: 0.2, ease: "power1.in", scrollTrigger: { trigger: kv, start: mobile ? "bottom 90%" : "bottom 70%", toggleActions: "restart none none reverse" } });
    gsap.to(h2, { y: 150, x: 150, ease: "none", scrollTrigger: { trigger: kv, start: mobile ? "bottom 90%" : "bottom 70%", end: "bottom top", scrub: 0 } });
    const waves = kv.querySelectorAll(".sb-wave");
    gsap.to(waves, { autoAlpha: 1, duration: 0.3, delay: 1, ease: "power1.in", stagger: 0.15, onComplete: () => waves.forEach((w) => w.classList.add("is-anim")) });

    // Business panels: at 85% of the screen each panel drops 120px with back.out(2) 1s, bridge .8s, the sign house opens from below in 1.1s back, and the person pops in .4s later
    const area = view.querySelector("#js-bord-area"), bt = gsap.timeline({ paused: true });
    area.querySelectorAll(".sb-bord").forEach((b, t) => {
      bt.fromTo(b.querySelector(".sb-bord__inner"), { autoAlpha: 0, y: 120 }, { autoAlpha: 1, y: 0, duration: 1, ease: "back.out(2)" }, t ? `-=${mobile ? t * 0.75 : t * 1.55}` : 0);
      bt.fromTo(b.querySelector(".sb-bord__corn"), { yPercent: -50, visibility: "hidden" }, { yPercent: 0, visibility: "visible", duration: 0.8, ease: "power1.out" }, "<+=.1");
      bt.fromTo(b.querySelectorAll(".sb-bord__ill [class^=js-step]"), { y: 100, clipPath: "polygon(0% -10%,100% -10%, 150% 0%, 50% 0%, -50% 0%)" }, { visibility: "visible", y: 0, clipPath: "polygon(0% -10%,100% -10%, 150% 60%, 50% 110%, -50% 60%)", duration: 1.1, ease: sbBack, stagger: { each: 0.1 } }, "<+=.2");
      bt.fromTo(b.querySelectorAll(".sb-bord__ill .js-persons"), { y: 60, autoAlpha: 0 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "back.out(2)", stagger: { each: 0.15 } }, "<+=.4");
    });
    ScrollTrigger.create({ trigger: area, start: "top 85%", onEnter: () => bt.restart(), onLeaveBack: () => bt.reverse() });
  });

  later(2.2, () => {
    // Pins: each board drops in .075s later than the last, from 100px above over .4s quint.out, and the logo grows at .4s. Hidden once past the Hero. Pressing opens the place window
    const pins = [...kv.querySelectorAll(".c-pin")];
    pins.forEach((p, a) => {
      // When finished, release the rotate and scale that GSAP folded in so the CSS hover (scale 1.5) takes effect
      gsap.timeline({ delay: a * 0.075 }).fromTo(p.querySelector(".bg"), { y: -100 }, { y: 0, duration: 0.4, ease: "quint.out", clearProps: "transform,rotate,scale" })
        .to(p.querySelector(".bg"), { opacity: 1, duration: 0.1, ease: "none" }, "<")
        .to(p.querySelector(".logo"), { opacity: 1, scale: 1, duration: 0.4, ease: "power1.out", onStart: () => p.classList.add("is-active") }, "-=.2");
      const w = p.parentElement.classList;
      ScrollTrigger.create({ trigger: p, start: "bottom -5%", end: "top 105%", onEnter: () => w.add("is-hide"), onLeaveBack: () => w.remove("is-hide") });
    });
    const modal = document.getElementById("js-modal");
    let cur = null;
    const hide = () => { modal.classList.remove("is-show"); setTimeout(() => modal.close(), 500); window.sbLenis?.start(); cur?.classList.remove("is-current"); };
    const show = (p) => {
      cur = p; p.classList.add("is-current");
      modal.querySelector(".sb-modal__title").textContent = p.dataset.hd;
      modal.querySelector(".sb-modal__body").textContent = p.dataset.body;
      modal.showModal(); requestAnimationFrame(() => modal.classList.add("is-show")); window.sbLenis?.stop();
    };
    const onPin = (e) => { const p = e.target.closest(".c-pin"); if (p) { e.preventDefault(); show(p); } };
    const onClose = (e) => { if (e.target.closest(".sb-modal__close, .sb-modal__bg")) hide(); };
    kv.addEventListener("click", onPin); modal.addEventListener("click", onClose);
    offs.push(() => { kv.removeEventListener("click", onPin); modal.removeEventListener("click", onClose); if (modal.open) modal.close(); });

    // Product path: when the features section touches 30% of the screen the path rises over 1.5s, the panel stands from 100px below in .7s back, then the flipped panel turns around over 1.5s (.12s stagger)
    const feat = view.querySelector("#js-features"), road = feat.querySelector("#js-road-area"), pt = gsap.timeline({ paused: true });
    road.querySelectorAll(".sb-road__road path").forEach((p, t) => pt.fromTo(p, { y: t ? 60 : 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.5, ease: sbEase }, "<"));
    road.querySelectorAll(".sb-road__panel").forEach((p, t) => {
      pt.fromTo(p.querySelector(".p-panel"), { y: 100 }, { y: 0, duration: 0.7, ease: sbBack }, t ? "<" : "<-=.1");
      pt.fromTo(p.querySelector(".p-panel__pole"), { yPercent: -50, visibility: "hidden" }, { yPercent: 0, visibility: "visible", duration: 0.6, ease: "power1.out" }, "<+=.1");
    });
    pt.fromTo(road.querySelectorAll(".sb-road__woods .js-tree, .sb-road__woods .js-persons"), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: sbBack, stagger: { each: 0.05, from: "random" } }, ">-=.5");
    pt.to(road.querySelectorAll(".p-panel__inner"), { rotateY: 0, duration: 1.5, ease: sbEase, stagger: { each: 0.12 } }, "<+=.1");
    ScrollTrigger.create({ trigger: feat, start: "top 30%", onEnter: () => pt.restart(), onLeaveBack: () => pt.reverse() });
    const fh = feat.querySelector(".sb-features__heli");
    gsap.to(fh, { autoAlpha: 1, duration: 0.2, ease: "power1.in", scrollTrigger: { trigger: feat, start: "top 80%", toggleActions: "restart none none reverse" } });
    gsap.fromTo(fh, { y: -160, x: 160 }, { y: 0, x: 0, ease: "none", scrollTrigger: { trigger: feat, start: "top 80%", end: "top 30%", scrub: 0 } });
    gsap.fromTo(feat.querySelector("#js-top-grad-bg"), { y: 0 }, { y: 100, ease: "none", scrollTrigger: { trigger: feat, start: "top bottom", end: "bottom top", scrub: 0 } });

    // Case strip: Splide 4.1.4 loop + AutoScroll (.5px per frame), flows only while on screen. Dragging is free drag (flickPower 200, 1-(1-t)^4)
    const el = view.querySelector("#js-splide");
    if (el && window.Splide) {
      el.querySelectorAll("li").forEach((li, i) => i >= 8 && li.remove());
      const sp = new Splide(el, { type: "loop", fixedWidth: mobile ? "60vw" : 420, gap: mobile ? "5vw" : "2vw", pagination: false, arrows: false, cloneStatus: false, lazyLoad: true, autoHeight: true, drag: "free", snap: false, pauseOnHover: false, pauseOnFocus: false, easingFunc: (t) => 1 - (1 - t) ** 4, flickPower: 200, autoplay: false, interval: 0, autoScroll: { speed: 0.5, autoStart: false, pauseOnHover: false, pauseOnFocus: false } });
      let st = null;
      sp.on("ready", () => {
        const as = sp.Components.AutoScroll;
        st = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onEnter: () => as.play(), onEnterBack: () => as.play(), onLeave: () => as.pause(), onLeaveBack: () => as.pause() });
      });
      sp.mount(window.splide?.Extensions || {});
      offs.push(() => { st?.kill(); sp.destroy(); });
    }
    ScrollTrigger.refresh();
  });

  return () => offs.forEach((f) => f());
});
