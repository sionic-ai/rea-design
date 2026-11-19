// Testimonial carousel: pc shows two (phone one) at a time, advancing one slot every 5s, and the circle around the dot fills over 5 seconds. Hovering a text card pauses it.
// After the end, it jumps to the front clone and secretly returns to the original spot, looping endlessly. Like the original, it starts spinning when the carousel top edge enters the screen,
// On touch devices, dragging sideways follows by half the dragged distance, and releasing after pushing past 30px advances one slot in that direction.
(() => {
  const car = document.querySelector(".nw-car");
  const track = car.querySelector(".nw-car__track");
  const pager = car.querySelector(".nw-car__pager");
  const items = [...track.children];
  const n = items.length;
  const inView = () => (document.body.clientWidth >= 767 ? 2 : 1);
  items.slice(0, 2).forEach((it) => track.append(it.cloneNode(true)));
  pager.innerHTML = items.map((_, i) => `<span class="nw-car__dot" data-i="${i}"><svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="8"/></svg></span>`).join("");
  const dots = [...pager.children];
  let at = 0, timer = null, paused = false, left = 5000, started = 0, running = false;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const offset = (i) => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return -(track.parentElement.clientWidth + gap) / inView() * i;
  };
  const place = (i, animate) => {
    track.classList.toggle("is-moving", animate && !reduce);
    track.style.transform = `translate3d(${offset(i)}px, 0, 0)`;
  };
  const mark = (i) => {
    dots.forEach((d) => d.classList.remove("is-active"));
    void pager.offsetWidth;
    dots[((i % n) + n) % n].classList.add("is-active");
  };
  const go = (i) => {
    if (i < 0) { place(n, false); void track.offsetWidth; i = n - 1; }
    at = i;
    place(at, true);
    mark(at);
    if (at >= n) setTimeout(() => { at = 0; place(0, false); }, 760);
    schedule(5000);
  };
  const schedule = (ms) => {
    clearTimeout(timer);
    left = ms;
    started = Date.now();
    if (running && !paused && !reduce) timer = setTimeout(() => go(at + 1), ms);
  };
  const pause = () => { paused = true; car.classList.add("is-paused"); clearTimeout(timer); left -= Date.now() - started; };
  const resume = () => { paused = false; car.classList.remove("is-paused"); schedule(Math.max(0, left)); };
  dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.i))));
  [...track.children].forEach((it) => { it.addEventListener("mouseenter", pause); it.addEventListener("mouseleave", resume); });
  addEventListener("resize", () => place(at, false));
  place(0, false);
  const begin = () => {
    if (running || car.getBoundingClientRect().top >= innerHeight) return;
    running = true;
    mark(at);
    schedule(5000);
  };
  addEventListener("scroll", begin, { passive: true });
  addEventListener("nl:ready", begin);
  begin();

  if (matchMedia("(hover: none), (pointer: coarse)").matches && !reduce) {
    track.style.touchAction = "pan-y";
    let id = null, x0 = 0, dx = 0;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      id = e.pointerId; x0 = e.clientX; dx = 0;
      if (at >= n) at = 0;
      track.classList.remove("is-moving");
      clearTimeout(timer);
      car.classList.add("is-paused");
    });
    track.addEventListener("pointermove", (e) => {
      if (e.pointerId !== id) return;
      dx = e.clientX - x0;
      track.style.transform = `translate3d(${offset(at) + dx / 2}px, 0, 0)`;
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      car.classList.remove("is-paused");
      if (Math.abs(dx) > 30) go(dx < 0 ? at + 1 : at - 1);
      else { place(at, true); schedule(5000); }
    };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
  }

  // Period accordion: height 0 ↔ inner height .5s, auto once fully open
  const acc = document.querySelector(".nw-acc");
  const body = acc.querySelector(".nw-acc__body");
  const inner = acc.querySelector(".nw-acc__list");
  acc.querySelector(".nw-acc__label").addEventListener("click", () => {
    const open = !acc.classList.contains("is-open");
    acc.classList.toggle("is-open", open);
    body.classList.remove("is-moving");
    body.style.height = open ? "0px" : inner.offsetHeight + "px";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      body.classList.add("is-moving");
      body.style.height = open ? inner.offsetHeight + "px" : "0px";
    }));
    body.addEventListener("transitionend", () => {
      body.classList.remove("is-moving");
      body.style.height = acc.classList.contains("is-open") ? "auto" : "0px";
      ScrollTrigger.refresh();
    }, { once: true });
  });
})();
