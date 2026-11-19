(() => {
  // Original (brand site hero): four logo stickers rise from 400px below, .5x scale and transparent, over 1s with curve (.19,1,.22,1) into place at their own tilt (after .25s, .075s apart),
  // Each one is delayed by .5s and bobs up and down 10px every 1.25s. Hover scales to 1.075 and press to 1.05. When grabbed and dragged it tilts 10° at 1.05 scale and follows the pointer exactly,
  // On release it springs back into place (stiffness 600 · damping 20). On press the chosen one moves to the left center at 1x (normally .5x), and the rest line up in a row at 500px spacing on the right, faded to .2.
  // Below width 920 it stands 2×2 (.33x), only the chosen one stays on top at .55x and the rest vanish.
  const springOf = (m, k, c) => {
    const w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    let x, slow;
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      x = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
      slow = z * w0;
    } else {
      x = (t) => 1 - (1 + w0 * t) * Math.exp(-w0 * t);
      slow = w0;
    }
    const duration = Math.log(1000) / slow;
    return { duration, ease: (p) => (p >= 1 ? 1 : x(p * duration)) };
  };
  const num = (v, d) => (v === undefined || v === "" ? d : +v);

  kfFx.register("sticker-focus-row", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const gap = num(options.gap, 500), shift = num(options.shift, 2.15);
    const small = num(options.small, 0.5), big = num(options.big, 1), dim = num(options.dim, 0.2);
    const msmall = num(options["m-small"], 0.33), mbig = num(options["m-big"], 0.55), narrow = num(options.narrow, 920);
    const dur = num(options.dur, 1), mdur = num(options["m-dur"], 0.4);
    const rise = num(options.rise, 400), from = num(options.from, 0.5);
    const delay = num(options.delay, 0.25), each = num(options.each, 0.075);
    const bob = num(options.bob, 10), beat = num(options.beat, 2.5), bobLag = num(options["bob-lag"], 0.5);
    const tilt = num(options.tilt, 10);
    // lean: late — The original doesn’t apply its own tilt on the first draw, but applies it in one frame at the first state change (press, fx:lean) (redraw by the design tool)
    let leaned = options.lean !== "late";
    const [bm, bk, bc] = String(options.back || "1,600,20").split(",").map(Number);
    const back = springOf(bm, bk, bc);
    const swift = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    const inout = kfFx.ease("0.42,0,0.58,1", "power1.inOut");
    // Hover and press scale use framer default easeOut(0,0,.58,1) .1s
    const tap = kfFx.ease("0,0,0.58,1", "power1.out");
    const dimEase = kfFx.ease("0.25,0.1,0.35,1", "power1.out");
    const mq = matchMedia(`(max-width: ${narrow}px)`);

    // Shell: slot (item) > Box (anchor: image size before shrinking — the name pill sits at 85% from the top of this box) > Hand (grab: drag · hover) > Size (size: scale/blur when lined up)
    //       > Entrance (logo: rise · own tilt) > Float (bob) > Sway (rock: selected one) > Picture
    const rows = items.map((item, i) => {
      const label = item.querySelector('[data-fx-part="label"]');
      // Tags each shell with a class — so always-moving ones like the floating shell can be told apart by look from the size·picture shells
      const mk = (name) => { const d = document.createElement("div"); d.setAttribute("data-fx-part", name); d.className = `fx-sfr-${name}`; return d; };
      const anchor = mk("anchor"), grab = mk("grab"), size = mk("size"), logo = mk("logo"), bobEl = mk("bob"), rock = mk("rock");
      const kids = [...item.childNodes].filter((n) => n !== label);
      kids.forEach((n) => rock.appendChild(n));
      bobEl.appendChild(rock); logo.appendChild(bobEl); size.appendChild(logo); grab.appendChild(size);
      anchor.appendChild(grab);
      if (label) anchor.appendChild(label);
      item.appendChild(anchor);
      logo.tabIndex = 0;
      logo.setAttribute("role", "button");
      if (label) logo.setAttribute("aria-label", label.textContent.trim());
      const d = item.dataset;
      return {
        item, anchor, grab, size, logo, bob: bobEl, rock, label, i,
        pos: { x: +d.x || 0, y: +d.y || 0, rot: +d.rot || 0, z: +d.z || items.length - i },
        mpos: { x: +(d.mx ?? d.x) || 0, y: +(d.my ?? d.y) || 0, rot: +(d.mrot ?? d.rot) || 0, z: +(d.mz ?? d.z) || items.length - i },
      };
    });
    const unwrap = () => rows.forEach((r) => {
      while (r.rock.firstChild) r.item.insertBefore(r.rock.firstChild, r.anchor);
      if (r.label) r.item.appendChild(r.label);
      r.anchor.remove();
      gsap.set(r.item, { clearProps: "transform,zIndex,opacity" });
    });

    let focus = -1, dragging = false;
    const narrowNow = () => mq.matches;
    const P = (r) => (narrowNow() ? r.mpos : r.pos);
    const emit = (name, detail) => el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));

    const layout = (instant) => {
      const n = narrowNow();
      const v = n ? 0.5 * innerHeight : gap, L = n ? 0 : v / shift;
      rows.forEach((r) => {
        const p = P(r), on = focus === r.i;
        let to;
        if (focus < 0) to = { x: p.x, y: p.y, opacity: 1 };
        else if (on) to = { x: -L, y: n ? -(0.25 * v) : 0, opacity: 1 };
        else if (!n) to = { x: v * r.i - v * focus - L, y: 0, opacity: 1 };
        else to = { x: p.x, y: p.y, opacity: 0 };
        gsap.set(r.item, { zIndex: p.z });
        const d = instant ? 0 : n ? mdur : dur;
        gsap.to(r.item, { x: to.x, y: to.y, duration: d, ease: swift, overwrite: "auto" });
        // On narrow screens other stickers vanish with .1s easeOut (original opacity: { duration: .1 } — Curve tuned by measurement)
        const fadeOut = n && focus >= 0 && !on;
        gsap.to(r.item, { opacity: to.opacity, duration: instant ? 0 : fadeOut ? 0.1 : d, ease: fadeOut ? tap : swift });
        const sc = n ? (on ? mbig : msmall) : on ? big : small;
        const op = focus < 0 ? 1 : on ? 1 : dim;
        gsap.to(r.size, { scale: sc, duration: instant ? 0 : 0.5, ease: swift, overwrite: "auto" });
        // Blur (.2) lags the builder’s default opacity transition .3s (.25,.1,.35,1) by .05s — the original gave opacity only a delay
        gsap.to(r.size, { opacity: op, duration: instant ? 0 : 0.3, delay: instant ? 0 : 0.05, ease: dimEase });
        // The own tilt is a value applied all at once, so painting it at the same moment as the display makes them overlap — apply only when it changes, on the next frame (the original also applies it one frame after reflecting)
        const lean = leaned ? P(r).rot : 0;
        if (!instant && gsap.getProperty(r.logo, "rotation") !== lean) requestAnimationFrame(() => gsap.set(r.logo, { rotation: lean }));
        else gsap.set(r.logo, { rotation: lean });
        gsap.killTweensOf(r.rock);
        if (on && !reduce) {
          gsap.set(r.rock, { rotation: 0 });
          gsap.to(r.rock, { rotation: -(2 * (P(r).rot || 2)), duration: beat, ease: inout, yoyo: true, repeat: -1 });
        } else gsap.to(r.rock, { rotation: 0, duration: instant ? 0 : 0.5, ease: swift });
        r.grab.toggleAttribute("aria-disabled", focus >= 0);
        r.logo.tabIndex = focus >= 0 ? -1 : 0;
        r.item.dataset.toggled = String(on);
      });
      el.dataset.focus = String(focus);
    };
    // Upon selecting, the marker (--fx-focus) is changed before moving — in the original (framer) React applies the attribute first and the motion starts on the same frame.
    // If it moves right away without a marker, the first painted value is already advanced, so an observer (measurement or another script) misses the start value
    let frame = 0;
    const mark = () => rows.forEach((r) => { r.item.style.setProperty("--fx-focus", String(focus)); r.size.style.setProperty("--fx-focus", String(focus)); r.logo.style.setProperty("--fx-focus", String(focus)); });
    const pick = (i, why) => {
      const n = rows.length;
      const next = i < 0 ? -1 : ((i % n) + n) % n;
      if (next === focus) return;
      focus = next;
      leaned = true;
      mark();
      layout(false);
      emit("fx:focus", { index: focus, item: focus < 0 ? null : rows[focus].item, why });
    };

    // Initial placement — the entrance curve is applied not to the size shell but to the entrance shell (original logo initial y 400·scale .5)
    layout(true);
    const tweens = [];
    rows.forEach((r) => {
      if (reduce) { gsap.set(r.logo, { rotation: leaned ? P(r).rot : 0 }); return; }
      const at = delay + each * r.i;
      gsap.set(r.logo, { y: rise, scale: from, opacity: 0.01, rotation: leaned ? P(r).rot : 0 });
      tweens.push(gsap.to(r.logo, { y: 0, scale: 1, duration: 1, delay: at, ease: swift }));
      tweens.push(gsap.to(r.logo, { opacity: 1, duration: 0.3, delay: at, ease: swift }));
      gsap.set(r.bob, { y: 0 });
      tweens.push(gsap.to(r.bob, { y: -bob, duration: beat / 2, delay: bobLag * r.i, ease: inout, yoyo: true, repeat: -1 }));
    });

    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };

    rows.forEach((r) => {
      let sx = 0, sy = 0, down = false, moved = false;
      const can = () => focus < 0;
      if (hover) {
        // Hover also changes the indicator (--fx-hover) first, then applies the scale
        const hoverTo = (s) => {
          r.grab.style.setProperty("--fx-hover", s > 1 ? "1" : "0");
          gsap.to(r.grab, { scale: s, duration: 0.1, ease: tap, overwrite: "auto" });
        };
        on(r.grab, "pointerenter", () => { if (can() && !dragging) hoverTo(1.075); });
        on(r.grab, "pointerleave", () => { if (!down) hoverTo(1); });
      }
      on(r.grab, "pointerdown", (e) => {
        if (!can() || e.button !== 0) return;
        down = true; moved = false; sx = e.clientX; sy = e.clientY;
        r.logo.setPointerCapture?.(e.pointerId);
        gsap.killTweensOf(r.grab, "x,y");
        gsap.to(r.grab, { scale: 1.05, duration: 0.1, ease: tap, overwrite: "auto" });
        emit("fx:press", { index: r.i });
      });
      on(r.grab, "pointermove", (e) => {
        if (!down) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 3) return;
        if (!moved) {
          moved = true; dragging = true;
          r.item.dataset.dragging = "true"; el.dataset.dragging = "true";
          gsap.to(r.grab, { rotation: tilt, scale: 1.05, duration: 0.1, ease: tap });
          emit("fx:grab", { index: r.i });
        }
        gsap.set(r.grab, { x: dx, y: dy });
      });
      const up = () => {
        if (!down) return;
        down = false;
        if (moved) {
          dragging = false;
          r.item.dataset.dragging = "false"; el.dataset.dragging = "false";
          gsap.to(r.grab, { x: 0, y: 0, duration: back.duration, ease: back.ease });
          gsap.to(r.grab, { rotation: 0, scale: r.grab.matches(":hover") && hover ? 1.075 : 1, duration: 0.15 });
          emit("fx:drop", { index: r.i });
        } else {
          // When the press ends it just returns to the hover scale — the original doesn’t restore the drag shell scale after picking (1 when the hand leaves)
          gsap.to(r.grab, { scale: hover && r.grab.matches(":hover") ? 1.075 : 1, duration: 0.1, ease: tap, overwrite: "auto" });
          armed = true;
        }
      };
      // Picking happens on the following click event — the same timing as the original (framer onClick). A click after drag-and-release is discarded
      let armed = false;
      on(r.grab, "click", () => { if (!armed) return; armed = false; pick(r.i, "click"); });
      on(r.grab, "pointerup", up);
      on(r.grab, "pointercancel", () => { up(); armed = false; });
      on(r.grab, "keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && can()) { e.preventDefault(); pick(r.i, "key"); } });
    });

    on(el, "fx:pick", (e) => pick(+e.detail, "api"));
    on(el, "fx:lean", () => {
      if (leaned) return;
      leaned = true;
      mark();
      frame = requestAnimationFrame(() => rows.forEach((r) => gsap.set(r.logo, { rotation: P(r).rot })));
    });
    on(el, "fx:step", (e) => { if (focus >= 0) pick(focus + (+e.detail || 1), +e.detail < 0 ? "back" : "forward"); });
    on(window, "keydown", (e) => {
      if (focus < 0 || e.repeat) return;
      if (e.key === "Escape") pick(-1, "close");
      else if (e.key === "ArrowRight") pick(focus + 1, "forward");
      else if (e.key === "ArrowLeft") pick(focus - 1, "back");
    });
    const relayout = () => layout(true);
    mq.addEventListener("change", relayout);
    offs.push(() => mq.removeEventListener("change", relayout));
    on(window, "resize", () => { if (narrowNow() && focus >= 0) layout(true); });

    return () => {
      cancelAnimationFrame(frame);
      tweens.forEach((t) => t.kill());
      offs.forEach((f) => f());
      rows.forEach((r) => gsap.killTweensOf([r.item, r.grab, r.size, r.logo, r.bob, r.rock]));
      unwrap();
    };
  });
})();
