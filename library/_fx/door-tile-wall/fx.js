// Lay out letter-shaped panels (doors) offset by half a cell per row, and every N seconds two panels’ doors open slightly (rotateY −20°) on a left hinge, revealing the light face up to 70% and then
// Rests 1s then closes (.5s power2.inOut — original recruiting site hero). The center panel (main) is a lime door, and sending fx:open to an element leaves it standing open at −50°.
(() => {
  const SHAPES = {
    v: "M0 0L133 34L267 0V150H0Z",
    b: "M0 0H190Q240 0 240 38Q240 62 220 75Q267 88 252 118Q240 150 190 150H0Z",
    s: "M14 6Q120 -6 238 6L240 52Q190 56 180 66Q170 80 230 92Q262 104 252 132Q240 150 140 150Q60 150 10 144L12 98Q70 96 80 84Q86 74 30 62Q0 52 2 30Q4 10 14 6Z",
    h: "M0 10Q0 0 30 0H220Q267 0 267 50Q267 82 228 92Q200 100 200 120V150H0Z"
  };
  const OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 70% 100%)", SHUT = "polygon(0% 0%, 100% 0%, 100% 0%, 100% 0%)";
  kfFx.register("door-tile-wall", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const rows = Math.max(1, +options.rows || 5), cols = Math.max(1, +options.cols || 6);
    const gap = +(options.gap ?? 60), every = +options.every || 1.5;
    const keys = String(options.shapes || "v b s h").split(/\s+/).filter((k) => SHAPES[k]);
    if (!keys.length) return;
    const [mr, mc] = String(options.main ?? "").split(",").map(Number);
    const wall = document.createElement("div");
    wall.className = "fx-door-wall";
    wall.style.setProperty("--fx-gap", `${gap}px`);
    for (let r = 0; r < rows; r++) {
      const row = document.createElement("div");
      row.className = "fx-door-row";
      row.style.setProperty("--fx-i", r);
      if (r % 2) row.style.marginLeft = `calc((267px + ${gap}px) / -2)`;
      for (let c = 0; c < cols; c++) {
        const d = SHAPES[keys[(r * 3 + c) % keys.length]];
        const main = r === mr && c === mc;
        row.insertAdjacentHTML("beforeend", `<div class="fx-door${main ? " is-main" : ""}" data-fx-part="door"><svg class="fx-door__base" viewBox="0 0 267 150"><path d="${d}"/></svg><div class="fx-door__reflect"><svg viewBox="0 0 267 150"><path d="${d}"/></svg></div>${main ? `<div class="fx-door__leaf"><i></i></div>` : ""}<i class="fx-door__knob"></i></div>`);
      }
      wall.append(row);
    }
    el.append(wall);
    const doors = [...wall.querySelectorAll(".fx-door:not(.is-main)")];
    gsap.set(wall.querySelectorAll(".fx-door__reflect"), { clipPath: SHUT });
    const flash = (door) => {
      const ref = door.querySelector(".fx-door__reflect");
      return gsap.timeline()
        .to(ref, { rotateY: -20, duration: 0.5, ease: "power2.inOut" })
        .to(ref, { clipPath: OPEN, duration: 0.5, ease: "power2.inOut" }, 0)
        .to({}, { duration: 1 })
        .to(ref, { rotateY: 0, duration: 0.5, ease: "power2.inOut" })
        .to(ref, { clipPath: SHUT, duration: 0.5, ease: "power2.inOut" }, "-=0.5");
    };
    const box = () => el.getBoundingClientRect();
    const seen = (d) => { const a = d.getBoundingClientRect(), b = box(); return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom; };
    let last = new Set(), timer = 0, live = [];
    const tick = () => {
      if (document.hidden) { timer = setTimeout(tick, every * 1000); return; }
      const vis = doors.filter(seen), pool = vis.length ? vis : doors;
      const fresh = pool.filter((d) => !last.has(d));
      const pick = [...(fresh.length >= 2 ? fresh : pool)].sort(() => Math.random() - 0.5).slice(0, 2);
      last = new Set(pick);
      live = pick.map(flash);
      timer = setTimeout(tick, every * 1000);
    };
    const leaf = wall.querySelector(".is-main .fx-door__leaf");
    const open = () => leaf && gsap.to(leaf, { rotateY: -50, duration: reduce ? 0 : 1, ease: "power3.inOut" });
    el.addEventListener("fx:open", open);
    // start: with event, it waits until it receives fx:play (after the hero intro ends — in the original it starts 1s after the end of the intro timeline)
    const begin = () => { if (!reduce && !timer) timer = setTimeout(tick, (+(options.delay ?? 0)) * 1000); };
    if (options.start === "event") el.addEventListener("fx:play", begin); else begin();
    return () => { clearTimeout(timer); live.forEach((t) => t.kill()); el.removeEventListener("fx:open", open); el.removeEventListener("fx:play", begin); wall.remove(); };
  });
})();
