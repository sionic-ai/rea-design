// Strip position always folds to ”half width” — two copies are joined, so a half-width shift looks the same as the start
(() => {
  kfFx.register("drag-marquee", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      // drag: with ease, no Draggable and no inertia — it follows the dragged distance × gain with a follow-second expo.out (as in the original site) — in that case neither plugin is needed
      const eased = options.drag === "ease", lerped = options.drag === "lerp";
      // throw: off — on release it flows again right on the spot (source site: only Draggable is loaded and InertiaPlugin is not, so inertia does nothing)
      const thrown = options.throw !== "off";
      if (!eased && !lerped) gsap.registerPlugin(Draggable, ...(thrown ? [InertiaPlugin] : []));
      const track = el.querySelector("[data-fx-part=track]");
      if (!track) return;
      const copies = [...track.children].map((c) => { const k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); return k; });
      track.append(...copies);
      signal.addEventListener("abort", () => copies.forEach((k) => k.remove()));
      if (options.scatter === "true") gsap.set(track.children, { rotation: () => gsap.utils.random(-35, 35), y: () => gsap.utils.random(0, 30), x: () => gsap.utils.random(-50, 50) });
      // With speed-narrow, windows 750px and below flow at that value (Brand photo strip: 1px per frame, phone .5px)
      const narrow = matchMedia(`(max-width: ${+(options.narrow ?? 750)}px)`);
      const speed = () => (reduce ? 0 : -(narrow.matches && options["speed-narrow"] != null ? +options["speed-narrow"] : +(options.speed ?? 0.6)));
      // Giving per-px makes it flow by time, not by frame — seconds per 1px (Brand 0.02 = 50px/s). Chain values per window width (px) or below, like ”0.02 834:0.018 640:0.015”
      const tiers = String(options["per-px"] ?? "").trim().split(/\s+/).filter(Boolean).map((t) => t.split(":").map(Number));
      const perPx = () => {
        let v = tiers[0]?.[0], w = Infinity;
        for (const [bp, val] of tiers.slice(1)) if (innerWidth <= bp && bp < w) { v = val; w = bp; }
        return v;
      };
      const way = options.dir === "right" ? 1 : -1;
      // Give lap and one set of the strip passes in that many seconds — even if the strip is long, one lap takes the same time (Brand menu news strip, 60 seconds)
      const lap = options.lap == null ? 0 : +options.lap || 0;
      // pause: if hover, the flow stops while the hand is over it (drag and inertia stay as they are)
      let paused = false;
      if (options.pause === "hover") { el.addEventListener("pointerenter", () => (paused = true)); el.addEventListener("pointerleave", () => (paused = false)); }
      // If hover-speed is given, the speed at which it drifts on its own while hovered is multiplied by that factor (.8 in the reference site — original ticker hoverModifier 80)
      const overMul = +(options["hover-speed"] ?? 1);
      let over = false;
      if (overMul !== 1) { el.addEventListener("pointerenter", () => (over = true), { signal }); el.addEventListener("pointerleave", () => (over = false), { signal }); }
      const s = { x: 0 };
      const half = () => track.scrollWidth / 2;
      // With boost given, the scroll flows further by the distance moved per frame × boost (pikkas .2 — original lenis.velocity)
      const boost = reduce ? 0 : +(options.boost ?? 0);
      let lastY = scrollY;
      const scrolled = () => { const v = Math.abs(scrollY - lastY); lastY = scrollY; return v * boost; };
      let drag = null, pull = null, held = null;
      // drag: lerp flows in seconds (speed × 60 px/s) — while dragging it catches up to the hand position by (1 − catch^dt), on release it glides at the drag speed (±cap px/s) and cools by decay^dt (Brand box band .002 · .02 · 1600)
      if (lerped) {
        const caught = +(options.catch ?? 0.002), decay = +(options.decay ?? 0.02), cap = +(options.cap ?? 1600);
        // With ramp, it starts from rest and catches up to the flow speed by ramp of the remaining share each frame — the slow first step of a band whose current spot chases the flowing target by .08 each frame (band on a reference site, js-ifs)
        const ramp = +(options.ramp ?? 0);
        held = { down: false, id: null, target: 0, prevX: 0, prevT: 0, vel: 0, inertia: 0, last: 0, flow: ramp ? 0 : 1 };
        const on = { signal };
        el.addEventListener("pointerdown", (e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          Object.assign(held, { down: true, id: e.pointerId, prevX: e.clientX, prevT: performance.now(), vel: 0, inertia: 0, target: s.x });
          el.setPointerCapture?.(e.pointerId);
          el.classList.add("is-dragging");
        }, on);
        el.addEventListener("pointermove", (e) => {
          if (!held.down || held.id !== e.pointerId) return;
          const now = performance.now(), dx = e.clientX - held.prevX, dt = Math.max((now - held.prevT) / 1000, 1 / 120);
          held.prevX = e.clientX; held.prevT = now;
          held.vel = held.vel * 0.7 + (dx / dt) * 0.3;
          held.target += dx;
        }, on);
        const up = (e) => {
          if (!held.down || held.id !== e.pointerId) return;
          held.down = false; held.id = null;
          held.inertia = gsap.utils.clamp(-cap, cap, held.vel);
          el.releasePointerCapture?.(e.pointerId);
          el.classList.remove("is-dragging");
        };
        el.addEventListener("pointerup", up, on);
        el.addEventListener("pointercancel", up, on);
        held.step = (dt) => {
          if (held.down) {
            const h = half();
            let d = held.target - s.x;
            if (d > h / 2) d -= h;
            if (d < -h / 2) d += h;
            const before = s.x;
            s.x += d * (1 - caught ** dt);
            held.vel = (s.x - before) / dt;
            return;
          }
          if (ramp) held.flow += (1 - held.flow) * (1 - (1 - ramp) ** (dt * 60));
          s.x += (speed() * 60 * -way * held.flow + held.inertia) * dt;
          held.target = s.x;
          held.inertia *= decay ** dt;
          if (Math.abs(held.inertia) < 4) held.inertia = 0;
        };
      } else if (eased) {
        const gain = +(options.gain ?? 1.5), follow = +(options.follow ?? 1);
        pull = { x: 0 };
        let down = false, from = 0, kept = 0, now = 0;
        const on = { signal };
        el.addEventListener("pointerdown", (e) => { down = true; from = e.clientX; el.classList.add("is-dragging"); }, on);
        addEventListener("pointermove", (e) => { if (!down) return; now = kept + e.clientX - from; gsap.to(pull, { x: gain * now, duration: follow, ease: "expo.out", overwrite: true }); }, on);
        const up = () => { if (!down) return; down = false; kept = now; el.classList.remove("is-dragging"); };
        addEventListener("pointerup", up, on);
        addEventListener("pointercancel", up, on);
        signal.addEventListener("abort", () => gsap.killTweensOf(pull));
      } else {
        const proxy = document.createElement("div");
        let last = 0;
        // Given resist, min-throw and max-throw, the throw inertia uses those values (Brand news band: 2600 · .2 · .85)
        const inert = { resistance: 3000, minDuration: +(options["min-throw"] ?? 0.5), maxDuration: +(options["max-throw"] ?? 2) };
        if (options.resist != null) inert.throwResistance = +options.resist;
        drag = Draggable.create(proxy, { trigger: el, type: "x", inertia: thrown, ...inert,
          onPress() { last = this.x; }, onDrag() { s.x += this.x - last; last = this.x; }, onThrowUpdate() { s.x += this.x - last; last = this.x; } })[0];
      }
      // wrap: for item, the band is not pushed as a whole but each cell is moved separately, and only a cell that has fully passed the left edge is shifted two widths to the right end (see js-ifs in a reference build) — the same cell does not jump by half widths and always returns in its own turn
      const perItem = options.wrap === "item";
      let kids = null, span = 0;
      const measure = () => {
        gsap.set(track.children, { x: 0 });
        const o = track.children[0].offsetLeft;
        span = copies.length ? (copies[0].offsetLeft - o) * 2 : track.scrollWidth;
        kids = [...track.children].map((k) => ({ k, b: k.offsetLeft - o, w: k.offsetWidth }));
      };
      if (perItem) addEventListener("resize", () => (kids = null), { signal });
      // inview: true makes the strip flow only while it is on screen (rootMargin −10px) — off screen it stays in place, then resumes flowing when it enters (Brand INVIEW)
      let seen = options.inview !== "true";
      if (!seen) {
        const io = new IntersectionObserver((es) => es.forEach((e) => (seen = e.isIntersecting)), { rootMargin: "-10px", threshold: 0 });
        io.observe(el);
        signal.addEventListener("abort", () => io.disconnect());
      }
      const tick = (time, dtMs) => {
        if (!seen) return;
        const v = boost ? scrolled() : 0;
        if (held) held.step(Math.max(dtMs, 1) / 1000);
        else if (paused) s.x -= v;
        else if (!drag || (!drag.isPressed && !drag.isThrowing)) s.x += (lap ? (reduce ? 0 : (way * Math.max(dtMs, 1) * half()) / 1000 / lap) : tiers.length ? (reduce ? 0 : (way * Math.max(dtMs, 1)) / 1000 / perPx()) : (way === 1 ? -speed() : speed())) * (over ? overMul : 1) - v;
        if (perItem) {
          if (!kids) measure();
          s.x = ((s.x % span) - span) % span;
          const X = pull ? s.x + pull.x : s.x;
          for (const c of kids) {
            let p = (((c.b + X) % span) + span) % span;
            if (p > span - c.w) p -= span;
            gsap.set(c.k, { x: p - c.b });
          }
          return;
        }
        const h = half();
        s.x = ((s.x % h) - h) % h;
        gsap.set(track, { x: pull ? (((s.x + pull.x) % h) - h) % h : s.x });
      };
      gsap.ticker.add(tick);
      signal.addEventListener("abort", () => { gsap.ticker.remove(tick); drag?.kill(); });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
