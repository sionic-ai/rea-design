// First page motion — photo trail (original mwg020) · word fly-in (mwg005) · event slide · endlessly rotating people cards (mwg008). Values are as in the original.
(() => {
  // Append one more set of the five person cards — before the shared motion, so the highlighter strip and pixel cells also catch the second set
  const prep = (root) => {
    const track = root.querySelector("[data-team-track]");
    if (!track || track.dataset.cloned) return;
    track.dataset.cloned = "1";
    [...track.children].forEach((c) => { const d = c.cloneNode(true); d.setAttribute("aria-hidden", "true"); track.append(d); });
  };

  // One slide per 1/8 of the screen width moved — settles at 1.3x with elastic.out(2,.6) .6s, slides by the moved direction ×4 over 1.5s power4.out, rests .1s, then goes to .5x with .3s back.in(1.5)
  const trail = (root, k) => {
    const sec = root.querySelector("[data-trail]");
    const items = sec ? [...sec.querySelectorAll("[data-trail-item]")] : [];
    if (!items.length) return;
    const gap = innerWidth / 8;
    let dist = 0, lx = null, ly = null, idx = 0;
    const spawn = (x, y, dx, dy) => {
      const src = items[idx];
      const el = src.cloneNode(true);
      el.removeAttribute("data-trail-item");
      el.className = src.className.replace("hero__media", "hero__trail");
      sec.append(el);
      gsap.timeline({ onComplete: () => el.remove() })
        .fromTo(el, { xPercent: 80 * (Math.random() - 0.5) - 50, yPercent: 10 * (Math.random() - 0.5) - 50, scaleX: 1.3, scaleY: 1.3 }, { scaleX: 1, scaleY: 1, ease: "elastic.out(2, 0.6)", duration: 0.6 })
        .fromTo(el, { x, y, rotation: 20 * (Math.random() - 0.5) }, { x: "+=" + 4 * dx, y: "+=" + 4 * dy, rotation: 20 * (Math.random() - 0.5), ease: "power4.out", duration: 1.5 }, "<")
        .to(el, { duration: 0.3, scale: 0.5, delay: 0.1, ease: "back.in(1.5)" });
      idx = (idx + 1) % items.length;
    };
    k.on(sec, "mousemove", (e) => {
      const x = e.clientX, y = e.clientY;
      if (lx === null) { lx = x; ly = y; return; }
      dist += Math.abs(x - lx) + Math.abs(y - ly);
      if (dist > gap) { dist = 0; spawn(x, y - sec.getBoundingClientRect().top, x - lx, y - ly); }
      lx = x; ly = y;
    });
  };

  // Pins the plate for 500vh and brings words in from outside 100vw on the right with a .02 stagger on power4.inOut (scrub)
  const words = (root, k) => {
    const pin = root.querySelector(".about__pin"), box = pin?.querySelector(".about__box"), para = box?.querySelector(".about__para");
    if (!para) return;
    const text = para.textContent.trim();
    para.innerHTML = text.split(" ").map((w) => `<span class="aw-word">${w}</span>`).join(" ");
    const tw = gsap.to(para.querySelectorAll(".aw-word"), {
      x: 0, stagger: 0.02, ease: "power4.inOut",
      scrollTrigger: { trigger: pin, start: "top top", end: "bottom bottom", scrub: true, pin: box, pinSpacing: false, invalidateOnRefresh: true },
    });
    k.add(() => { tw.scrollTrigger?.kill(); tw.kill(); para.textContent = text; });
  };

  // Event switching: every 6 seconds as if the next slot were pressed — on exit the title line goes −110% · −2° over .6s power3.in, the rest −20px over .5s (.1s late)
  // On entering, the tag comes in from 120% · 10° over 1.2s, title lines from 110% · 5° over 1.4s (.1s sequence · .1s later) power4.out, text .4s · button .6s later from 30px over .8s power3.out
  const gallery = (root, k) => {
    const g = root.querySelector("[data-event-gallery]");
    if (!g) return;
    const slots = [...g.querySelectorAll(".ev__slot")], contents = [...g.querySelectorAll(".ev__content")];
    if (!slots.length || !contents.length) return;
    const STEP = 6;
    let timer = null, busy = false;
    slots.forEach((s) => {
      const box = Object.assign(document.createElement("span"), { className: "ev__progress" });
      box.append(Object.assign(document.createElement("span"), { className: "ev__progress-fill" }));
      s.append(box);
    });
    const progress = (i) => {
      timer?.kill();
      g.querySelectorAll(".ev__progress-fill").forEach((f) => gsap.set(f, { width: "0%" }));
      const fill = slots[i]?.querySelector(".ev__progress-fill");
      if (!fill) return;
      timer = gsap.to(fill, { width: "100%", duration: STEP, ease: "none", onComplete: () => { if (!busy) go(slots[(i + 1) % slots.length]); } });
    };
    const parts = (c) => ({ desc: c.querySelector(".ev__text"), badges: c.querySelectorAll(".bdg__sq, .bdg__rd"), btn: c.querySelector(".bb") });
    const prepare = (c) => {
      const t = c.querySelector(".ev__title");
      if (t && !c.__split) {
        c.__split = new SplitText(t, { type: "lines", linesClass: "ev-line" });
        c.__split.lines.forEach((l) => { const m = Object.assign(document.createElement("div"), { className: "ev-mask" }); l.before(m); m.append(l); });
      }
      const { desc, badges, btn } = parts(c);
      if (c.__split) gsap.set(c.__split.lines, { yPercent: 110, rotation: 5, opacity: 0 });
      if (desc) gsap.set(desc, { y: 30, opacity: 0 });
      if (badges.length) gsap.set(badges, { yPercent: 120, rotation: 10, opacity: 0 });
      if (btn) gsap.set(btn, { y: 30, opacity: 0 });
    };
    const revert = (c) => {
      if (!c.__split) return;
      const masks = [...c.querySelectorAll(".ev-mask")];
      c.__split.revert();
      masks.forEach((m) => m.isConnected && m.replaceWith(...m.childNodes));
      delete c.__split;
    };
    const into = (c) => {
      const { desc, badges, btn } = parts(c), tl = gsap.timeline();
      if (badges.length) tl.to(badges, { yPercent: 0, rotation: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power4.out", force3D: true }, 0);
      if (c.__split) tl.to(c.__split.lines, { yPercent: 0, rotation: 0, opacity: 1, duration: 1.4, stagger: 0.1, ease: "power4.out", force3D: true }, 0.1);
      if (desc) tl.to(desc, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.4);
      if (btn) tl.to(btn, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.6);
      return tl;
    };
    const out = (c) => {
      const { desc, badges, btn } = parts(c), tl = gsap.timeline();
      if (c.__split) tl.to(c.__split.lines, { yPercent: -110, rotation: -2, opacity: 0, duration: 0.6, ease: "power3.in" }, 0);
      const rest = [desc, ...badges, btn].filter(Boolean);
      if (rest.length) tl.to(rest, { y: -20, opacity: 0, duration: 0.5, ease: "power3.in" }, 0.1);
      tl.eventCallback("onComplete", () => revert(c));
      return tl;
    };
    const go = (slot) => {
      if (busy || slot.classList.contains("is-active")) return;
      const next = g.querySelector("#" + slot.dataset.target), cur = g.querySelector(".ev__content.is-active");
      if (!next || !cur) return;
      busy = true;
      timer?.pause();
      slots.forEach((s) => s.classList.remove("is-active"));
      slot.classList.add("is-active");
      const i = slots.indexOf(slot);
      out(cur).eventCallback("onComplete", () => {
        revert(cur);
        cur.classList.remove("is-active");
        next.classList.add("is-active");
        prepare(next);
        busy = false;
        into(next).eventCallback("onComplete", () => progress(i));
      });
    };
    slots.forEach((s) => k.on(s, "click", () => go(s)));
    const active = g.querySelector(".ev__content.is-active");
    const first = Math.max(0, slots.findIndex((s) => s.classList.contains("is-active")));
    if (active) prepare(active);
    const st = ScrollTrigger.create({ trigger: g, start: "top 85%", once: true, onEnter: () => active && into(active).eventCallback("onComplete", () => progress(first)) });
    k.add(() => { st.kill(); timer?.kill(); contents.forEach(revert); g.querySelectorAll(".ev__progress").forEach((p) => p.remove()); });
  };

  // People card: each frame moves left by dt/10 px (wraps at half width, .5s power3), follows the hand when dragged and tilts the card by drag speed ×.002 over .8s power3
  const team = (root, k) => {
    const track = root.querySelector("[data-team-track]");
    const cards = track ? track.querySelectorAll("[data-team-card]") : [];
    if (!cards.length) return;
    let n = 0;
    const half = track.clientWidth / 2;
    cards.forEach((c, i) => { c.style.position = "relative"; c.style.zIndex = cards.length - i; });
    const wrap = gsap.utils.wrap(-half, 0);
    const moveX = gsap.quickTo(track, "x", { duration: 0.5, modifiers: { x: gsap.utils.unitize(wrap) }, ease: "power3" });
    const tilt = gsap.quickTo(cards, "rotation", { duration: 0.8, ease: "power3" });
    const obs = Observer.create({ target: track, type: "pointer,touch", onDrag: (e) => { n += e.deltaX; tilt(0.002 * e.velocityX); }, onRelease: () => tilt(0), onStop: () => tilt(0) });
    const tick = (t, dt) => { n -= dt / 10; moveX(n); };
    gsap.ticker.add(tick);
    k.add(() => { gsap.ticker.remove(tick); obs.kill(); gsap.set(track, { clearProps: "transform" }); gsap.set(cards, { clearProps: "transform" }); });
  };

  TDS.page("home", (root, { k, reduce }) => {
    if (reduce) return;
    trail(root, k);
    words(root, k);
    gallery(root, k);
    team(root, k);
  }, prep);
})();
