/* Director detail — entrance (background ink → red 2s) · time colon blinking · one-line change · infinite slider inside the photo panel (5s·.4s) · question accordion (.4s) · video window · other director preview */
(() => {
  const { reduce, css } = window.PG;
  window.PG.enter((tl) => {
    if (!tl) { document.querySelector("[data-load-bg-color]").style.background = css("--kf-accent"); return; }
    tl.to("[data-load-bg-color]", { backgroundColor: css("--kf-accent"), duration: 2, ease: "power2.out" }, "<10%");
    tl.from("[data-load-title]", { opacity: 0, y: "0.5em", duration: 0.8, ease: "power2.out" }, "<10%");
    tl.from("[data-load-subtitle]", { opacity: 0, y: "0.75em", duration: 0.8, ease: "power2.out" }, "<10%");
    tl.from("[data-load-time]", { opacity: 0, y: "0.75em", duration: 0.8, ease: "power2.out" }, "<10%");
    tl.from("[data-load-location]", { opacity: 0, y: "0.75em", duration: 0.8, ease: "power2.out" }, "<10%");
    tl.from("[data-load-content]", { opacity: 0, duration: 1.2, ease: "power2.out" }, "<10%");
  });

  // Local time: the colon blinks on and off every 1s (.2s)
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    let on = true;
    const tick = () => {
      const s = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      const i = s.lastIndexOf(":");
      clock.innerHTML = `${s.slice(0, i)}<span class="dh__colon${on ? "" : " is-off"}">:</span>${s.slice(i + 1)}`;
      on = !on;
    };
    tick();
    setInterval(tick, 1000);
  }

  // One phrase fades out in .3s, then the next phrase comes in in .3s
  const word = document.querySelector("[data-word]");
  if (word && !reduce) {
    const WORDS = ["Word One", "Word Two", "Word Three"];
    let k = 0;
    setInterval(() => {
      word.style.opacity = "0";
      setTimeout(() => { k = (k + 1) % WORDS.length; word.textContent = WORDS[k]; word.style.opacity = "1"; }, 300);
    }, 2400);
  }

  // Infinite slider inside the photo panel — progress bar 5s, slide .4s power2.out, dragging gives inertia and snap .4s
  const dslider = () => {
    const root = document.querySelector("[data-dslider]");
    if (!root || !window.Draggable) return;
    const coll = root.querySelector("[data-dslider-coll]");
    const track = root.querySelector("[data-dslider-list]");
    const items = [...root.querySelectorAll("[data-dslider-item]")];
    const prog = root.querySelector("[data-dslider-progress]");
    const DUR = 5, MOVE = 0.4, n = items.length;
    prog.innerHTML = items.map(() => '<button class="dgal__pbtn" type="button" aria-label="Scene"></button>').join("");
    const btns = [...prog.children];
    const bar = document.createElement("div");
    bar.className = "dgal__pbar";
    const w = () => items[0].getBoundingClientRect().width;
    const snaps = () => items.map((_, i) => -i * w());
    let active = 0, ptl, auto;
    const setX = gsap.quickSetter(track, "x", "px");
    const status = () => btns.forEach((b, i) => { b.classList.toggle("is-active", i === active); if (i === active && bar.parentNode !== b) b.appendChild(bar); });
    const progress = () => {
      ptl?.kill();
      btns[active].appendChild(bar);
      gsap.set(bar, { width: 0, x: 0 });
      if (reduce) return;
      ptl = gsap.timeline({ onComplete: next }).to(bar, { width: "100%", duration: DUR });
    };
    const go = (t) => {
      const sw = w(), cur = gsap.getProperty(track, "x");
      let d = snaps()[t] - cur;
      if (Math.abs(d + n * sw) < Math.abs(d)) d += n * sw;
      else if (Math.abs(d - n * sw) < Math.abs(d)) d -= n * sw;
      ptl?.pause();
      gsap.to(track, { duration: MOVE, x: cur + d, ease: "power2.out", onComplete: () => { gsap.set(track, { x: snaps()[t] }); active = t; status(); progress(); } });
    };
    function next() { go((active + 1) % n); }
    const restart = () => { clearInterval(auto); if (!reduce) auto = setInterval(next, DUR * 1000); };
    root.querySelectorAll("[data-dslider-control]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      restart();
      go((active + (b.dataset.dsliderControl === "next" ? 1 : -1) + n) % n);
    }));
    btns.forEach((b, i) => b.addEventListener("click", (e) => { e.stopPropagation(); restart(); go(i); }));
    Draggable.create(track, {
      type: "x",
      inertia: true,
      bounds: { minX: -w() * (n - 0.5), maxX: w() * 0.5 },
      throwResistance: 2000,
      dragResistance: 0.05,
      maxDuration: 0.6,
      minDuration: 0.2,
      edgeResistance: 1,
      snap: { x: (v) => snaps().reduce((a, p) => (Math.abs(p - v) < Math.abs(a - v) ? p : a)), duration: 0.4 },
      onPress(e) { e.stopPropagation?.(); ptl?.pause(); },
      onDrag() { setX(this.x); },
      onThrowComplete() { active = Math.round(-gsap.getProperty(track, "x") / w()); active = ((active % n) + n) % n; gsap.set(track, { x: snaps()[active] }); status(); progress(); },
    });
    // Grabbing the slider shouldn’t drag the card itself — drag cards by the header bar
    coll.addEventListener("pointerdown", (e) => e.stopPropagation());
    setX(0);
    status();
    progress();
    restart();
  };

  // Question accordion: close the open one, .4s height / arrow -180°
  const toggles = [...document.querySelectorAll(".dpr__toggle")];
  const images = [...document.querySelectorAll(".dpr__image")];
  const setH = (el, open) => {
    const ans = el.nextElementSibling;
    const from = ans.offsetHeight;
    ans.style.height = "auto";
    const to = open ? ans.offsetHeight : 0;
    if (reduce) { ans.style.height = open ? "auto" : "0px"; return; }
    gsap.fromTo(ans, { height: from }, { height: to, duration: 0.4, ease: "sine.inOut", onComplete: () => { if (open) ans.style.height = "auto"; } });
  };
  toggles.forEach((t, i) => {
    t.addEventListener("click", () => {
      const open = !t.classList.contains("is-open");
      if (open) toggles.forEach((o) => { if (o !== t && o.classList.contains("is-open")) { setH(o, false); o.classList.remove("is-open"); } });
      setH(t, open);
      t.classList.toggle("is-open", open);
      if (open) images.forEach((im, k) => im.classList.toggle("is-active", k === i));
    });
    t.closest(".dpr__item").addEventListener("mouseenter", () => images.forEach((im, k) => im.classList.toggle("is-active", k === i)));
  });

  // Video window
  const lb = document.querySelector("[data-lightbox]");
  const setLb = (on) => { lb?.setAttribute("data-open", on ? "true" : "false"); lb?.setAttribute("aria-hidden", on ? "false" : "true"); };
  document.querySelectorAll("[data-lightbox-trigger]").forEach((b) => b.addEventListener("click", () => setLb(true)));
  lb?.querySelectorAll("[data-lightbox-close]").forEach((b) => b.addEventListener("click", () => setLb(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setLb(false); });

  // Another director: a card that follows the cursor with quickTo .6s power3, scaling 0→1 in .3s only on first entry
  const follower = () => {
    const wrap = document.querySelector("[data-follower-wrap]");
    if (!wrap || reduce || !matchMedia("(hover: hover) and (min-width: 992px)").matches) return;
    const coll = wrap.querySelector("[data-follower-collection]");
    const cur = wrap.querySelector("[data-follower-cursor]");
    const inner = wrap.querySelector("[data-follower-cursor-inner]");
    const ease = "power2.inOut";
    let first = true, prev = null;
    gsap.set(cur, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(cur, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(cur, "y", { duration: 0.6, ease: "power3" });
    addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    const drop = (el, d) => { gsap.killTweensOf(el); gsap.to(el, { autoAlpha: 0, scale: 0, duration: d, ease, overwrite: "auto", onComplete: () => el.remove() }); };
    wrap.querySelectorAll("[data-follower-item]").forEach((item, i) => {
      item.addEventListener("mouseenter", () => {
        const d = prev === null ? 0.3 : 0;
        prev = i;
        inner.querySelectorAll("[data-follower-visual]").forEach((el) => drop(el, 0));
        const v = item.querySelector("[data-follower-visual]");
        if (!v) return;
        const c = v.cloneNode(true);
        inner.appendChild(c);
        const s = first ? 0 : 1;
        gsap.fromTo(c, { autoAlpha: s, scale: s }, { autoAlpha: 1, scale: 1, duration: d, ease, overwrite: "auto" });
        first = false;
      });
      item.addEventListener("mouseleave", () => { const el = inner.querySelector("[data-follower-visual]"); if (el) drop(el, 0.3); });
    });
    coll.addEventListener("mouseleave", () => { inner.querySelectorAll("[data-follower-visual]").forEach((el) => drop(el, 0.3)); first = true; prev = null; });
  };

  document.addEventListener("DOMContentLoaded", () => { dslider(); follower(); });
})();
