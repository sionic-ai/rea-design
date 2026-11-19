// Home page mechanism — each time you navigate shared.js calls mkPage.index() again and calls the returned release function before navigating
(() => {
  window.mkPage = window.mkPage || {};
  window.mkPage.index = () => {
    const { ticks, follow, reduce } = window.mk;
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => [...document.querySelectorAll(s)];
    const offs = [];
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const on = (el, ev, f, o) => { el.addEventListener(ev, f, o); offs.push(() => el.removeEventListener(ev, f, o)); };

    // Hero entrance — the letter index (--r) gives the spring stagger, and the intro · buttons · cards use 950ms cubic-bezier(.34,1.45,.6,1) at 260 + 90ms steps (original hero reveal)
    $$(".mk-hero__title .mk-hero__c").forEach((c, i) => c.style.setProperty("--r", i));
    // The original holds the hero until fonts and data arrive (about 1.85s), then builds text → intro · cards → buttons in order (in a 3s capture the buttons aren’t there yet)
    if (!reduce) [[".mk-hero__intro", 260], [".mk-hero__card", 350], [".mk-hero__btns", 1350]].forEach(([s, t]) => {
      const el = $(s);
      el && el.animate([{ transform: "translateY(40%) scale(.9)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 950, delay: 1850 + t, easing: "cubic-bezier(.34,1.45,.6,1)", fill: "backwards" });
    });

    // Card — tilts rotateY ±8° (16 × (x − .5)) and rotateX ±6° (12 × (.5 − y)) by hand position, ±4° (phone 9°) by scroll speed, settling at .94 per frame and following at .1
    const card = $(".mk-hero__card");
    if (card && !reduce) {
      if (fine) {
        on(card, "pointermove", (e) => {
          const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          card.style.setProperty("--ry", `${(16 * (x - 0.5)).toFixed(2)}deg`);
          card.style.setProperty("--rx", `${(12 * (0.5 - y)).toFixed(2)}deg`);
        });
        on(card, "pointerleave", () => { card.style.removeProperty("--rx"); card.style.removeProperty("--ry"); });
      }
      let lastY = scrollY, push = 0, rd = 0;
      const tick = () => {
        const k = scrollY - lastY;
        lastY = scrollY;
        push = Math.abs(k) > 0.4 ? (k > 0 ? -1 : 1) * (innerWidth < 768 ? 9 : 4) : push * 0.94;
        rd += follow(0.1) * (push - rd);
        card.style.setProperty("--rd", `${rd.toFixed(2)}deg`);
      };
      ticks.add(tick);
      offs.push(() => ticks.delete(tick));
    }

    // Second-line letters — within 2.2 times the letter width of the cursor horizontally, they tilt up to 9° away from the cursor and rise 7%
    const l2 = $(".mk-hero__l2");
    if (l2 && fine && !reduce) {
      const cs = $$(".mk-hero__c");
      on(l2, "pointermove", (e) => cs.forEach((c) => {
        const r = c.getBoundingClientRect(), a = (e.clientX - (r.left + r.width / 2)) / Math.max(1, r.width), i = Math.max(0, 1 - Math.abs(a) / 2.2);
        c.style.transform = i > 0.01 ? `rotate(${(-(a < 0 ? -1 : 1) * i * 9).toFixed(1)}deg) translateY(${(7 * -i).toFixed(1)}%)` : "";
      }));
      on(l2, "pointerleave", () => cs.forEach((c) => (c.style.transform = "")));
    }

    // Clock — current time of the placeholder city
    const clock = $("[data-clock]");
    if (clock) {
      const set = () => (clock.textContent = new Date().toTimeString().slice(0, 5));
      set();
      const id = setInterval(set, 15000);
      offs.push(() => clearInterval(id));
    }

    // Service rows — the photo of the hovered row floats at the lower right of the cursor and follows at .12
    const float = $(".mk-sg__float");
    if (float && fine && !reduce) {
      let tx = 0, ty = 0, x = 0, y = 0;
      $$(".mk-sg__row").forEach((row) => {
        on(row, "pointerenter", () => float.classList.add("is-on"));
        on(row, "pointerleave", () => float.classList.remove("is-on"));
      });
      on(window, "pointermove", (e) => { tx = e.clientX + 24; ty = e.clientY + 24; });
      const tick = () => { x += (tx - x) * follow(0.12); y += (ty - y) * follow(0.12); float.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; };
      ticks.add(tick);
      offs.push(() => ticks.delete(tick));
    }

    // Logo shapes — each floats on its own cycle
    if (!reduce) {
      const tw = $$(".mk-partners__logo").map((l, i) => gsap.to(l, { y: (i % 2 ? -1 : 1) * 16, rotate: (i % 3 - 1) * 6, duration: 3 + (i % 4) * 0.6, ease: "sine.inOut", yoyo: true, repeat: -1 }));
      offs.push(() => tw.forEach((t) => t.kill()));
    }

    // Process map — pressing a node shows that step’s card
    const nodes = $$(".mk-pmap__node"), cards = $$(".mk-pmap__card");
    nodes.forEach((n, i) => on(n, "click", () => {
      nodes.forEach((m, k) => m.classList.toggle("is-on", k === i));
      cards.forEach((c, k) => c.classList.toggle("is-on", k === i));
    }));

    return () => offs.forEach((f) => f());
  };
})();
