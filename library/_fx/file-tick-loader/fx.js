// Media loader — a 1px bar fills by the number of files received, a percent tag (000%) attached to the bar end follows it, and the name of the file just received changes on the line below.
// When full, the bar folds to the left end and the text drops down backwards, then the panel disappears and fires fx:done (also in the docs).
(() => {
  kfFx.register("file-tick-loader", (el, { options, reduce }) => {
    const bar = el.querySelector('[data-fx-part="bar"]');
    if (!bar || !window.gsap) return;
    const title = el.querySelector('[data-fx-part="title"]'), info = el.querySelector('[data-fx-part="info"]'), item = el.querySelector('[data-fx-part="item"]');
    const dur = +(options.dur ?? 0.85), max = +(options.max ?? 8), min = +(options.min ?? 0);
    const outQ = kfFx.ease("0.22,1,0.36,1", "power4.out"), io = kfFx.ease("0.83,0,0.17,1", "power4.inOut");
    // Put the text inside a line mask so it rises from below (160%)
    const wraps = [title, info, item].filter(Boolean).map((n) => {
      const inner = document.createElement("span");
      inner.className = "fx-ftl__in";
      while (n.firstChild) inner.appendChild(n.firstChild);
      n.appendChild(inner);
      n.classList.add("fx-ftl__line");
      return inner;
    });
    const track = document.createElement("i"), cur = document.createElement("span"), txt = document.createElement("b");
    track.className = "fx-ftl__track"; cur.className = "fx-ftl__cursor"; txt.className = "fx-ftl__pct";
    cur.appendChild(txt); bar.append(track, cur);
    const itemIn = item ? item.querySelector(".fx-ftl__in") : null;
    const listed = (options.files || "").split(",").map((s) => s.trim()).filter(Boolean);
    const media = [...document.querySelectorAll("img[src], video[src]")].filter((m) => !el.contains(m));
    const names = listed.length ? listed : media.map((m) => (m.currentSrc || m.src).split("/").pop().split(/[?#]/)[0]);
    const total = Math.max(1, names.length);
    const v = { value: 0 }, done = [];
    const paint = () => {
      gsap.set(track, { scaleX: v.value });
      gsap.set(cur, { left: `${v.value * 100}%`, xPercent: -100 * v.value, yPercent: -50 });
      txt.textContent = `${String(Math.round(v.value * 100)).padStart(3, "0")}%`;
      const i = Math.min(Math.floor(v.value * total), names.length - 1);
      if (itemIn && i >= 0 && names[i]) itemIn.textContent = names[i];
    };
    // The value follows for remaining share × 3 s (.6~2.5) with inOutQuint
    const to = (x, cap = 2.5) => gsap.to(v, { value: x, duration: gsap.utils.clamp(0.6, cap, (x - v.value) * 3), ease: io, overwrite: true, onUpdate: paint });
    paint();
    if (itemIn && names[0]) itemIn.textContent = names[0];
    const intro = gsap.timeline({ defaults: { duration: dur, ease: outQ }, paused: reduce });
    if (wraps.length) intro.from(wraps, { yPercent: 160, stagger: 0.1 }, 0);
    intro.from(bar, { scaleX: 0, transformOrigin: "left", ease: io }, 0)
      .from(cur, { scaleY: 0, ease: io }, 0)
      .from(txt, { scaleY: 2, yPercent: 100, ease: io }, 0);
    if (reduce) intro.progress(1);
    let alive = true, timer = 0;
    const wait = (s) => new Promise((r) => { timer = setTimeout(r, s * 1000); });
    const loadOf = (m) => new Promise((r) => {
      if ((m.complete && m.tagName === "IMG") || m.readyState >= 2) return r();
      m.addEventListener(m.tagName === "IMG" ? "load" : "loadeddata", r, { once: true });
      m.addEventListener("error", r, { once: true });
    });
    (async () => {
      const t0 = performance.now();
      const jobs = listed.length ? listed.map((n, i) => wait(0.25 + i * 0.35).then(() => n)) : media.map((m, i) => loadOf(m).then(() => names[i]));
      await Promise.race([
        Promise.all([document.fonts ? document.fonts.ready : null, ...jobs.map((j) => j.then((n) => { if (!alive) return; done.push(n); to(done.length / total); }))]),
        wait(max),
      ]);
      const left = min - (performance.now() - t0) / 1000;
      if (left > 0) await wait(left);
      if (!alive) return;
      await to(1, 1.6);
      if (!alive) return;
      gsap.to(track, { scale: 0, ease: io, transformOrigin: "left", duration: dur, delay: 0.1 });
      intro.reverse();
      await wait(intro.duration() + 0.2);
      if (!alive) return;
      gsap.set(el, { autoAlpha: 0, pointerEvents: "none" });
      el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    })();
    return () => {
      alive = false; clearTimeout(timer);
      intro.kill(); gsap.killTweensOf([v, track]);
      track.remove(); cur.remove();
      wraps.forEach((w) => { const p = w.parentNode; while (w.firstChild) p.insertBefore(w.firstChild, w); w.remove(); p.classList.remove("fx-ftl__line"); });
    };
  });
})();
