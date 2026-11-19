// Home page: scrolling moves the gradient inside the greeting letters downward, skills strip flows (50px per second · pause button), two slick sliders.
// Original common.js — gradient spot = 100 − (scroll + screen .7 − greeting top) / greeting height × 100 (%) · strip = Elapsed ms × .05 px
(() => {
  const msg = document.querySelector(".mainmessage");
  const ticker = document.querySelector("[data-ticker]");
  const inner = ticker?.querySelector(".tech__inner");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seen = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  if (inner) inner.append(inner.firstElementChild.cloneNode(true));
  let tickOn = !reduce, off = 0, last = performance.now();
  document.querySelector('[data-pause="ticker"]')?.addEventListener("click", (e) => {
    tickOn = !tickOn;
    e.currentTarget.classList.toggle("is-paused", !tickOn);
    e.currentTarget.setAttribute("aria-label", tickOn ? "Flow Paused" : "Flow Play");
  });
  const frame = (now) => {
    const dt = Math.max(1, now - last) * 0.05;
    last = now;
    if (msg && seen(msg)) {
      const top = msg.getBoundingClientRect().top + scrollY;
      const y = Math.max(0, Math.min(100, 100 - ((scrollY + innerHeight * 0.7 - top) / msg.offsetHeight) * 100));
      msg.style.backgroundPositionY = `${y}%`;
    }
    if (inner && tickOn && seen(ticker)) {
      const half = inner.scrollWidth / 2;
      off += dt;
      if (off >= half) off = 0;
      inner.style.transform = `translate3d(-${off}px, 0, 0)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // Original slick settings: arrows, infinite, .5s ease-in-out, drag — employee voices show 2 slides on PC (original col1-2 cell count), 1 centered slide with 8% margin on phones
  if (window.jQuery && jQuery.fn.slick) {
    const base = { accessibility: true, autoplay: false, speed: 500, cssEase: "ease-in-out", swipe: true, arrows: true, pauseOnHover: true, infinite: true, responsive: [{ breakpoint: 768, settings: { slidesToShow: 1, centerMode: true, centerPadding: "8%", dots: false } }] };
    jQuery('[data-slick="voice"]').slick({ ...base, slidesToShow: 2 });
    jQuery('[data-slick="people"]').slick({ ...base, slidesToShow: 2 });
  }
})();
