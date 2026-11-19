// CSS 3D stage — copies the numbers from the original css3d.js as they are, and builds with our own panels (placeholder bands · solid-color layered plates · block buildings) instead of the original photo pieces and device photo panels.
// Ratio: on PC, width/1728 when the window is under 1728 wide, width/1920 when over 1920 (phone 1). Cylinder diameter 1000px×1.2×ratio, 8 photos, horizontal tilt −15°, vertical −110° (down to −90° with scroll).
// Cylinder and city rotate per frame by (elapsed ms × .012)° = 12° per second. On phone, on open rotateY 80→150° (1.2s cubic-bezier(.7,0,.3,1)), then it turns by scroll × .25.
(() => {
  const root = document.documentElement;
  const pc = () => matchMedia("(min-width: 768px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ratio = () => { const w = innerWidth; if (!pc()) return 1; return w < 1728 ? w / 1728 : w > 1920 ? w / 1920 : 1; };
  const sizes = () => pc() ? { hero: 1.2, phone: 1.2, pc: 1.08, pc2: 0.8, city: 1 } : { hero: 0.5, phone: 0.5, pc: 0.45, pc2: 0.35, city: 0.3 };

  // ---------- Build — the photo cylinder is built and spun by the css3d-ring-spin part ----------
  document.querySelectorAll("[data-layers]").forEach((layer) => {
    const n = +layer.dataset.layers;
    const holder = layer.classList.contains("d3-object") ? Object.assign(document.createElement("div"), { className: "d3-layer" }) : layer;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("div");
      d.style.setProperty("--z", i);
      if (i === 0) d.className = "is-front";
      else if (i === n - 5 && n >= 20) d.className = "is-back";
      else if (i > n - 5 && n >= 20) d.className = "is-camera";
      holder.append(d);
    }
    if (holder !== layer) layer.append(holder);
  });
  // City: blocky buildings of varied height and two pins on a ground slab — our blocks of the same size instead of the original map model
  document.querySelectorAll("[data-city]").forEach((map) => {
    const blocks = [
      [12, 14, 10, 10, 4], [26, 12, 8, 14, 6], [40, 18, 12, 9, 3], [58, 10, 9, 9, 9], [70, 22, 14, 10, 5],
      [16, 34, 12, 12, 7], [32, 36, 8, 8, 12], [46, 40, 10, 14, 4], [62, 38, 12, 10, 16], [78, 42, 10, 12, 6],
      [10, 56, 14, 10, 3], [28, 58, 10, 12, 8], [44, 62, 16, 10, 5], [64, 60, 9, 9, 22], [76, 66, 12, 12, 4],
      [20, 76, 10, 10, 6], [36, 80, 12, 8, 3], [54, 78, 10, 12, 10], [70, 82, 14, 8, 4],
    ];
    let html = '<div class="city__base"></div><div class="city__water"></div>';
    for (const [x, y, w, d, h] of blocks) {
      html += `<div class="city__bld" style="--x:${x}%;--y:${y}%;--w:${w}%;--d:${d}%;--h:${h * 6}px"><i class="t"></i><i class="f"></i><i class="b"></i><i class="l"></i><i class="r"></i></div>`;
    }
    html += '<div class="city__pin" style="--x:66%;--y:62%"><div><b>Headquarters</b></div></div><div class="city__pin is-2" style="--x:36%;--y:38%"><div><b>Point</b></div></div>';
    map.innerHTML = html;
  });

  // ---------- Size ratios ----------
  const setRatio = () => {
    const r = ratio(), s = sizes();
    document.querySelector('[data-d3="hero"]')?.closest(".mv01")?.style.setProperty("--rr", s.hero * r);
    document.querySelectorAll("#mv02, #mv03").forEach((el) => el.style.setProperty("--rr", s.phone * r));
    document.querySelector("#mv04")?.style.setProperty("--rr", s.pc2 * r);
    document.querySelector("#city")?.style.setProperty("--rr", s.city * r);
  };
  setRatio();
  addEventListener("resize", setRatio);

  // ---------- Opening: is-loaded after 1.2s (settling 1.2s), then opening-end after another 1.2s ----------
  const open = () => {
    root.classList.add("is-loaded");
    setTimeout(() => root.classList.add("opening-end"), reduce ? 0 : 1200);
  };
  if (reduce) open();
  else {
    let timed = false, loaded = document.readyState === "complete";
    setTimeout(() => { timed = true; if (loaded) open(); }, 1200);
    addEventListener("load", () => { loaded = true; if (timed) open(); });
  }

  // ---------- Motion ----------
  const play = { hero: !reduce, city: !reduce };
  document.querySelectorAll("[data-pause]").forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.pause;
    if (!(k in play)) return;
    play[k] = !play[k];
    if (k === "hero") circle?.dispatchEvent(new CustomEvent(play[k] ? "fx:play" : "fx:pause"));
    b.classList.toggle("is-paused", !play[k]);
    b.setAttribute("aria-label", play[k] ? "Animation pause" : "Animation play");
  }));
  const mv01 = document.querySelector(".mv01");
  const stage1 = mv01?.querySelector(".d3-stage");
  const circle = mv01?.querySelector(".d3-circle");
  const sp = mv01?.querySelector(".d3-phone");
  const spLayer = sp?.querySelector(".d3-layer");
  const city = document.querySelector("[data-city]");
  const pins = city ? [...city.querySelectorAll(".city__pin > div")] : [];
  const mv = (id) => document.getElementById(id);
  const seen = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  let cityRot = 0, last = performance.now(), devRot = 0;

  const frame = (now) => {
    const dt = Math.max(1, now - last) * 0.012;
    last = now;
    const y = scrollY, r = ratio();
    if (play.city && seen(city)) {
      cityRot = cityRot > 360 ? 0 : cityRot + dt;
      city.style.transform = `rotateX(235deg) rotateY(-180deg) rotateZ(${-90 - cityRot}deg)`;
      pins.forEach((p) => (p.style.transform = `rotateY(-${270 + cityRot}deg)`));
    }
    if (mv01 && seen(mv01) && root.classList.contains("opening-end") && !reduce) {
      if (pc()) {
        const va = Math.min(-90, -110 + y * 0.03);
        const mvTop = y * (0.815 + (mv01.offsetHeight / mv01.offsetWidth) * 0.05);
        const spLeft = Math.min(22, y * 0.04);
        const spScale = Math.max(0.9, 1.1 - y * 0.0002);
        const a = 150 + (y / r) * 0.25;
        const spRot = a < 450 ? a : 450 - 300 / (0.25 / 0.03) + (y / r) * 0.03;
        stage1.style.transform = `translate3d(0, ${mvTop}px, 0)`;
        circle.style.transform = `translate3d(0, -${y * 1.2}px, 0) rotateX(${va}deg) rotateY(-15deg)`;
        sp.style.transform = `translate3d(${spLeft}svw, 0, 0) rotateX(${270 + va}deg) rotateZ(165deg) scale(${spScale})`;
        spLayer.style.transform = `rotateY(${spRot}deg)`;
      } else {
        const va = -110 + y * 0.08;
        circle.style.transform = `rotateX(${va}deg) rotateY(-15deg)`;
        sp.style.transform = `rotateX(${270 + va}deg) rotateZ(165deg) scale(1.1)`;
        spLayer.style.transform = `rotateY(${150 + (y / r) * 0.15}deg)`;
      }
    }
    // Story section device: descends following the screen (scroll − section top + stage height/3) and rotates by scroll × .03 (.04 on phones)
    const m2 = mv("mv02"), m3 = mv("mv03"), m4 = mv("mv04");
    if (!reduce && m2 && m4) {
      const dev = (el) => y - top(el) + el.querySelector(".d3-stage").offsetHeight / 3;
      if (pc()) {
        if (seen(m2) || seen(m3) || seen(m4)) devRot = (y / r) * 0.03;
        if (seen(m2)) { m2.querySelector(".d3-stage").style.transform = `translate3d(0, ${dev(m2)}px, 0)`; m2.querySelector(".d3-layer").style.transform = `rotateY(${60 + devRot}deg)`; }
        if (seen(m3)) { m3.querySelector(".d3-stage").style.transform = `translate3d(0, ${dev(m3)}px, 0)`; m3.querySelector(".d3-layer").style.transform = `rotateY(${60 + devRot}deg)`; }
        if (seen(m4)) {
          const d = dev(m4);
          m4.querySelector(".d3-stage").style.transform = `translate3d(0, ${d >= 0 ? 0 : d}px, 0)`;
          const z = d >= 0 ? -60 - ((top(m4) - m4.offsetHeight / 3) / r) * 0.03 + 1 : -60 - devRot;
          m4.querySelector(".d3-container").style.transform = `rotateX(250deg) rotateY(-180deg) rotateZ(${z}deg)`;
        }
      } else {
        if (seen(m2) || seen(m3) || seen(m4)) devRot = (y / r) * 0.04;
        if (seen(m2)) m2.querySelector(".d3-layer").style.transform = `rotateY(${80 + devRot}deg)`;
        if (seen(m3)) m3.querySelector(".d3-layer").style.transform = `rotateY(${80 + devRot}deg)`;
        if (seen(m4)) m4.querySelector(".d3-container").style.transform = `rotateX(250deg) rotateY(-180deg) rotateZ(${-80 - devRot}deg)`;
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
