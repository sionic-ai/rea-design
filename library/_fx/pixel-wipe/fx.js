// It has to go to the next page while covered, so leave a covered-and-left mark in sessionStorage, and the next page sees it and uncovers
(() => {
  kfFx.register("pixel-wipe", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const KEY = "kf-fx-pixel-wipe";
      // Defaults are the original values. For screens flipped often like apps, shorten them — the next page is called only after the cover fills, so navigation is delayed by cover + each × (rows − 1).
      // Takes cover separately from the wipe (dur), so with cover: 0 it doesn’t wait when leaving and wipes only on the arriving page
      const dur = +(options.dur ?? 0.7), each = +(options.each ?? 0.025), coverDur = +(options.cover ?? dur);
      const cover = document.createElement("div");
      cover.className = "fx-wipe";
      cover.setAttribute("aria-hidden", "true");
      document.body.append(cover);
      signal.addEventListener("abort", () => cover.remove());
      const build = () => {
        const n = innerWidth >= 1024 ? +options.cols || 16 : 6;
        const rows = Math.ceil(innerHeight / (innerWidth / n)) + 1;
        cover.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
        cover.innerHTML = Array.from({ length: n }, () => `<div class="col">${'<i class="cell"></i>'.repeat(rows)}</div>`).join("");
        cover.classList.add("is-on");
        return { cols: cover.querySelectorAll(".col"), cells: [...cover.querySelectorAll(".cell")] };
      };
      const coverIn = (done) => {
        if (!coverDur) return done();
        const { cols, cells } = build();
        gsap.timeline({ onComplete: done })
          .set(cols, { transformOrigin: "50% 100%" })
          .from(cols, { scaleY: 0, duration: coverDur, stagger: each, ease: "power2.inOut" })
          .from(gsap.utils.shuffle(cells), { autoAlpha: 0, stagger: (0.005 / cells.length) * 12, duration: coverDur, ease: "power2.inOut" }, "<");
      };
      const coverOut = () => {
        const { cols, cells } = build();
        gsap.timeline({ onComplete: () => { cover.classList.remove("is-on"); cover.innerHTML = ""; } })
          .set(cols, { transformOrigin: "50% 0%" })
          .to(gsap.utils.shuffle(cells), { autoAlpha: 0, stagger: (0.005 / cells.length) * 12, duration: dur, ease: "power2.inOut" })
          .to(cols, { scaleY: 0, duration: dur, stagger: each, ease: "power2.inOut" }, "<");
      };
      if (sessionStorage.getItem(KEY) === "1") { sessionStorage.removeItem(KEY); if (!reduce) coverOut(); }
      el.addEventListener("click", (e) => {
        const a = e.target.closest("a[href]");
        if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || url.href.split("#")[0] === location.href.split("#")[0]) return;
        e.preventDefault();
        sessionStorage.setItem(KEY, "1");
        coverIn(() => (location.href = url.href));
      }, { signal });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
