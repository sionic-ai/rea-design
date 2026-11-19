// ENTRY motion. Values taken from the ENTRY class of the original bundle — icon plate: one row (odd) per 181px of screen height × 8 columns, middle four left empty,
// Within 400px of the cursor it is 1+2.5×closeness times larger. Every 5s (floor panel 3s) it closes for .3s and reopens with a different face. Card: bar widths [1,1,1,1,2,2,1,1]×10%,
// Entering .2~.45s (delay 0~.2, power4|power2.out), leaving .2~.45s (power4|power2.inOut), on phones a card opens when its top edge is within the upper 70% of the screen.
// Two description lines: from 5° · 120% below into place (1s, .3 difference, sine.out), scrubbed over the range from 5% to 50% above the bottom of the screen.
(function () {
  const { $, $$, isSP, px, r, shuffle, lenis, reduced } = ZK;

  // Original getIconType·getBgType: shuffle the 31 faces and the three plate colors separately, hand them out in order, reshuffle when used up
  const dealer = (n) => { let deck = []; return () => { if (!deck.length) deck = shuffle(Array.from({ length: n }, (_, i) => i + 1)); return deck.shift(); }; };

  function iconBoard(host, period) {
    const face = dealer(31), bg = dealer(3);
    let icons = [], calls = [], loop;
    const deal = (el) => { el.dataset.bg = bg(); el.firstChild.dataset.seed = 300 + face(); ZArt.paintArt(el); };
    const build = (count, hidden = []) => {
      host.innerHTML = "";
      icons = Array.from({ length: count }, (_, i) => {
        const el = document.createElement("div");
        el.className = "e-icon";
        el.innerHTML = '<div data-art="icon"></div>';
        if (hidden.includes(i)) el.style.visibility = "hidden";
        host.appendChild(el);
        return el;
      });
      icons.forEach(deal);
    };
    const change = () => {
      calls.forEach((c) => c.kill());
      icons.forEach((el) => el.classList.add("is-hide"));
      calls = [gsap.delayedCall(0.3, () => icons.forEach((el) => { deal(el); el.classList.remove("is-hide"); }))];
    };
    const start = () => { stop(); if (reduced) return; loop = gsap.delayedCall(period, function tick() { change(); loop = gsap.delayedCall(period, tick); }); };
    const stop = () => { loop && loop.kill(); loop = null; };
    return { build, start, stop, get icons() { return icons; } };
  }

  function kvIcons() {
    const kv = $(".e-kv"), body = $(".e-body"), board = iconBoard($(".e-icons--kv"), 5);
    let rows = 0, live = false;
    const layout = () => {
      if (isSP()) { if (rows !== -1) { rows = -1; board.build(25, [11, 12, 13]); $(".e-icons--kv").style.height = ""; } return; }
      let e = Math.floor(innerHeight / px(181));
      if (e % 2 === 0) e += 1;
      if (rows === e) return;
      rows = e;
      const n = e * 4;
      board.build(e * 8, [n - 2, n - 1, n, n + 1]);
      $(".e-icons--kv").style.height = `${px((e - 1) * 149 + e * 32)}px`;
    };
    layout();
    addEventListener("resize", layout);
    // When the top edge of the body panel passes the top edge of the screen, hides the KV and stops face swapping and cursor reaction (original rootMargin 0 0 -100% 0)
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { if (e.boundingClientRect.top <= 0) { kv.classList.add("is-covered"); board.stop(); live = false; } }
      else if (e.boundingClientRect.top > 0) { kv.classList.remove("is-covered"); board.start(); live = true; }
    }), { rootMargin: "0% 0% -100% 0%", threshold: 0 }).observe(body);
    addEventListener("mousemove", (ev) => {
      if (!live || isSP() || reduced) return;
      board.icons.forEach((el) => {
        const b = el.getBoundingClientRect();
        const d = Math.hypot(ev.clientX - (b.left + b.width * 0.5), ev.clientY - (b.top + b.height * 0.5));
        el.style.transform = `scale(${1 + Math.max(0, (400 - d) / 400) * 2.5})`;
      });
    });
  }

  function bottomIcons() {
    const foot = $(".z-ftypo"), inner = $(".e-body__in"), board = iconBoard($(".e-icons--bottom"), 3);
    const layout = () => board.build(isSP() ? 24 : 20);
    layout();
    let sp = isSP();
    addEventListener("resize", () => { if (isSP() !== sp) { sp = isSP(); layout(); } });
    // When the body panel’s bottom edge rises above the screen’s bottom edge, the bottom panel is revealed and the face changes every 3 seconds (original rootMargin -100% 0 0 0)
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { if (e.boundingClientRect.top <= 0) board.stop(); }
      else if (!(e.boundingClientRect.top > 0 && e.intersectionRatio === 0)) { board.start(); fitBottom(); }
    }), { rootMargin: "-100% 0% 0% 0%", threshold: 0 }).observe(inner);
    // The floor panel starts hidden so the shared letter-width fitting cannot measure — when revealed, the whole group of four is fitted to the original width
    const h3 = $(".e-bottom h3");
    function fitBottom() {
      const target = Number(isSP() ? h3.dataset.spanFitSp : h3.dataset.spanFit);
      const span = h3.firstElementChild, w = span && span.offsetWidth;
      if (w && target) h3.style.transform = `scaleX(${px(target) / w})`;
    }
    new MutationObserver(fitBottom).observe(foot, { attributes: true, attributeFilter: ["class"] });
    addEventListener("resize", fitBottom);
  }

  function cards() {
    $$(".e-item").forEach((item) => {
      const thumb = $(".e-item__thumb", item), svg = $(".e-item__bg svg", item), rects = $$("rect", svg);
      const size = () => { const b = thumb.getBoundingClientRect(); svg.setAttribute("width", b.width); svg.setAttribute("height", b.height); svg.setAttribute("viewBox", `0 0 ${b.width} ${b.height}`); };
      const enter = () => {
        const mul = shuffle([1, 1, 1, 1, 2, 2, 1, 1]);
        let x = 0;
        rects.forEach((rc, i) => { gsap.killTweensOf(rc); const w = mul[i] * 10; rc.setAttribute("width", `${w + 0.05}%`); rc.setAttribute("x", `${x}%`); x += w; });
        rects.forEach((rc) => gsap.fromTo(rc, { attr: { y: isSP() ? "105%" : "103%" } }, { duration: r(0.2, 0.45), delay: r(0, 0.2), ease: Math.random() > 0.5 ? "power4.out" : "power2.out", attr: { y: "0%" } }));
      };
      const leave = () => rects.forEach((rc) => { gsap.killTweensOf(rc); gsap.to(rc, { duration: r(0.2, 0.45), ease: Math.random() > 0.5 ? "power4.inOut" : "power2.inOut", attr: { y: isSP() ? "-105%" : "-103%" } }); });
      const open = () => { if (item.classList.contains("is-open")) return; item.classList.add("is-open"); enter(); };
      const close = () => { if (!item.classList.contains("is-open")) return; item.classList.remove("is-open"); leave(); };
      if (matchMedia("(any-hover: hover)").matches) {
        item.addEventListener("mouseenter", () => !isSP() && open());
        item.addEventListener("mouseleave", () => !isSP() && close());
      }
      const scroll = () => { if (!isSP()) return; const p = Math.min(1, Math.max(0, thumb.getBoundingClientRect().top / innerHeight)); p > 0 && p < 0.7 ? open() : close(); };
      // The original UP also opens only on scroll — on the hero it stays closed even if a lower card crosses the 70% line
      size();
      lenis.on("scroll", scroll);
      addEventListener("resize", size);
    });
  }

  function desc() {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const lines = $$(".e-desc i");
      // If gsap reads the CSS starting position (translate 120%) as y px, it stays shifted down that much even after finishing — y is pinned to 0
      const tw = gsap.fromTo(lines, { y: 0, rotation: 5, yPercent: 120 }, { duration: 1, rotation: 0, yPercent: 0, stagger: 0.3, ease: "sine.out", paused: true });
      ScrollTrigger.create({ trigger: ".e-desc", start: "top bottom-=5%", end: "top bottom-=50%", scrub: true, invalidateOnRefresh: true, onUpdate: (st) => tw.progress(st.progress) });
      return () => { tw.progress(1).kill(); };
    });
  }

  ZK.ready(() => {
    kvIcons();
    bottomIcons();
    cards();
    desc();
  });
})();
