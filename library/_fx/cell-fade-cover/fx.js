// On page change, splits the screen into a cell grid (about 100px cells on wide screens, 50px on narrow), turns each cell on in random order in .1s to cover, and
// Turned off and lifted the same way (spread .3s, .3s delay, power2.inOut). The backdrop curtain behind the cells fills and drains in .3s with the same delay.
// nav: off means links aren’t intercepted, and the caller fires fx:cover / fx:uncover events (detail.done) on the element to move only the curtain — use with a transition tool like barba.
(() => {
  kfFx.register("cell-fade-cover", (el, { options, reduce }) => {
    const KEY = "kf-fx-cell-fade-cover";
    const nav = options.nav !== "off";
    const cell = +options.cell || 100, cellM = +options["cell-m"] || 50, narrow = +options.narrow || 1024;
    const delay = +(options.delay ?? 0.3), spread = +(options.spread ?? 0.3), each = +(options.each ?? 0.1), fade = +(options.fade ?? 0.3);
    const ease = options.ease || "power2.inOut";
    const ac = new AbortController(), signal = ac.signal;

    el.classList.add("fx-cell-cover");
    el.setAttribute("aria-hidden", "true");
    const bg = document.createElement("div");
    bg.className = "fx-cell-cover__bg";
    const grid = document.createElement("div");
    grid.className = "fx-cell-cover__grid";
    el.append(bg, grid);

    let cols = 0, rows = 0, tl = null;
    const build = () => {
      const size = innerWidth > narrow ? cell : cellM;
      // Like the original, rows are counted by column count before rounding up (15×9 at 1440×900)
      const c = Math.ceil(innerWidth / size), r = Math.ceil(innerHeight / size);
      if (c === cols && r === rows) return;
      cols = c;
      rows = r;
      grid.style.gridTemplateColumns = `repeat(${c}, 1fr)`;
      grid.style.gridTemplateRows = `repeat(${r}, 1fr)`;
      grid.replaceChildren(...Array.from({ length: c * r }, () => document.createElement("div")));
    };
    build();
    addEventListener("resize", build, { signal });

    const cells = () => grid.children;
    const run = (to, done) => {
      tl?.kill();
      gsap.set(el, { visibility: "visible" });
      if (reduce) {
        gsap.set(bg, { opacity: to });
        gsap.set(cells(), { opacity: to });
        if (!to) gsap.set(el, { visibility: "hidden" });
        done?.();
        return;
      }
      tl = gsap.timeline({ onComplete: () => { if (!to) gsap.set(el, { visibility: "hidden" }); done?.(); } })
        .to(bg, { opacity: to, duration: fade, ease, delay }, 0)
        .to(cells(), { opacity: to, duration: each, ease, delay, stagger: { amount: spread, from: "random" } }, 0);
    };
    const onCover = (e) => run(1, e.detail?.done);
    const onUncover = (e) => run(0, e.detail?.done);
    el.addEventListener("fx:cover", onCover, { signal });
    el.addEventListener("fx:uncover", onUncover, { signal });

    if (nav) {
      if (sessionStorage.getItem(KEY) === "1") {
        sessionStorage.removeItem(KEY);
        gsap.set([bg, ...cells()], { opacity: 1 });
        gsap.set(el, { visibility: "visible" });
        requestAnimationFrame(() => run(0));
      }
      document.addEventListener("click", (e) => {
        const a = e.target.closest?.("a[href]");
        if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
        e.preventDefault();
        run(1, () => { sessionStorage.setItem(KEY, "1"); location.href = url.href; });
      }, { signal });
    }

    return () => {
      ac.abort();
      tl?.kill();
      bg.remove();
      grid.remove();
      el.classList.remove("fx-cell-cover");
      gsap.set(el, { clearProps: "visibility" });
    };
  });
})();
