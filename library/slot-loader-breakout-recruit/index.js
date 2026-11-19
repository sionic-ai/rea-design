// Home page — slot loader, small reel that spins on each photo change, broken wall pieces scrub, message turning orange, job list hover photos, people card Splide.
(() => {
  // Five reel drawings: surfing · guitar · kendo · fishing · 7 — the same themes as the original, in our own line art
  const ICONS = [
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 32C14 20 24 10 33 7c-2 9-11 19-23 26z"/><path d="M5 35c4-2 7-2 10 0s6 2 10 0 6-2 10 0"/></svg>',
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M28 6l6 6-9 9"/><path d="M22 18c-3-3-8-2-9 2-4 0-7 3-6 7 0 5 6 8 10 6 4 0 6-3 6-6 4-1 5-6 2-9z"/><circle cx="16" cy="25" r="2"/></svg>',
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="11" y="6" width="18" height="20" rx="8"/><path d="M11 14h18M11 19h18M20 6v20M14 30l-4 6M26 30l4 6"/></svg>',
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20c6-8 18-9 25 0-7 9-19 8-25 0z"/><path d="M31 20l5-5v10z"/><circle cx="13" cy="18" r="1.2" fill="currentColor"/></svg>',
    '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 8h20L18 34"/><path d="M15 21h10"/></svg>',
  ];
  const icon = (i) => `<div class="ho-icon">${ICONS[i]}</div>`;

  // Seven bundles of broken pieces — position (left·top %) and width (em) follow the original image’s position and size
  const SHARDS = [[6, 4, 12], [44, 0, 26], [70, 14, 17], [10, 34, 11], [48, 40, 14], [84, 36, 11], [30, 70, 6]];
  function shardSvg(seed) {
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    let out = "";
    for (let k = 0; k < 9; k++) {
      const cx = rnd() * 100, cy = rnd() * 100, r = 6 + rnd() * 16, a = rnd() * Math.PI * 2;
      const p = [0, 2.1, 4.2].map((d, j) => {
        const rr = r * (j ? 0.35 + rnd() * 0.6 : 1);
        return `${(cx + Math.cos(a + d) * rr).toFixed(1)},${(cy + Math.sin(a + d) * rr).toFixed(1)}`;
      });
      out += `<polygon class="s${1 + (k % 3)}" points="${p.join(" ")}"/>`;
    }
    return `<svg viewBox="0 0 100 100">${out}</svg>`;
  }

  (window.opPages = window.opPages || {}).home = (main, { first, reduce, PC, reveal }) => {
    const calls = [], timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const mm = gsap.matchMedia();
    let splide = null, fadeTimer = null;

    // Draw the pieces in
    const shardList = main.querySelector(".ho-frag__shards");
    shardList.innerHTML = SHARDS.map(([x, y, w], i) => `<li data-fragimg style="left:${x}%;top:${y}%;width:${w}em">${shardSvg(i + 3)}</li>`).join("");

    // ── Small reel: each time the photo changes, it rolls to the next picture ──
    const reels = main.querySelectorAll("[data-reel]");
    const seq = [0, 1, 2, 3];
    reels.forEach((r) => (r.innerHTML = Array(10).fill(seq).flat().map(icon).join("")));
    let G = 0, K = 0;
    G = reels[0].firstElementChild.offsetHeight;
    gsap.set(reels, { y: 0 });
    function spinReels() {
      if (!G || reduce) return;
      const n = (K + 1) % seq.length, o = seq.length * G;
      reels.forEach((reel, i) => {
        gsap.set(reel, { y: -((K * G) % o) });
        gsap.to(reel, { y: -(n * G + 5 * o), duration: 1.5 + 0.2 * i, ease: "power3.out", delay: 0.1 * (i + 1) });
      });
      later(() => (K = n), 2200);
    }

    // ── Photo transition: 4s interval, the new one covers from the bottom edge with clip-path ──
    const slides = [...main.querySelectorAll(".ho-mv__slide")];
    const INTERVAL = 4000;
    function move(cur, next) {
      spinReels();
      cur.dataset.active = "animation";
      next.dataset.active = "true";
      later(() => (cur.dataset.active = "false"), 0.6 * INTERVAL);
      const after = slides[(slides.indexOf(next) + 1) % slides.length];
      calls.push(gsap.delayedCall(INTERVAL / 1000, move, [next, after]));
    }
    const startSlider = () => !reduce && later(() => move(slides[0], slides[1]), 0.833333333333333 * INTERVAL);

    // ── Hooked on after everything is visible (original pageonload) ──
    function afterShow() {
      if (!reduce) gsap.fromTo("[data-copy]", { alpha: 1, scale: 0 }, { duration: 0.6, ease: "elastic.out(1.2,.8)", scale: 1 });
      else gsap.set("[data-copy]", { alpha: 1 });
      startSlider();

      splide = new Splide(main.querySelector("[data-memberslider]"), {
        type: "loop", speed: 800, perMove: 1, arrows: false, pagination: false, autoplay: !reduce, interval: 3000,
        gap: "calc(60em/16)", pauseOnHover: true, drag: true, snap: true, flickPower: 100, flickMaxPages: 1,
        easing: "cubic-bezier(0.445, 0.050, 0.550, 0.950)", autoWidth: true, breakpoints: { 750: { destroy: true } },
      }).mount();

      if (!reduce) {
        gsap.utils.toArray(main.querySelectorAll("[data-fragimg]")).forEach((el, i) => {
          gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom-=30%", once: true } })
            .to(el, { alpha: 1, duration: 0.4, ease: "power3.out" })
            .fromTo(el, { scale: 0.5 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, .6)" }, "<");
          let from = -80, to = 100 * (i + 1) * 0.05;
          if (i % 2 === 0) { from = -50; to = 250 * (i + 1) * 0.05; }
          gsap.fromTo(el, { y: from }, { y: to, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
        });
        gsap.utils.toArray(main.querySelectorAll("[data-fragtxt]")).forEach((el) => {
          gsap.to(el, { alpha: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top bottom-=20%", once: true } });
          gsap.fromTo(el, { y: 10 }, { ease: "none", y: -30, scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
        });
      } else gsap.set("[data-fragimg], [data-fragtxt]", { alpha: 1 });

      const bg = main.querySelector("[data-introbg]"), grad = main.querySelector("[data-intrograd]"), msg = main.querySelector("[data-message]");
      ScrollTrigger.create({
        trigger: msg, start: "-30% 0%", end: "120% 0%",
        onEnter: () => { bg.classList.add("is-orange"); msg.classList.add("is-introshow"); },
        onLeaveBack: () => { bg.classList.remove("is-orange"); msg.classList.remove("is-introshow"); },
      });
      ScrollTrigger.create({
        trigger: main.querySelector("[data-messagelogo]"), start: "0% 80%", end: "120% 0%", invalidateOnRefresh: true,
        onEnter: () => { grad.classList.add("is-show"); msg.classList.add("is-bottomshow"); },
        onLeaveBack: () => { grad.classList.remove("is-show"); msg.classList.remove("is-bottomshow"); },
      });
      reveal();
    }

    // ── Work list: swap to the photo of the hovered row. On touch devices it switches by itself every 5s ──
    const imgs = [...main.querySelectorAll(".ho-work__img li")];
    const show = (t) => imgs.forEach((li) => li.classList.toggle("is-active", li.dataset.target === String(t)));
    const onEnter = (e) => show(e.currentTarget.dataset.target);
    const links = main.querySelectorAll("[data-worklink]");
    const touch = matchMedia("(hover: none)").matches;
    if (!touch) links.forEach((a) => a.addEventListener("mouseenter", onEnter));
    mm.add("(max-width: 750px)", () => {
      if (reduce) return;
      let cur = 0;
      fadeTimer = setInterval(() => { cur = (cur + 1) % imgs.length; show(cur); }, 5000);
      return () => clearInterval(fadeTimer);
    });

    // ── Slot loader (first open only) ──
    const loading = main.querySelector("#op-loading");
    const owns = first && !reduce;
    if (owns) {
      const body = loading.querySelector("[data-loadingbody]"), bar = loading.querySelector("[data-loadingbar]");
      const Q = ICONS.length, STOP = 4;
      const wraps = [...loading.querySelectorAll("[data-loadingreel]")].map((li) => {
        const w = document.createElement("div");
        w.innerHTML = Array.from({ length: 2 * Q }, (_, i) => icon(i % Q)).join("");
        li.append(w);
        return w;
      });
      gsap.set("#op-wrap", { autoAlpha: 1 });
      const h = wraps[0].firstElementChild.offsetHeight;
      const loops = wraps.map((w) => gsap.to(w, { y: -Q * h, duration: 2, ease: "none", repeat: -1, paused: true, modifiers: { y: gsap.utils.unitize(gsap.utils.wrap(-Q * h, 0)) } }));
      const stopAt = (i, done) => {
        loops[i].pause();
        const y = gsap.getProperty(wraps[i], "y"), o = Q * h;
        let a = Math.ceil(y / o) * o - STOP * h;
        if (a > y) a -= o;
        gsap.to(wraps[i], { y: a, duration: 0.7, ease: "power3.out", onComplete: () => i === wraps.length - 1 && done() });
      };
      const finish = () => {
        window.opLenis && window.opLenis.scrollTo(0, { duration: 0.6 });
        gsap.to(body, { duration: 0.8, ease: "power2.inOut", autoAlpha: 0, delay: 0.2 });
        gsap.to(loading, { duration: 0.8, ease: "power2.inOut", autoAlpha: 0, delay: 0.6, onComplete: afterShow });
      };
      later(() => {
        gsap.timeline()
          .to(bar, { duration: 0.8, ease: "power3.inOut", rotateX: -70, translateZ: 65 })
          .to(bar, { duration: 0.5, ease: "power3.out", rotateX: 0, translateZ: 0 });
        calls.push(gsap.delayedCall(0.8, () => {
          loops.forEach((l, i) => {
            gsap.killTweensOf(wraps[i]);
            l.timeScale(2.5 + 0.5 * i).play();
            calls.push(gsap.delayedCall(2 + 0.5 * i, () => stopAt(i, finish)));
          });
        }));
      }, 500);
    } else {
      gsap.set(loading, { autoAlpha: 0 });
      gsap.set(main, { autoAlpha: 1 });
      if (first) gsap.to("#op-wrap", { duration: reduce ? 0 : 0.4, ease: "power3.out", autoAlpha: 1, onComplete: afterShow });
      else {
        gsap.to("#op-footer", { duration: 0.4, ease: "power3.out", autoAlpha: 1 });
        gsap.fromTo(main, { autoAlpha: 0 }, { duration: 0.4, ease: "power3.out", autoAlpha: 1, onComplete: afterShow });
      }
    }

    const off = () => {
      calls.forEach((c) => c.kill());
      timers.forEach(clearTimeout);
      clearInterval(fadeTimer);
      splide && splide.destroy();
      links.forEach((a) => a.removeEventListener("mouseenter", onEnter));
      mm.revert();
    };
    off.ownReveal = true;
    return off;
  };
})();
