// Speech-bubble transition — clicking a same-site link covers the page with a brand-color curtain (leaving a brand panel it switches on at .3s, leaving a paper panel a center circle grows over .65s)
// Three center speech bubbles pop out spinning from 0x, ∓50° and 80px below, float bobbing, then move on after a 1s hold.
// On the arriving page the speech bubbles drop out 50px upward tilting ±10° over .3s (.04s sequence), on a paper panel a background-color circle grows from the center over .65s to cover the curtain, and the whole curtain lifts .5s later over .3s
(() => {
  const ARRIVE = "fx-bubble-pop-page";
  kfFx.register("bubble-pop-page", (el, { options, reduce }) => {
    const backdrop = el.querySelector('[data-fx-part="backdrop"]');
    const wipe = el.querySelector('[data-fx-part="wipe"]');
    const bubbles = [...el.querySelectorAll('[data-fx-part="bubble"]')];
    if (!backdrop || !window.gsap) return;
    const ease = (c, f) => kfFx.ease(c, f);
    const pop = ease(options.ease || "0.19,1,0.22,1", "expo.out");
    const swing = ease("0.42,0,0.58,1", "sine.inOut");
    const easeIn = ease("0.42,0,1,1", "power2.in");
    const hold = +(options.hold ?? 1), each = +(options.each ?? 0.04);
    const enter = options.enter || "fade", leaveLook = options.leave || "fade";
    const sec = (n) => (reduce ? 0 : n);
    let busy = false, tl = null;
    const loops = [];

    const show = () => { el.style.visibility = "visible"; el.style.pointerEvents = "auto"; };
    const hide = () => { el.style.visibility = "hidden"; el.style.pointerEvents = "none"; document.documentElement.classList.remove("fx-bubble-arrive"); };
    const stopLoops = () => { loops.splice(0).forEach((t) => t.kill()); };
    // Bobbing — in each speech bubble the inner graphic (bob) swings data-bob (vertical ‘a,b’ px)·data-tilt (tilt ‘a,b’ degrees) over data-period seconds, and glyph pieces swing with data-keys split evenly
    const nums = (s, d) => String(s ?? d).split(",").map(Number);
    const float = () => {
      if (reduce) return;
      for (const b of bubbles) {
        const bob = b.querySelector('[data-fx-part="bob"]');
        if (bob) {
          const [y0, y1] = nums(b.dataset.bob, "0,25"), [r0, r1] = nums(b.dataset.tilt, "0,0");
          loops.push(gsap.fromTo(bob, { y: y0, rotation: r0, transformOrigin: "50% 50%" }, { y: y1, rotation: r1, duration: +(b.dataset.period || 3), delay: +(b.dataset.bobDelay || 0), ease: swing, repeat: -1, yoyo: true }));
        }
        b.querySelectorAll('[data-fx-part="glyph"]').forEach((g) => {
          const keys = nums(g.dataset.keys, "");
          if (keys.length < 2 || keys.some(Number.isNaN)) return;
          const prop = g.dataset.prop === "scale" ? "scale" : "rotation";
          gsap.set(g, { [prop]: keys[0], transformOrigin: "50% 50%" });
          loops.push(gsap.to(g, { keyframes: { [prop]: keys, easeEach: swing }, duration: +(g.dataset.period || 3), ease: "none", repeat: -1, yoyo: true }));
        });
      }
    };
    const rest = () => { gsap.set(bubbles, { autoAlpha: 1, scale: 1, y: 0, rotation: 0, transformOrigin: "50% 80%" }); };

    const cover = () => new Promise((done) => {
      show();
      stopLoops();
      gsap.set(el, { autoAlpha: 0 });
      gsap.set(bubbles, { autoAlpha: 1, scale: 0, y: 80, rotation: (i, t) => +(t.dataset.rotate ?? -50), transformOrigin: "50% 80%" });
      if (wipe) gsap.set(wipe, { autoAlpha: 0 });
      tl = gsap.timeline();
      tl.to(el, { autoAlpha: 1, duration: sec(0.1), ease: "none" }, 0);
      if (enter === "circle") tl.fromTo(backdrop, { autoAlpha: 1, clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(100% at 50% 50%)", duration: sec(0.65), ease: swing }, 0);
      else tl.fromTo(backdrop, { autoAlpha: 0, clipPath: "circle(100% at 50% 50%)" }, { autoAlpha: 1, duration: sec(0.3), ease: swing }, 0);
      bubbles.forEach((b) => tl.to(b, { scale: 1, y: 0, rotation: 0, duration: sec(+(options.pop ?? 1)), ease: pop }, sec(+(b.dataset.delay || 0))));
      float();
      // The original waits 1s more after the next screen is ready — a static page stays that long from the press, then moves on
      gsap.delayedCall(sec(hold), done);
    });

    const leave = () => {
      show();
      gsap.set(el, { autoAlpha: 1 });
      gsap.set(backdrop, { autoAlpha: 1, clipPath: "circle(100% at 50% 50%)" });
      rest();
      float();
      tl = gsap.timeline({ onComplete: () => { stopLoops(); hide(); } });
      bubbles.forEach((b, i) => tl.to(b, { autoAlpha: 0, y: -50, rotation: +(b.dataset.exitRotate ?? 10), duration: sec(0.3), ease: easeIn }, sec(+(b.dataset.exitDelay ?? i * each))));
      if (wipe && leaveLook === "circle") tl.fromTo(wipe, { autoAlpha: 1, clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(100% at 50% 50%)", duration: sec(0.65), ease: swing }, 0);
      tl.to(el, { autoAlpha: 0, duration: sec(+(options.out ?? 0.3)), ease: swing }, sec(+(options["out-delay"] ?? 0.5)));
    };

    const click = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!a || a.hasAttribute("download") || (a.target && a.target !== "_self") || a.closest("[data-no-wipe]")) return;
      const href = a.getAttribute("href");
      if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return;
      let url; try { url = new URL(href, location.href); } catch { return; }
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault();
      if (busy) return;
      busy = true;
      sessionStorage.setItem(ARRIVE, "1");
      cover().then(() => (location.href = url.href));
    };
    document.addEventListener("click", click, true);

    if (sessionStorage.getItem(ARRIVE)) {
      sessionStorage.removeItem(ARRIVE);
      requestAnimationFrame(leave);
    } else hide();
    const back = (e) => { if (e.persisted) { busy = false; tl?.kill(); stopLoops(); hide(); } };
    addEventListener("pageshow", back);

    return () => {
      document.removeEventListener("click", click, true);
      removeEventListener("pageshow", back);
      tl?.kill();
      stopLoops();
      el.style.visibility = ""; el.style.pointerEvents = "";
      gsap.set([el, backdrop, wipe, ...bubbles, ...el.querySelectorAll('[data-fx-part="bob"],[data-fx-part="glyph"]')].filter(Boolean), { clearProps: "all" });
    };
  });
})();
