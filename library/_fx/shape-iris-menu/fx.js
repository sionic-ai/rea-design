(() => {
  // From the button position a flower-shaped SVG hole (clip-path) grows until it covers the four screen corners and the plate opens, and on close it shrinks back to the same spot.
  // Keep the shape coordinates as is and scale only with transform — redrawing clip-path with large coordinates hits the raster limit and stalls midway on some devices
  const FLOWER = "M39.17 75.23a30 30 0 1 0 60 0a30 30 0 1 0 -60 0zM38.17 35.27a31 31 0 1 0 62 0a31 31 0 1 0 -62 0zM70.21 55.25a31 31 0 1 0 62 0a31 31 0 1 0 -62 0zM70.21 95.21a31 31 0 1 0 62 0a31 31 0 1 0 -62 0zM38.17 115.19a31 31 0 1 0 62 0a31 31 0 1 0 -62 0zM6.13 95.21a31 31 0 1 0 62 0a31 31 0 1 0 -62 0zM6.13 55.25a31 31 0 1 0 62 0a31 31 0 1 0 -62 0z";
  const NS = "http://www.w3.org/2000/svg";
  let seq = 0;
  const curve = (s, d) => (s ? (s.includes(",") ? `cubic-bezier(${s})` : s) : d);

  kfFx.register("shape-iris-menu", (el, { options, reduce }) => {
    const trigger = el.querySelector('[data-fx-part="trigger"]');
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!trigger || !panel) return;
    const d = el.querySelector('[data-fx-part="shape"]')?.getAttribute("d") || FLOWER;
    const openDur = +(options.open ?? 0.6), closeDur = +(options.close ?? 0.6);
    const openEase = curve(options["ease-open"], "cubic-bezier(0.7, 0, 0.84, 0)");
    const closeEase = curve(options["ease-close"], "cubic-bezier(0.34, 1.56, 0.64, 1)");
    const id = `fx-shape-iris-${++seq}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.setAttribute("aria-hidden", "true");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    svg.innerHTML = `<clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${d}"/></clipPath><path d="${d}" fill="none"/>`;
    document.body.appendChild(svg);
    const path = svg.querySelector("clipPath path"), src = svg.lastElementChild;
    const box = src.getBBox();
    const radius = Math.hypot(box.width / 2, box.height / 2);
    path.style.transformBox = "fill-box";
    path.style.transformOrigin = "0 0";
    const at = (x, y, s) => `translate(${x}px, ${y}px) scale(${s}) translate(${-box.width / 2}px, ${-box.height / 2}px)`;
    const center = () => { const r = trigger.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const cover = (x, y) => ([[0, 0], [innerWidth, 0], [0, innerHeight], [innerWidth, innerHeight]].reduce((m, [a, b]) => Math.max(m, Math.hypot(a - x, b - y)), 0) / radius) * 2;
    const c0 = center();
    path.style.transform = at(c0.x, c0.y, 0);
    panel.style.clipPath = `url(#${id})`;
    panel.style.visibility = "hidden";
    let open = false, hideT = 0;

    const show = () => {
      clearTimeout(hideT);
      const c = center();
      path.style.transition = "none";
      path.style.transform = at(c.x, c.y, 0);
      panel.style.visibility = "visible";
      el.classList.add("fx-open");
      trigger.setAttribute("aria-expanded", "true");
      path.getBoundingClientRect();
      path.style.transition = reduce ? "none" : `transform ${openDur}s ${openEase}`;
      requestAnimationFrame(() => { path.style.transform = at(c.x, c.y, cover(c.x, c.y)); });
      open = true;
    };
    const hide = () => {
      const c = center();
      path.style.transition = reduce ? "none" : `transform ${closeDur}s ${closeEase}`;
      path.style.transform = at(c.x, c.y, 0);
      el.classList.remove("fx-open");
      trigger.setAttribute("aria-expanded", "false");
      hideT = setTimeout(() => { if (!open) panel.style.visibility = "hidden"; }, reduce ? 0 : closeDur * 1000);
      open = false;
    };
    const onTrigger = () => (open ? hide : show)();
    const onPanel = (e) => { if (e.target === panel) hide(); };
    const onKey = (e) => { if (e.key === "Escape" && open) hide(); };
    const onResize = () => { if (!open) return; const c = center(); path.style.transition = "none"; path.style.transform = at(c.x, c.y, cover(c.x, c.y)); };
    const onClose = () => open && hide();
    trigger.addEventListener("click", onTrigger);
    panel.addEventListener("click", onPanel);
    el.addEventListener("fx:close", onClose);
    addEventListener("keydown", onKey);
    addEventListener("resize", onResize);
    return () => {
      clearTimeout(hideT);
      trigger.removeEventListener("click", onTrigger); panel.removeEventListener("click", onPanel);
      el.removeEventListener("fx:close", onClose); removeEventListener("keydown", onKey); removeEventListener("resize", onResize);
      panel.style.clipPath = ""; panel.style.visibility = ""; el.classList.remove("fx-open"); svg.remove();
    };
  });
})();
