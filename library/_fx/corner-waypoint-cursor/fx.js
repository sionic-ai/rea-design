// Corner cursor + coordinate marker — the cursor’s four corners (normally a 5px box ±5px) stick with no delay, and over clickable things they spread out to ±20px·10px in .3s power2.out.
// Each time the pointer moves more than 100px over the plate (300ms apart, 150ms after it stops), a 10px marker and coordinates grow in place over .25s, stay, and vanish 3 seconds later.
// From the last marker to the cursor, 3·4 dotted lines connect, and once the markers have all faded the dotted line folds toward the cursor in .3s power2.in. Pressing scales it to .9x (.15s).
(() => {
  const CORNER = [[-1, -1, 0, 0], [1, -1, -1, 0], [-1, 1, 0, -1], [1, 1, -1, -1]];
  kfFx.register("corner-waypoint-cursor", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const spread = +(options.spread ?? 20), base = +(options.size ?? 5), big = +(options.hot ?? 10), dur = +(options.dur ?? 0.3);
    const life = +(options.life ?? 3) * 1000, step = +(options.dist ?? 100), every = +(options.every ?? 300);
    const targets = options.targets || "a, button, [role=button], [data-cursor-label]";
    const layer = document.createElement("div");
    layer.className = "fx-cwc";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = '<svg class="fx-cwc__line"><line/></svg><div class="fx-cwc__marks"></div><div class="fx-cwc__cur"><div class="fx-cwc__box"><i></i><i></i><i></i><i></i></div><span class="fx-cwc__label"></span></div>';
    document.body.append(layer);
    const cur = layer.querySelector(".fx-cwc__cur"), box = layer.querySelector(".fx-cwc__box"), label = layer.querySelector(".fx-cwc__label");
    const line = layer.querySelector("line"), marks = layer.querySelector(".fx-cwc__marks"), cs = [...box.children];
    const setX = gsap.quickSetter(cur, "x", "px"), setY = gsap.quickSetter(cur, "y", "px");
    const p = { x: 0, y: 0, ready: false }, list = [];
    let hot = false, text = "", dist = 0, lastDrop = 0, anchor = null, stopT = 0;
    const corners = (on, now) => cs.forEach((c, i) => {
      const [dx, dy, ax, ay] = CORNER[i], a = on ? spread : base, s = on ? big : base;
      const v = { x: dx * a + ax * s, y: dy * a + ay * s, width: s, height: s };
      now || reduce ? gsap.set(c, v) : gsap.to(c, { ...v, duration: dur, ease: "power2.out", overwrite: "auto" });
    });
    corners(false, true);
    const draw = () => {
      if (!anchor || !p.ready) { line.style.visibility = "hidden"; return; }
      line.style.visibility = "visible";
      line.setAttribute("x1", anchor.x); line.setAttribute("y1", anchor.y); line.setAttribute("x2", p.x); line.setAttribute("y2", p.y);
    };
    const drop = (x, y) => {
      x = Math.round(x); y = Math.round(y);
      const m = document.createElement("div");
      m.className = "fx-cwc__mark";
      m.style.left = x + "px"; m.style.top = y + "px";
      m.innerHTML = `<div class="fx-cwc__in"><i></i><span>${x}<br>${y}</span></div>`;
      marks.append(m);
      if (!reduce) gsap.fromTo(m.firstChild, { scale: 0 }, { scale: 1, duration: 0.25, ease: "power2.out" });
      list.push({ m, at: Date.now() });
      anchor = { x, y }; lastDrop = Date.now(); dist = 0;
      draw();
    };
    const sweep = setInterval(() => {
      const now = Date.now();
      while (list.length && now - list[0].at >= life) {
        list.shift().m.remove();
      }
      if (!list.length && anchor) {
        anchor = null;
        gsap.to(line, { attr: { x1: p.x, y1: p.y }, duration: reduce ? 0 : 0.3, ease: "power2.in", onComplete: () => { if (!anchor) line.style.visibility = "hidden"; } });
      }
    }, 300);
    const hotOf = (t) => {
      if (!(t instanceof Element) || !el.contains(t)) return [false, ""];
      const l = t.closest("[data-cursor-label]");
      return [!!t.closest(targets), l?.getAttribute("data-cursor-label") || ""];
    };
    const look = (t) => {
      const [h, l] = hotOf(t);
      if (h !== hot) { hot = h; corners(h); }
      if (l !== text) { text = l; if (l) label.textContent = l; gsap.to(label, { autoAlpha: l ? 1 : 0, duration: 0.18, ease: "power2.out", overwrite: "auto" }); }
    };
    const inside = (x, y) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
    const move = (e) => {
      const { clientX: x, clientY: y } = e;
      if (!inside(x, y)) { cur.style.opacity = 0; el.classList.remove("is-fx-cursor"); return; }
      el.classList.add("is-fx-cursor");
      const moved = !p.ready || x !== p.x || y !== p.y;
      if (p.ready && moved && !hot) dist += Math.hypot(x - p.x, y - p.y);
      p.x = x; p.y = y; p.ready = true;
      cur.style.opacity = 1; setX(x); setY(y);
      look(e.target);
      if (moved && !hot) {
        if (!anchor) drop(x, y);
        else {
          clearTimeout(stopT);
          stopT = setTimeout(() => { if (!hot && dist >= step) drop(p.x, p.y); }, 150);
          if (Date.now() - lastDrop >= every && dist >= step) drop(x, y);
        }
      }
      draw();
    };
    const down = () => gsap.to(box, { scale: 0.9, duration: 0.15, ease: "power2.out", overwrite: "auto" });
    const up = () => gsap.to(box, { scale: 1, duration: 0.15, ease: "power2.out", overwrite: "auto" });
    const over = (e) => look(e.target);
    addEventListener("mousemove", move, { passive: true });
    addEventListener("mousedown", down);
    addEventListener("mouseup", up);
    document.addEventListener("mouseover", over, { passive: true });
    return () => {
      clearInterval(sweep); clearTimeout(stopT);
      removeEventListener("mousemove", move); removeEventListener("mousedown", down); removeEventListener("mouseup", up);
      document.removeEventListener("mouseover", over);
      gsap.killTweensOf([...cs, box, label, line]);
      el.classList.remove("is-fx-cursor");
      layer.remove();
    };
  });
})();
