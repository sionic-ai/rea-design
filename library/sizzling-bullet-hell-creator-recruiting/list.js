// CREATORS motion. Bar start height 83~88% · length .65~1 (linear) · tab bar 1.85 screens sine.inOut · the attach point .85 are values from the original bundle.
(function () {
  const { $, $$, isSP, px, lenis, shuffle, inview, reduced } = ZK;

  ZK.ready(() => {
    const lines = $(".l-lines"), tabs = $(".l-tabs"), b1 = $('[data-block="1"]'), b2 = $('[data-block="2"]'), bottom = $(".z-lines-bottom");
    lines.innerHTML = `<svg preserveAspectRatio="none"><g>${'<rect y="100%" height="200%"/>'.repeat(8)}</g></svg>`;
    const svg = $("svg", lines), rects = $$("rect", lines);
    let tws = [], navTw;
    const setup = () => {
      const a = shuffle([1, 1, 2, 2]), b = shuffle([1, 1, 2, 2]);
      const u = 116.66666667 / 1440 * 100, edge = 20 / 1440 * 100;
      let x = 0;
      rects.forEach((rc, i) => { let w = (i < 4 ? a[i] : b[i - 4]) * u; if (i === 0 || i === 7) w += edge; rc.setAttribute("x", `${x}%`); rc.setAttribute("width", `${w + 0.02}%`); x += w; });
      const from = shuffle([88, 85, 84, 83, 86.5, 85.5, 84.5, 83.5]), durs = shuffle([0.65, 0.7, 0.78, 0.83, 0.87, 0.92, 0.95, 1]);
      tws.forEach((t) => t.kill());
      tws = rects.map((rc, i) => { rc._v = { per: from[i] }; return gsap.timeline({ paused: true }).fromTo(rc._v, { per: from[i] }, { duration: durs[i], ease: "none", per: 0 }); });
      navTw && navTw.kill();
      navTw = isSP() ? null : gsap.fromTo(tabs, { top: () => innerHeight - px(105) }, { duration: 1, ease: "sine.inOut", top: 0, paused: true });
      svg.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
    };
    const scroll = () => {
      const wh = innerHeight, sy = scrollY;
      const e = reduced ? 1 : Math.min(1, sy / wh);
      rects.forEach((rc, i) => { tws[i].progress(e / tws[i].duration()); rc.setAttribute("y", `${rc._v.per}%`); });
      const n = reduced ? 1 : Math.min(1, sy / (wh * 1.85));
      if (navTw) { navTw.progress(n); tabs.classList.toggle("is-fixed", n > 0.85); }
      else tabs.classList.toggle("is-fixed", tabs.getBoundingClientRect().top <= 0);
      lines.classList.toggle("is-fixed", b1.getBoundingClientRect().top <= 0);
      const second = b2.getBoundingClientRect().top <= tabs.offsetHeight + 1;
      tabs.children[0].children[0].classList.toggle("is-current", !second);
      tabs.children[0].children[1].classList.toggle("is-current", second);
      tabs.classList.toggle("is-hide", bottom.getBoundingClientRect().top < wh * 0.9);
    };
    setup(); scroll();
    lenis.on("scroll", scroll);
    addEventListener("resize", () => { setup(); scroll(); });
    inview(".l-lead", { margin: "0% 0% -10% 0%" });
  });
})();
