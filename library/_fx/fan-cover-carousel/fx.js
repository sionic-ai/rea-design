// Fan-shaped cover carousel: only the chosen cover stands in front (z 150), side covers at distance o step back o·35 + 100px sideways and |o|·50px deep, turn outward 60° and darken to .45 brightness.
// Arrow, side-cover click, ←→ and a 40px horizontal drag each move one slot at .65s power3.out. In fx:layout "arc" When sent, the covers fan out at 380px along an arc of 1000px radius (22° per slot), "ring" If so, it keeps orbiting in an ellipse, "balls" Bounce up over the surface, fall, and ricochet off each other — Brand game
(() => {
  kfFx.register("fan-cover-carousel", (host, { options, reduce }) => {
    const items = [...host.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const n = items.length, dur = reduce ? 0 : +(options.dur ?? 0.65), phone = +(options.phone ?? 768);
    const looks = ["arc", "ring", "balls"];
    let at = +(options.start ?? 0), look = looks.includes(options.look) ? options.look : "fan";
    // ring — orbits an elliptical path (horizontal radius .36–.40 of screen width, vertical depth .42 times that) every frame. On entry it spins fast at .14rad, slows by .985 per step down to .0006, and the radius expands over .9s
    let ang = 0, spin = 0.0005, grow = { p: 1 }, nx = 0, ny = 0, dragging = false, dx = 0;
    const ringTick = () => {
      if (look !== "ring") return;
      if (!dragging) spin = 0.0006 + (spin - 0.0006) * 0.985;
      ang += reduce ? 0 : spin;
      const w = innerWidth;
      const [size, kx] = w >= 1600 ? [260, 0.38] : w >= 1360 ? [230, 0.39] : w >= 1000 ? [180, 0.4] : [130, 0.36];
      const rx = w * kx * grow.p, rz = rx * 0.42;
      items.forEach((el, i) => {
        const a = ang + (i * Math.PI * 2) / n, z = Math.sin(a) * rz, d = rz ? (z + rz) / (2 * rz) : 1, s = 0.86 + d * 0.28;
        gsap.set(el, { x: Math.cos(a) * rx, y: Math.sin(a * 2) * 65 + ny * 20, z, rotationY: nx * 18, rotationX: 0, rotationZ: 0, scale: s, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, zIndex: Math.floor(d * 100) });
        const m = media(el);
        if (m) gsap.set(m, { opacity: 0.85 + d * 0.15, filter: "brightness(1)" });
        el.classList.remove("is-fx-active");
      });
    };
    const media = (el) => el.querySelector('[data-fx-part="media"]');
    // balls — bounce upward around the cell chosen by the cover (12~15px/frame, spreading .22rad per cell), fall with gravity .26 · air .99, and bounce off each other, the walls and the floor at .68.
    // When the cursor comes within radius + 30px it is pushed away, and a cover with a hand over it stops in place and stands in front at 1.5x
    let balls = [];
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, lx: 0, ly: 0 };
    const ballsInit = () => {
      const w = innerWidth, size = w >= 1600 ? 185 : w >= 1360 ? 165 : w >= 1000 ? 135 : 100, r = size * 0.52;
      const cur = ((at % n) + n) % n;
      balls = items.map((el, i) => {
        let o = i - cur;
        if (o > Math.floor(n / 2)) o -= n; else if (o < -Math.floor(n / 2)) o += n;
        const a = -Math.PI / 2 + o * 0.22, sp = 12 + Math.random() * 3;
        return { x: o * 18, y: 40, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4, r, size, rot: o * 6, spin: (Math.random() - 0.5) * 4, held: false };
      });
    };
    const ballsTick = () => {
      if (look !== "balls" || !balls.length) return;
      const W = innerWidth, H = innerHeight, bx = W / 2 - 15, by = H * 0.46 - 40, top = -(H * 0.54) + 20, rest = 0.68;
      for (const b of balls) {
        if (b.held) { b.vx = b.vy = b.spin = 0; continue; }
        b.vy += 0.26; b.vx *= 0.99; b.vy *= 0.99; b.spin *= 0.98;
        b.x += b.vx; b.y += b.vy; b.rot += b.spin;
        const dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < b.r + 30 && d > 0) { b.vx += (dx / d) * 4 + mouse.vx * 0.3; b.vy += (dy / d) * 4 - 3 + mouse.vy * 0.3; }
      }
      for (let it = 0; it < 4; it++) {
        for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) {
          const p = balls[i], q = balls[j], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
          const min = (p.held ? p.r * 1.5 : p.r) + (q.held ? q.r * 1.5 : q.r);
          if (d >= min || d <= 0) continue;
          const nx = dx / d, ny = dy / d, ov = min - d;
          if (p.held) { q.x += nx * ov; q.y += ny * ov; }
          else if (q.held) { p.x -= nx * ov; p.y -= ny * ov; }
          else {
            p.x -= nx * ov / 2; p.y -= ny * ov / 2; q.x += nx * ov / 2; q.y += ny * ov / 2;
            if (it === 0) { const k = (nx * (p.vx - q.vx) + ny * (p.vy - q.vy)) * rest; p.vx -= k * nx; p.vy -= k * ny; q.vx += k * nx; q.vy += k * ny; }
          }
        }
        for (const b of balls) {
          const r = b.held ? b.r * 1.5 : b.r;
          if (b.x + r > bx) { b.x = bx - r; if (!it) b.vx = -Math.abs(b.vx) * rest; }
          else if (b.x - r < -bx) { b.x = -bx + r; if (!it) b.vx = Math.abs(b.vx) * rest; }
          if (b.y - r < top) { b.y = top + r; if (!it) b.vy = Math.abs(b.vy) * rest; }
          if (b.y + r > by) { b.y = by - r; if (!it) { if (b.vy > 0.8) { b.vy = -b.vy * rest; b.vx *= 0.92; } else if (b.vy >= 0) { b.vy = 0; b.vx *= 0.85; } } }
        }
      }
      items.forEach((el, i) => {
        const b = balls[i];
        gsap.set(el, { x: b.x, y: b.y, z: b.held ? 80 : 0, rotationZ: b.rot, rotationX: 0, rotationY: 0, scale: b.held ? 1.5 : 1, width: b.size, height: b.size, marginLeft: -b.size / 2, marginTop: -b.size / 2, zIndex: b.held ? 600 : 20 + i });
        const m = media(el);
        if (m) gsap.set(m, { opacity: 1, filter: "brightness(1)" });
        el.classList.remove("is-fx-active");
      });
    };
    const layout = (animate = true) => {
      if (look === "ring" || look === "balls") return;
      const mobile = innerWidth < phone, d = animate ? dur : 0;
      items.forEach((el, i) => {
        let o = i - (((at % n) + n) % n);
        if (o > Math.floor(n / 2)) o -= n; else if (o < -Math.floor(n / 2)) o += n;
        const s = Math.sign(o), a = Math.abs(o);
        let v;
        if (look === "fan") {
          const size = mobile ? 150 : 220;
          v = o === 0 ? { x: 0, z: 150, rotationY: 0 } : { x: mobile ? o * 25 + s * 60 : o * 35 + s * 100, z: -a * 50, rotationY: s * -60 };
          Object.assign(v, { scale: 1, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 });
        } else {
          const R = mobile ? 480 : 1000, step = mobile ? 28 : 22, ang = (o * step * Math.PI) / 180, size = mobile ? 220 : 380;
          v = { x: Math.sin(ang) * R, z: Math.cos(ang) * R - R + (o === 0 ? 200 : 150), rotationY: o * step, scale: o === 0 ? 1.08 : 0.88, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 };
        }
        gsap.to(el, { ...v, y: 0, rotationX: 0, rotationZ: 0, zIndex: 100 - a, duration: d, ease: "power3.out", overwrite: "auto" });
        const m = media(el);
        if (m) gsap.to(m, { filter: `brightness(${o === 0 ? 1 : 0.45})`, duration: d, ease: "power3.out", overwrite: "auto" });
        el.classList.toggle("is-fx-active", o === 0);
      });
      host.dispatchEvent(new CustomEvent("fx:pick", { detail: { index: ((at % n) + n) % n } }));
    };
    // auto — in carousel types (fan·arc), advances one slot by itself every set number of seconds. Turning by hand resets the timer
    const auto = reduce ? 0 : +(options.auto ?? 0);
    let timer = 0;
    const play = () => { clearInterval(timer); if (auto > 0 && (look === "fan" || look === "arc")) timer = setInterval(() => { at += 1; layout(); }, auto * 1000); };
    const go = (k) => { at += k; layout(); play(); };
    const ac = new AbortController(), on = { signal: ac.signal };
    host.querySelector('[data-fx-part="prev"]')?.addEventListener("click", () => go(-1), on);
    host.querySelector('[data-fx-part="next"]')?.addEventListener("click", () => go(1), on);
    items.forEach((el, i) => el.addEventListener("click", (e) => {
      if (moved) { e.preventDefault(); return; }
      const cur = ((at % n) + n) % n;
      if (i !== cur) { e.preventDefault(); let o = i - cur; if (o > n / 2) o -= n; if (o < -n / 2) o += n; go(o); }
    }, on));
    addEventListener("keydown", (e) => {
      if (!host.isConnected || e.target.closest?.("input, textarea")) return;
      if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1);
    }, on);
    let x0 = null, moved = false;
    host.addEventListener("pointerdown", (e) => { x0 = e.clientX; moved = false; }, on);
    addEventListener("pointerup", (e) => {
      if (x0 == null || look === "ring" || look === "balls") { x0 = null; return; }
      const d = e.clientX - x0; x0 = null;
      if (Math.abs(d) > 40) { moved = true; go(d < 0 ? 1 : -1); setTimeout(() => (moved = false)); }
    }, on);
    host.addEventListener("fx:layout", (e) => {
      const was = look;
      look = looks.includes(e.detail) ? e.detail : "fan";
      host.classList.toggle("is-fx-arc", look === "arc");
      host.classList.toggle("is-fx-ring", look === "ring");
      host.classList.toggle("is-fx-balls", look === "balls");
      gsap.ticker.remove(ringTick);
      gsap.ticker.remove(ballsTick);
      play();
      if (look === "balls") { gsap.killTweensOf(items); ballsInit(); gsap.ticker.add(ballsTick); }
      else if (look === "ring") {
        if (was !== "ring") { gsap.killTweensOf(items); spin = 0.14; grow.p = 0; gsap.to(grow, { p: 1, duration: reduce ? 0 : 0.9, ease: "power2.out" }); }
        gsap.ticker.add(ringTick);
      } else layout();
    }, on);
    addEventListener("mousemove", (e) => {
      const r = host.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      mouse.vx = x - mouse.lx; mouse.vy = y - mouse.ly; mouse.lx = mouse.x = x; mouse.ly = mouse.y = y;
    }, on);
    items.forEach((el, i) => {
      el.addEventListener("pointerenter", () => { if (look === "balls" && balls[i]) balls[i].held = true; }, on);
      el.addEventListener("pointerleave", () => { if (balls[i]) balls[i].held = false; }, on);
    });
    addEventListener("mousemove", (e) => { nx = (e.clientX / innerWidth) * 2 - 1; ny = (e.clientY / innerHeight) * 2 - 1; if (dragging && look === "ring") { spin = (e.clientX - dx) * 0.008; dx = e.clientX; } }, on);
    host.addEventListener("pointerdown", (e) => { dragging = true; dx = e.clientX; }, on);
    addEventListener("pointerup", () => { dragging = false; }, on);
    addEventListener("resize", () => layout(false), on);
    if (look === "ring") gsap.ticker.add(ringTick);
    else if (look === "balls") { ballsInit(); gsap.ticker.add(ballsTick); }
    else layout(false);
    play();
    return () => {
      clearInterval(timer);
      ac.abort();
      gsap.ticker.remove(ringTick);
      gsap.ticker.remove(ballsTick);
      gsap.killTweensOf([...items, grow]);
      gsap.set(items, { clearProps: "all" });
      items.forEach((el) => { el.classList.remove("is-fx-active"); const m = media(el); if (m) gsap.set(m, { clearProps: "filter" }); });
      host.classList.remove("is-fx-arc");
    };
  });
})();
