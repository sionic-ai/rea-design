(() => {
  // Cards are pinned step degrees apart around a far point below (card height × radius multiple), forming a big wheel. Rotating the invisible big circle (wheel) with Draggable then
  // Each card’s wheel angle minus its own slot is wrapped into −half turn to half turn so it continues endlessly, and on release it glides by inertia and snaps to a cell
  kfFx.register("radial-drag-slider", (el, { options, reduce, scroller }) => {
    const list = el.querySelector('[data-fx-part="list"]');
    const own = list ? [...list.querySelectorAll(':scope > [data-fx-part="item"]')] : [];
    if (!own.length || !window.Draggable) return;
    gsap.registerPlugin(Draggable, ...(window.InertiaPlugin ? [InertiaPlugin] : []));
    const ease = kfFx.ease(options.ease || "0.25,0.1,0,1", "power3.out"), dur = +(options.dur ?? 1);
    const real = own.length;
    let items = own, step = 9, clones = [], drag = null, proxy = null, last = -1;
    const counts = [...el.querySelectorAll('[data-fx-part="count"]')];
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const index = () => -gsap.getProperty(proxy, "rotation") / step;
    const wrapOff = (i, cur, n) => i - (cur + Math.round((i - cur) / n) * n) || 0;
    const update = () => {
      const cur = index(), n = items.length, act = ((Math.round(cur) % n) + n) % n;
      items.forEach((it, i) => {
        gsap.set(it, { rotation: wrapOff(i, cur, n) * step });
        it.classList.toggle("is-active", i === act);
      });
      const k = act % real;
      if (k !== last) {
        last = k;
        counts.forEach((c) => { c.textContent = String(k + 1).padStart(2, "0"); });
        dots.forEach((d, i) => { d.classList.toggle("is-active", i === k); d.setAttribute("aria-current", i === k ? "true" : "false"); });
      }
    };
    const goTo = (target) => {
      gsap.killTweensOf(proxy);
      if (reduce) { gsap.set(proxy, { rotation: -target * step }); update(); return; }
      gsap.to(proxy, { rotation: -target * step, duration: dur, ease, onUpdate: update });
    };
    const build = () => {
      clones.forEach((c) => c.remove());
      drag?.kill(); proxy?.remove();
      const cs = getComputedStyle(el);
      step = parseFloat(cs.getPropertyValue("--fx-step")) || +options.step || 9;
      const box = own[0].getBoundingClientRect();
      list.style.height = box.height + "px";
      const origin = parseFloat(getComputedStyle(own[0]).transformOrigin.split(" ")[1]) || 3.75 * box.height;
      // Clone as many cards as needed to fill both ends of the screen — convert the angle that half the screen width takes at the wheel radius into a cell count.
      const half = Math.asin(Math.min(1, (el.clientWidth / 2 + box.width) / Math.max(origin, 1))) * 180 / Math.PI;
      const need = Math.min(Math.floor(360 / step), 2 * Math.ceil(half / step) + 3);
      clones = [];
      for (let i = real; i < Math.ceil(need / real) * real; i++) {
        const c = own[i % real].cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        c.classList.add("is-clone");
        list.append(c);
        clones.push(c);
      }
      items = [...own, ...clones];
      proxy = document.createElement("div");
      proxy.className = "fx-radial-drag-slider__proxy";
      const r = origin - box.height / 2 + 0.525 * Math.max(box.width, box.height);
      Object.assign(proxy.style, { width: 2 * r + "px", height: 2 * r + "px", top: origin - r + "px" });
      list.append(proxy);
      gsap.set(proxy, { rotation: 0, xPercent: -50 });
      last = -1;
      drag = Draggable.create(proxy, {
        type: "rotation", trigger: list, inertia: !!window.InertiaPlugin && !reduce,
        throwResistance: 2000, dragResistance: 0.05, maxDuration: 1, minDuration: 0.5, edgeResistance: 0.75, overshootTolerance: 0,
        snap: (v) => Math.round(v / step) * step,
        onDrag: update, onThrowUpdate: update,
        onPress: () => el.classList.add("is-grabbing"),
        onRelease() { el.classList.remove("is-grabbing"); if (!this.tween) goTo(Math.round(index())); },
        onClick(e) {
          const p = e.changedTouches ? e.changedTouches[0] : e;
          const hit = document.elementsFromPoint(p.clientX, p.clientY).find((n) => items.includes(n) || items.includes(n.closest?.('[data-fx-part="item"]')));
          const it = hit && (items.includes(hit) ? hit : hit.closest('[data-fx-part="item"]'));
          if (!it) return;
          const cur = index();
          goTo(cur + wrapOff(items.indexOf(it), cur, items.length));
        },
      })[0];
      update();
    };
    const onPrev = () => goTo(Math.round(index()) - 1), onNext = () => goTo(Math.round(index()) + 1);
    const onDot = (e) => {
      const k = dots.indexOf(e.currentTarget), cur = index();
      let best = 0, dist = Infinity;
      items.forEach((_, i) => { if (i % real !== k) return; const d = wrapOff(i, cur, items.length); if (Math.abs(d) < dist) { dist = Math.abs(d); best = d; } });
      goTo(cur + best);
    };
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);
    dots.forEach((d) => d.addEventListener("click", onDot));
    el.classList.add("is-fx-ready");
    build();
    let w = el.clientWidth;
    const ro = new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) < 2) return; w = el.clientWidth; const at = Math.round(index()); build(); gsap.set(proxy, { rotation: -at * step }); update(); });
    ro.observe(el);
    return () => {
      ro.disconnect();
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
      dots.forEach((d) => d.removeEventListener("click", onDot));
      drag?.kill(); proxy?.remove(); clones.forEach((c) => c.remove());
      gsap.set(own, { clearProps: "transform" });
      own.forEach((it) => it.classList.remove("is-active"));
      list.style.height = "";
      el.classList.remove("is-fx-ready", "is-grabbing");
    };
  });
})();
