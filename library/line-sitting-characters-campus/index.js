// First page: pickup slider in a semicircle panel (Splide — original options as is), a ring outline drawn per dot, an arch-window photo strip, and semicircle text around the edge.
// Original values (original defaults autoWidth·autoHeight·focus 0·omitEnd kept as is): loop · speed 790ms · interval 5150ms · gap 60px · easing cubic-bezier(.23,1,.32,1) · autoplay when visible, stops when out of view · pauses on hover and focus.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.getElementById("hm-pickup");
  if (root && window.Splide) {
    const arrows = document.createElement("div");
    arrows.className = "splide__arrows";
    arrows.innerHTML = `<button class="splide__arrow splide__arrow--prev" type="button" aria-label="Previous">${BC.icon.prev}</button><button class="splide__arrow splide__arrow--next" type="button" aria-label="Next">${BC.icon.next}</button>`;
    root.prepend(arrows);
    const pg = document.createElement("ul");
    pg.className = "splide__pagination";
    root.querySelector(".hm-slider__controls").prepend(pg);
    const SPEED = 790, INTERVAL = 5150;
    const sp = new Splide(root, {
      type: "loop",
      autoWidth: true,
      autoHeight: true,
      focus: 0,
      omitEnd: true,
      autoplay: "pause",
      speed: SPEED,
      interval: INTERVAL,
      gap: "60px",
      drag: true,
      pauseOnHover: true,
      pauseOnFocus: true,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
      reducedMotion: { autoplay: true, speed: SPEED },
      intersection: { inView: { autoplay: true }, outView: { autoplay: false } },
    });
    // Each dot has a 17px diameter ring outline — the current dot’s ring is drawn straight for (gap − transition/2) and erased over the transition length at (gap − transition)
    sp.on("pagination:mounted", (data) => {
      data.list.style.setProperty("--interval", `${INTERVAL}ms`);
      data.list.style.setProperty("--speed", `${SPEED}ms`);
      data.items.forEach((it) => it.li.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="10"/></svg>'));
    });
    sp.on("autoplay:play", () => sp.Components.Elements.pagination?.classList.add("is-playing"));
    sp.on("autoplay:pause", () => sp.Components.Elements.pagination?.classList.remove("is-playing"));
    const ext = window.splide?.Extensions?.Intersection ? { Intersection: window.splide.Extensions.Intersection } : {};
    // The original attaches this after load
    const mount = () => sp.mount(ext);
    if (document.readyState === "complete") mount();
    else addEventListener("load", mount, { once: true });
  }

  // Arched-window photo strip — windows stay put, a row of photos beyond the windows flows half a turn in 150 seconds (each window offsets the same strip by its own position)
  const arch = document.querySelector(".hm-fcl__arch");
  if (arch) {
    const labels = ["Facility photo · long wooden table and chairs · window daylight", "Facility photo · white sofa and round table · large window", "Facility photo · logo sign on the wall · glass door", "Facility photo · tall table and a row of chairs · afternoon light"];
    const strip = () => `<span>${labels.map((l) => `<span class="wf-img" data-label="${l}"></span>`).join("")}</span>`;
    const build = () => {
      arch.innerHTML = "";
      const w = arch.clientWidth;
      const unit = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const sizes = innerWidth <= 979 ? [5.5, 8.5] : [12.5, 18.5];
      let x = 0, i = 0;
      while (x < w) {
        const ww = sizes[i++ % 2] * unit;
        const win = document.createElement("span");
        win.className = "hm-fcl__win";
        win.style.width = `${ww}px`;
        win.innerHTML = `<span class="hm-fcl__strip" style="left:${-x}px">${strip()}${strip()}</span>`;
        arch.append(win);
        x += ww + 2 * unit;
      }
    };
    build();
    let rw = innerWidth;
    addEventListener("resize", () => { if (innerWidth !== rw) { rw = innerWidth; build(); } });
  }

  // Original u-inview — adds is-inview when visible, removes it when out (spinning and flowing only while visible)
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-inview", e.isIntersecting)));
  document.querySelectorAll(".hm-fac__circle, .hm-fcl__arch").forEach((el) => (reduce ? null : io.observe(el)));
})();
