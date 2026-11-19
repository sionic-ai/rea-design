(() => {
  // "-42vw"·"2vh"·"30px" in px at the current window size — scattered positions must be written as window ratios so the same composition holds when the window changes
  const toPx = (raw) => {
    const s = String(raw || "").trim();
    const n = parseFloat(s);
    if (!Number.isFinite(n)) return 0;
    if (s.endsWith("vw")) return (n * innerWidth) / 100;
    if (s.endsWith("vh")) return (n * innerHeight) / 100;
    return n;
  };

  kfFx.register("scatter-drift-field", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length || !window.gsap) return;
    const field = el.querySelector('[data-fx-part="field"]') || el;
    const titles = [...el.querySelectorAll('[data-fx-part="title"]')];
    const cursor = el.querySelector('[data-fx-part="cursor"]');
    const o = {
      on: options.on || "",
      delay: +(options.delay ?? 1.4),
      dur: +(options.dur ?? 0.8),
      ease: kfFx.ease(options.ease || "0.105,0.401,0.222,0.939", "power3.out"),
      rx: +(options["range-x"] ?? 30),
      ry: +(options["range-y"] ?? 30),
      smooth: +(options.smooth ?? 0.9),
      cursorSmooth: +(options["cursor-smooth"] ?? 0.88),
      lift: +(options.lift ?? 1.4),
      liftDur: +(options["lift-dur"] ?? 0.3),
      liftEase: kfFx.ease(options["lift-ease"] || "0.667,0.325,0.355,1", "power2.inOut"),
      gather: +(options.gather ?? 1),
      gatherEase: kfFx.ease(options["gather-ease"] || "0.778,0.085,0.515,0.997", "power3.inOut"),
      grow: +(options.grow ?? 0.8),
      growEase: kfFx.ease(options["grow-ease"] || "0.596,0.05,0.216,0.98", "power3.inOut"),
      go: +(options.go ?? 1.777),
    };
    const media = items.map((it) => it.querySelector('[data-fx-part="media"]') || it);
    const read = (it) => {
      const cs = getComputedStyle(it);
      return {
        x: cs.getPropertyValue("--fx-x"),
        y: cs.getPropertyValue("--fx-y"),
        s: +(parseFloat(cs.getPropertyValue("--fx-s")) || 0.5),
        dx: +(parseFloat(cs.getPropertyValue("--fx-dx")) || 0),
        dy: +(parseFloat(cs.getPropertyValue("--fx-dy")) || 0),
      };
    };
    let spots = items.map(read);

    // Mouse position is the share within the plate (0~1). The original (Webflow IX2) follows by (1 − smooth) of the remaining distance each frame regardless of frame length —
    // Correcting by time makes it settle faster than the original on slow-frame devices (measured 899ms ↔ 490ms)
    const want = { x: 0.5, y: 0.5 }, at = { x: 0.5, y: 0.5 };
    const cWant = { x: 0.5, y: 0.5 }, cAt = { x: 0.5, y: 0.5 };
    let wide = false, scattered = false, gathering = false;

    const place = () => {
      items.forEach((it, i) => gsap.set(it, { x: scattered ? toPx(spots[i].x) : 0, y: scattered ? toPx(spots[i].y) : 0, scale: spots[i].s }));
    };
    const tick = () => {
      if (wide && !reduce && !gathering) {
        const k = 1 - Math.max(o.smooth, 0);
        at.x += (want.x - at.x) * Math.max(k, 0.01);
        at.y += (want.y - at.y) * Math.max(k, 0.01);
        const px = 0.5 - at.x, py = 0.5 - at.y;
        gsap.set(field, { x: px * 2 * o.rx * innerWidth / 100, y: py * 2 * o.ry * innerHeight / 100 });
        items.forEach((it, i) => {
          const s = spots[i];
          if (s.dx || s.dy) gsap.set(media[i], { x: px * 2 * s.dx * innerWidth / 100, y: py * 2 * s.dy * innerHeight / 100 });
        });
      }
      if (cursor && hover) {
        const k = 1 - Math.max(o.cursorSmooth, 0);
        cAt.x += (cWant.x - cAt.x) * Math.max(k, 0.01);
        cAt.y += (cWant.y - cAt.y) * Math.max(k, 0.01);
        gsap.set(cursor, { x: (cAt.x - 0.5) * innerWidth, y: (cAt.y - 0.5) * innerHeight });
      }
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      want.x = Math.min(1, Math.max(0, (e.clientX - r.left) / (r.width || 1)));
      want.y = Math.min(1, Math.max(0, (e.clientY - r.top) / (r.height || 1)));
    };
    const onCursor = (e) => { cWant.x = e.clientX / innerWidth; cWant.y = e.clientY / innerHeight; };

    const titleOf = (i) => titles[i];
    const enter = (i) => {
      items[i].classList.add("is-up");
      titleOf(i)?.classList.add("is-on");
      cursor?.classList.add("is-on");
      if (wide && !reduce && !gathering) gsap.to(media[i], { scale: o.lift, duration: o.liftDur, ease: o.liftEase, overwrite: "auto" });
    };
    const leave = (i) => {
      if (gathering) return;
      items[i].classList.remove("is-up");
      titleOf(i)?.classList.remove("is-on");
      cursor?.classList.remove("is-on");
      if (wide && !reduce) gsap.to(media[i], { scale: 1, duration: o.liftDur, ease: o.liftEase, overwrite: "auto" });
    };
    const click = (i, e) => {
      if (!wide || gathering) return;
      const href = media[i].getAttribute?.("href");
      e.preventDefault();
      gathering = true;
      el.classList.add("is-busy");
      el.dispatchEvent(new CustomEvent("fx:gather", { bubbles: true, detail: { index: i, item: items[i] } }));
      const tl = gsap.timeline();
      if (!reduce) {
        tl.to(field, { x: 0, y: 0, duration: o.gather, ease: o.gatherEase }, 0)
          .to(items, { x: 0, y: 0, duration: o.gather, ease: o.gatherEase }, 0)
          .to(media, { x: 0, y: 0, duration: o.gather, ease: o.gatherEase }, 0)
          .to(media, { scale: 1, duration: o.liftDur, ease: kfFx.ease("0.725,0.05,0.567,0.991", "power2.inOut") }, 0)
          .to(items[i], { scale: 1, duration: o.grow, ease: o.growEase }, o.gather);
      }
      if (href) timer = setTimeout(() => { location.href = href; }, o.go * 1000);
    };

    const offs = [];
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); offs.push(() => t.removeEventListener(ev, fn, opt)); };
    items.forEach((it, i) => {
      on(it, "pointerenter", () => enter(i));
      on(it, "pointerleave", () => leave(i));
      on(media[i], "click", (e) => click(i, e));
    });

    let timer = null, scatterTween = null;
    const scatter = () => {
      if (!wide) { scattered = true; return; }
      if (reduce) { scattered = true; place(); return; }
      el.classList.add("is-busy");
      scatterTween = gsap.timeline({ delay: o.delay, onComplete: () => { scattered = true; el.classList.remove("is-busy"); } });
      items.forEach((it, i) => scatterTween.to(it, { x: toPx(spots[i].x), y: toPx(spots[i].y), duration: o.dur, ease: o.ease }, 0));
    };

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      wide = true;
      spots = items.map(read);
      place();
      return () => {
        wide = false;
        gsap.set([field, ...items, ...media], { clearProps: "transform" });
      };
    });

    const start = () => scatter();
    if (o.on) on(document, o.on, start, { once: true });
    else start();

    const onResize = () => {
      spots = items.map(read);
      if (wide && (scattered || reduce) && !gathering) place();
    };
    on(window, "resize", onResize);
    if (hover) {
      on(el, "pointermove", onMove);
      on(window, "pointermove", onCursor);
      gsap.ticker.add(tick);
    }

    return () => {
      offs.forEach((f) => f());
      gsap.ticker.remove(tick);
      clearTimeout(timer);
      scatterTween?.kill();
      mm.revert();
      el.classList.remove("is-busy");
      items.forEach((it) => it.classList.remove("is-up"));
      titles.forEach((t) => t.classList.remove("is-on"));
      cursor?.classList.remove("is-on");
      if (cursor) gsap.set(cursor, { clearProps: "transform" });
    };
  });
})();
