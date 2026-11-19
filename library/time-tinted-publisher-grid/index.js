// Home — current time clock, book spread slick flow. The window house cover fly-out is the fly-out-cycle part
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [hh, mm, ss] = ["is-h", "is-m", "is-s"].map((c) => document.querySelector(`.yv-fv__clock .${c}`));
  const tick = () => {
    const d = new Date(), s = d.getSeconds(), m = d.getMinutes(), h = d.getHours();
    ss.style.transform = `rotate(${(s / 60) * 360 - 90}deg)`;
    mm.style.transform = `rotate(${(m / 60) * 360 + (s / 60) * 6 - 90}deg)`;
    hh.style.transform = `rotate(${(h / 12) * 360 + (m / 60) * 30 - 90}deg)`;
  };
  tick();
  setInterval(tick, 1000);

  // Same settings as the original slick 1.8.1 — no pause (autoplaySpeed 0), moving one slot in 5s linear so it flows endlessly
  if (window.jQuery && jQuery.fn.slick) {
    jQuery(".yv-book__strip").each(function () {
      jQuery(this).slick({
        autoplay: !reduce, autoplaySpeed: 0, speed: 5000, cssEase: "linear", swipe: false, arrows: false,
        pauseOnFocus: false, pauseOnHover: false, variableWidth: true, accessibility: false,
      });
    });
  }
})();
