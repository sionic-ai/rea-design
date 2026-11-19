(() => {
  // Bottom progress bar — each section has a tick, and the moment a section’s start rises offset above the screen bottom, the bar end and the vehicle reach that section’s tick.
  // Between ticks fill in with straight lines so ticks stand evenly even if section lengths differ. Dragging the vehicle reads the same table in reverse and scrolls to that spot
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const norm = (a, b, v) => (a === b ? 1 : clamp((v - a) / (b - a)));

  kfFx.register("rider-progress-bar", (el, { options, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const rider = part("rider"), fill = part("fill"), ticksBox = part("ticks"), labelsBox = part("labels");
    const track = fill?.parentElement;
    const container = document.querySelector(options.container || "main");
    if (!rider || !fill || !track || !container) return;
    const sections = [...container.querySelectorAll(options.sections || "[data-rider-name]")];
    if (!sections.length) return;
    gsap.registerPlugin(ScrollTrigger);

    const footer = options.footer ? document.querySelector(options.footer) : null;
    const narrow = matchMedia(`(max-width: ${+(options.narrow || 768)}px)`);
    const offset = () => +((narrow.matches ? options["offset-narrow"] ?? options.offset : options.offset) ?? 0);
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    const pageY = (n) => n.getBoundingClientRect().top + top() - (scroller ? scroller.getBoundingClientRect().top : 0);
    const footH = () => (footer ? footer.getBoundingClientRect().height : 0);
    const names = sections.map((s) => s.getAttribute("data-rider-name") || "");

    const made = [];
    const tickEls = ticksBox ? names.map((name) => {
      const t = document.createElement("span");
      t.className = "fx-rider-tick";
      t.dataset.name = name;
      ticksBox.append(t);
      made.push(t);
      return t;
    }) : [];
    const half = (sections.length - 1) * 0.5;
    const labelEls = labelsBox ? names.map((name, i) => {
      const l = document.createElement("span");
      l.className = "fx-rider-label";
      l.dataset.len = name.length > 6 ? "long" : "short";
      l.dataset.side = i < half ? "left" : "right";
      const inner = document.createElement("span");
      inner.className = "fx-rider-label__in";
      inner.textContent = name;
      l.append(inner);
      labelsBox.append(l);
      made.push(l);
      return l;
    }) : [];

    // starts[i] — scroll progress (0~1) at which section i becomes the current section, marks[i] — position (0~1) of its tick on the bar
    let starts = [], marks = [], dragging = false, st = null, st2 = null;
    const measure = () => {
      if (!st) return;
      const span = Math.max(st.end - st.start, 1), h = view();
      starts = sections.map((s) => clamp((pageY(s) + offset() - h - st.start) / span));
      const tr = track.getBoundingClientRect();
      marks = tickEls.length && tr.width
        ? tickEls.map((t) => { const r = t.getBoundingClientRect(); return clamp((r.left + r.width * 0.5 - tr.left) / tr.width); })
        : sections.map((_, i) => (i + 1) / (sections.length + 1));
    };
    const toBar = (p) => {
      if (!starts.length) return p;
      if (p <= starts[0]) return lerp(0, marks[0], starts[0] === 0 ? 1 : norm(0, starts[0], p));
      for (let i = 0; i < starts.length; i++) {
        const next = starts[i + 1];
        if (next == null) return lerp(marks[i], 1, norm(starts[i], 1, p));
        if (p <= next) return lerp(marks[i], marks[i + 1], norm(starts[i], next, p));
      }
      return 1;
    };
    const toScroll = (b) => {
      if (!starts.length) return b;
      if (b <= marks[0]) return lerp(0, starts[0], norm(0, marks[0], b));
      for (let i = 0; i < marks.length; i++) {
        const next = marks[i + 1];
        if (next == null) return lerp(starts[i], 1, norm(marks[i], 1, b));
        if (b <= next) return lerp(starts[i], starts[i + 1], norm(marks[i], next, b));
      }
      return 1;
    };
    const riderX = (b) => {
      const box = rider.offsetParent;
      if (!box) return 0;
      const tr = track.getBoundingClientRect(), br = box.getBoundingClientRect();
      return tr.left - br.left + tr.width * b - (rider.offsetLeft + rider.offsetWidth * 0.5);
    };
    let active = -2;
    const setActive = (p) => {
      let i = -1;
      for (let k = 0; k < starts.length; k++) if (p >= starts[k]) i = k;
      if (i === active) return;
      active = i;
      tickEls.forEach((t, k) => (t.dataset.active = k === i ? "1" : "0"));
      labelEls.forEach((l, k) => (l.dataset.active = k === i ? "1" : "0"));
      el.dataset.section = i >= 0 ? names[i] : "";
    };
    const paint = (p) => {
      const b = toBar(p);
      gsap.set(fill, { xPercent: -100 + b * 100 });
      gsap.set(rider, { x: riderX(b) });
      setActive(p);
    };

    st = ScrollTrigger.create({
      trigger: container,
      ...(scroller && { scroller }),
      start: "top bottom",
      end: () => `bottom ${view() * 0.5 + footH() * 0.5}px`,
      scrub: true,
      onRefresh: (self) => { measure(); paint(self.progress); },
      onUpdate: (self) => { if (!dragging) paint(self.progress); },
      onToggle: (self) => (el.dataset.on = self.isActive ? "1" : "0"),
    });
    // The vehicle enter/exit check comes in a little late (2%) and leaves a little early (.525) — the vehicle rushes in after the bar has risen
    st2 = ScrollTrigger.create({
      trigger: container,
      ...(scroller && { scroller }),
      start: `2% bottom`,
      end: () => `bottom ${view() * 0.525 + footH() * 0.5}px`,
      onEnter: () => (el.dataset.status = "1"),
      onEnterBack: () => (el.dataset.status = "3"),
      onLeave: () => (el.dataset.status = "2"),
      onLeaveBack: () => (el.dataset.status = "0"),
    });
    el.dataset.on = st.isActive ? "1" : "0";
    el.dataset.status = st2.isActive ? "1" : st2.progress >= 1 ? "2" : "0";
    measure();
    paint(st.progress);

    // Faces forward when going down, turns around when going up
    let last = top();
    el.dataset.dir = "down";
    const onScroll = () => {
      const y = top();
      if (y > last) el.dataset.dir = "down";
      else if (y < last) el.dataset.dir = "up";
      last = y;
    };
    const scrollTarget = scroller || window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });

    const smooth = () => (options.api ? window[options.api] : null);
    const dragTo = (clientX) => {
      const tr = track.getBoundingClientRect();
      if (!tr.width) return;
      const b = clamp((clientX - tr.left) / tr.width);
      const p = toScroll(b);
      gsap.set(fill, { xPercent: -100 + b * 100 });
      gsap.set(rider, { x: riderX(b) });
      setActive(p);
      const y = lerp(st.start, st.end, p);
      const api = smooth();
      if (api?.scrollTo) api.scrollTo(y, { immediate: true, force: true, duration: 0 });
      else scrollTarget.scrollTo(0, y);
      ScrollTrigger.update();
    };
    const down = (e) => {
      if (e.button > 0) return;
      e.preventDefault();
      dragging = true;
      el.classList.add("is-dragging");
      rider.setPointerCapture?.(e.pointerId);
      dragTo(e.clientX);
    };
    const move = (e) => { if (dragging) { e.preventDefault(); dragTo(e.clientX); } };
    const up = (e) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      rider.releasePointerCapture?.(e.pointerId);
    };
    rider.style.touchAction = "none";
    rider.addEventListener("pointerdown", down);
    rider.addEventListener("pointermove", move);
    rider.addEventListener("pointerup", up);
    rider.addEventListener("pointercancel", up);

    // When an accordion opens or closes or a late font changes section height, tick positions are re-measured — waiting while the height is still moving
    // Once, after it stops and refresh has passed (default 300ms, original: refresh after the 300ms fold)
    const wait = +(options.refresh ?? 300);
    let timer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => { st?.refresh(); st2?.refresh(); }, wait);
    });
    ro.observe(container);
    ro.observe(track);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      st?.kill();
      st2?.kill();
      scrollTarget.removeEventListener("scroll", onScroll);
      rider.removeEventListener("pointerdown", down);
      rider.removeEventListener("pointermove", move);
      rider.removeEventListener("pointerup", up);
      rider.removeEventListener("pointercancel", up);
      rider.style.removeProperty("touch-action");
      made.forEach((n) => n.remove());
      gsap.set([fill, rider], { clearProps: "transform" });
      ["on", "status", "dir", "section"].forEach((k) => delete el.dataset[k]);
      el.classList.remove("is-dragging");
    };
  });
})();
