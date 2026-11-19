// Cover cards are swapped one at a time with sharp cuts (no motion between), and at the set tempo the page’s falling panel descends from above and settles, and the dark photos and header light up.
// Falling plates and things to turn on are page-side elements, so they come via the option’s css, without them only the card is shot and it ends.
(() => {
  const parseHold = (s) => Object.fromEntries(String(s || "").split(",").map((p) => p.split("=").map((x) => x.trim())).filter(([k, v]) => k !== "" && v !== undefined && !isNaN(+k) && !isNaN(+v)).map(([k, v]) => [+k, +v]));
  kfFx.register("flick-cards-loader", (el, { options, reduce }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    const pick = (sel) => (sel ? [...document.querySelectorAll(sel)] : []);
    const drops = pick(options.drop), darks = pick(options.dark), shows = pick(options.show);
    const done = () => { el.classList.remove("is-on"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    // If a once name exists, it runs once per session under that name — the second open is already in the finished state
    const key = options.once === "none" ? "" : `fx-flick-cards-loader:${options.once || "page"}`;
    if (reduce || !cards.length || (key && sessionStorage.getItem(key))) { done(); return () => {}; }
    if (key) sessionStorage.setItem(key, 1);
    const each = +(options.each ?? 0.1), hold = parseHold(options.hold ?? "7=.4,14=.8");
    const at = +(options.at ?? 4), dur = +(options.dur ?? 0.3), lag = +(options.lag ?? 0.7);
    const ease = kfFx.ease(options.ease || "0.22,0.61,0.35,1", "power2.out");
    el.classList.add("is-on");
    cards.at(-1).classList.add("fx-last");
    gsap.set(cards, { opacity: 0 });
    if (shows.length) gsap.set(shows, { opacity: 0 });
    // A falling board is placed above by its own height plus the distance to the board top — so it hides just above the screen.
    // Measured by layout values (offset): if the panel has translate or transform (slide-transition css etc.), the screen box loses height and hides less.
    const layoutTop = (n) => { let t = 0; for (let e = n; e; e = e.offsetParent) t += e.offsetTop; return t - scrollY; };
    drops.forEach((d) => gsap.set(d, { y: -(d.offsetHeight + Math.max(0, layoutTop(d))) }));
    if (darks.length) gsap.set(darks, { filter: "brightness(0)" });
    const tl = gsap.timeline({ onComplete: done });
    let t = 0;
    cards.forEach((c, i) => {
      tl.set(c, { opacity: 1 }, t);
      t += hold[i] ?? each;
      if (i !== cards.length - 1) tl.set(c, { opacity: 0 }, t);
    });
    const drop = Math.max(at, t);
    if (drops.length) tl.to(drops, { y: 0, duration: dur, ease }, drop);
    if (darks.length) tl.to(darks, { filter: "brightness(1)", duration: dur, ease }, drop + lag);
    if (shows.length) tl.to(shows, { opacity: 1, duration: dur, ease }, drop + lag);
    tl.set({}, {}, drop + lag + dur);
    return () => {
      tl.kill();
      gsap.set([...cards, ...drops, ...darks, ...shows], { clearProps: "opacity,transform,filter" });
      el.classList.remove("is-on");
      cards.at(-1).classList.remove("fx-last");
    };
  });
})();
