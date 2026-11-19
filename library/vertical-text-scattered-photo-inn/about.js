// Name strip — original autoScrollSlider: duplicates the strip to over 3 screens wide, moves left 0.5px per frame, and returns to 0 once past one set’s width. Dragging continues the flow from that spot
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const md = matchMedia("(min-width: 782px)");
  document.querySelectorAll("[data-auto-scroll]").forEach((wrap) => {
    const body = wrap.querySelector(".ab-marquee__body");
    if (!body || reduce) return;
    const speed = +(body.dataset.speed ?? 1);
    const kids = [...body.children];
    const n = kids.length;
    const html = kids.map((k) => { const c = k.cloneNode(true); c.classList.add("is-clone"); c.setAttribute("aria-hidden", "true"); return c.outerHTML; }).join("");
    let w = 0, copies = 1, x = 0, raf = 0, inView = false, drag = false, startX = 0, baseX = 0, left = false;
    const measure = () => {
      w = 0;
      for (let i = 0; i < n; i++) { const s = getComputedStyle(body.children[i]); w += parseFloat(s.width) + parseFloat(s.marginRight); }
      for (let total = w * copies; copies < 3 || total < innerWidth * 3; total = w * copies) { body.insertAdjacentHTML(copies % 2 ? "afterbegin" : "beforeend", html); copies++; }
      w = Math.ceil(w * 10) / 10;
      body.style.marginLeft = -w + "px";
    };
    measure();
    const frame = () => {
      if (!md.matches) return;
      if (x <= -w) x = 0;
      body.style.transform = `translateX(${x}px)`;
      x -= speed;
      raf = requestAnimationFrame(frame);
    };
    const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    const down = (e) => { e.preventDefault(); startX = e.pageX; body.classList.add("is-drag"); drag = true; cancelAnimationFrame(raf); baseX = new DOMMatrix(getComputedStyle(body).transform).m41; };
    const move = (e) => { if (!drag) return; e.preventDefault(); const d = startX - e.pageX; left = d < 0; raf = requestAnimationFrame(() => { x = baseX - d; body.style.transform = `translateX(${x}px)`; }); };
    const up = () => {
      if (!drag) return;
      body.classList.remove("is-drag");
      drag = false;
      if (!left && -x >= w) x = w + x; else if (left && x >= 0) x = -(w - x);
      body.style.transform = `translateX(${x}px)`;
      if (inView) run();
    };
    wrap.addEventListener("mousedown", down);
    wrap.addEventListener("mousemove", move);
    wrap.addEventListener("mouseup", up);
    wrap.addEventListener("mouseleave", up);
    new IntersectionObserver((es) => es.forEach((e) => { inView = e.isIntersecting; if (inView) run(); else cancelAnimationFrame(raf); })).observe(wrap);
    new ResizeObserver(() => { measure(); if (inView) run(); }).observe(body.firstElementChild);
    md.addEventListener("change", () => { if (md.matches && inView) run(); });
  });
})();
