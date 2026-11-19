// First-visit loader — the logo mark’s lines start drawing (4.5s) rotated ±90° at 10× size so they cover the screen, shrink to 0.5× (2.925s, 1.125s later), and straighten up right away (2.7s, 1.35s later),
// At 4.5s the panel opens toward the wordmark (1.5s). At 7.2s the cover lifts: background .3s, two petal clusters shrink to .5x and move aside (2s) and switch off at 1.75s.
// With a key, from the second visit in the same session the drawing is skipped and only the petals step aside — Brand (cookie mgn-isAlreadyIntroViewed)
(() => {
  // Four directions in which two petals move apart (original type1~4) — [start, end] x%, y%, scale, angle
  const PC = [
    [[[10, -50, 1, 0], [-15, -10, .5, -45]], [[-10, -50, 1, 0], [15, -90, .5, 45]]],
    [[[20, -50, 1, 45], [-5, -10, .5, 0]], [[-20, -50, 1, 45], [5, -90, .5, 90]]],
    [[[20, -50, 1, 90], [-5, -10, .5, 45]], [[-20, -50, 1, 90], [5, -90, .5, 135]]],
    [[[15, -50, 1, 135], [-10, -10, .5, 90]], [[-15, -50, 1, 135], [10, -90, .5, 180]]],
  ];
  const SP = [
    [[[0, 0, 1, 0], [20, -45, .5, -67.5]], [[0, 0, 1, 0], [-20, 45, .5, 67.5]]],
    [[[0, 0, 1, 45], [-20, -45, .5, -22.5]], [[0, 0, 1, 45], [20, 45, .5, 112.5]]],
    [[[0, 0, 1, 90], [20, -45, .5, 22.5]], [[0, 0, 1, 90], [-20, 45, .5, 157.5]]],
    [[[0, 0, 1, 135], [-20, -45, .5, 67.5]], [[0, 0, 1, 135], [20, 45, .5, 202.5]]],
  ];
  const pose = ([x, y, s, r]) => ({ xPercent: x, yPercent: y, scale: s, rotation: r });
  const pick = (v) => { const n = Math.round(+v); return n >= 1 && n <= 4 ? n - 1 : Math.floor(Math.random() * 4); };

  kfFx.register("mark-zoom-intro", (el, { options, reduce }) => {
    const bg = el.querySelector('[data-fx-part="bg"]');
    const veil = el.querySelector('[data-fx-part="veil"]');
    const petals = [...el.querySelectorAll('[data-fx-part="petal"]')];
    const logo = el.querySelector('[data-fx-part="logo"]');
    const set = el.querySelector('[data-fx-part="set"]');
    const mark = el.querySelector('[data-fx-part="mark"]');
    const paths = mark ? [...mark.querySelectorAll("path")] : [];
    // The original remembers via a session cookie and skips even in a new tab — where cookies don’t work, like file://, it uses tab storage
    const key = options.key ? `fx-mzi-${String(options.key).replace(/\W/g, "")}` : "";
    let seen = false;
    if (key) {
      seen = document.cookie.split("; ").includes(`${key}=1`);
      try { seen = seen || sessionStorage.getItem(key) === "1"; sessionStorage.setItem(key, "1"); } catch (e) { /* Windows with storage blocked use cookies only */ }
      document.cookie = `${key}=1; path=/; SameSite=Lax`;
    }

    const say = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    const timers = [];
    const later = (fn, s) => timers.push(setTimeout(fn, s * 1000));
    const hold = +(options.hold ?? 7.2);
    const settle = +(options.settle ?? 1.3);
    const sp = matchMedia("(max-width: 767px)").matches;
    const table = sp ? SP : PC;
    const petalType = table[pick(options.petal)];
    const turn = pick(options.turn) < 2 ? 90 : -90;
    const tl = gsap.timeline({ paused: true });
    const runs = [tl];

    petals.forEach((p, i) => gsap.set(p, pose(petalType[Math.min(i, 1)][0])));
    if (logo) gsap.set(logo, { xPercent: -50, yPercent: -50, rotation: seen ? 0 : turn });
    if (set) gsap.set(set, { xPercent: -50, yPercent: -50, scale: 10 });
    const lens = paths.map((p) => p.getTotalLength?.() || 0);
    paths.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i] }));
    el.classList.add("fx-ready");

    const open = () => {
      el.classList.add("fx-open");
      say("fx:open");
      if (reduce) { el.classList.add("fx-done"); say("fx:done"); return; }
      const o = gsap.timeline();
      if (logo) o.to(logo, { opacity: 0, duration: .5, ease: "none" }, .25);
      if (bg) o.to(bg, { opacity: 0, duration: .3, ease: "none" }, .1);
      petals.forEach((p, i) => o.to(p, { ...pose(petalType[Math.min(i, 1)][1]), duration: 2, ease: kfFx.ease("0.645,0.045,0.355,1", "power2.inOut") }, 0));
      if (veil) o.to(veil, { opacity: 0, duration: .25, ease: "none" }, 1.75);
      later(() => { el.classList.add("fx-done"); say("fx:done"); }, settle);
      runs.push(o);
    };

    if (reduce || seen || !set) {
      if (logo) gsap.set(logo, { opacity: 0 });
      requestAnimationFrame(() => requestAnimationFrame(open));
    } else {
      const ease = (c, f) => kfFx.ease(c, f);
      const openW = () => {
        const w = set.style.width;
        set.style.width = "max-content";
        const full = set.offsetWidth;
        set.style.width = w;
        return full;
      };
      // Original values are tuned to a 4.5s draw — if draw changes, the other stages are pulled in at the same ratio
      const k = +(options.draw ?? 4.5) / 4.5;
      if (paths.length) tl.to(paths, { strokeDashoffset: 0, duration: 4.5 * k, ease: ease("0.645,0.045,0.355,1", "power2.inOut") }, 0);
      tl.to(set, { scale: .5, duration: 2.925 * k, ease: ease("0.83,0,0.17,1", "expo.inOut") }, 1.125 * k);
      if (logo) tl.to(logo, { rotation: 0, duration: 2.7 * k, ease: ease("0.77,0,0.175,1", "power4.inOut") }, 1.35 * k);
      tl.to(set, { width: openW, duration: 1.5 * k, ease: ease("0.77,0,0.175,1", "power4.inOut") }, 4.5 * k);
      later(() => tl.play(0), +(options.delay ?? .2));
      later(open, +(options.delay ?? .2) + hold);
    }

    return () => {
      timers.forEach(clearTimeout);
      runs.forEach((t) => t.kill());
      const parts = [bg, veil, logo, set, ...petals, ...paths].filter(Boolean);
      if (parts.length) gsap.set(parts, { clearProps: "all" });
      el.classList.remove("fx-open", "fx-done", "fx-ready");
    };
  });
})();
