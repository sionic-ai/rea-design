/* Home page — stone cards flying in, 600vh clock, carousel entrance and drag, 3D objects around the clock. 
   Original values: card delay 2+col×.06+row×.2s, horizontal (col/(cols-1)×2-1)×350px, vertical 300+row×100px (phone 120+row×40, 80), duration 1.5+((col×7+row×13)%4)×.2s
   221 clock ticks (outer .976, inner .9655, each tick drawn across 3.5 cells), starting 1.5 screens below ×max(2, screen×2.5/ring) → ×1 at the center,
   Drawn amount .25+.75×progress, number outline from .75, filled once fully drawn, 26→0 every 1s, needle spring (+diff×.26, ×.32) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sd = window.sd || { onReady: (f) => f(), layers: [] };

  // ── Stone card
  const grid = document.querySelector(".sd-grid");
  if (grid) {
    const slots = [...grid.querySelectorAll(".sd-gslot")];
    const original = [...grid.querySelectorAll(".sd-gcol")].map((c) => [...c.children]);
    const layout = (cols) => {
      let lists;
      if (cols === 3) lists = original;
      else {
        const order = [];
        const maxLen = Math.max(...original.map((c) => c.length));
        for (let r = 0; r < maxLen; r++) original.forEach((c) => c[r] && order.push(c[r]));
        lists = Array.from({ length: cols }, () => []);
        const h = new Array(cols).fill(0);
        for (const s of order) {
          const i = h.indexOf(Math.min(...h));
          lists[i].push(s);
          h[i] += 1 / parseFloat(s.firstElementChild.style.getPropertyValue("--ar"));
        }
      }
      grid.innerHTML = "";
      grid.style.setProperty("--grid-cols", cols);
      lists.forEach((list, n) => {
        const col = document.createElement("div");
        col.className = "sd-gcol";
        list.forEach((slot, e) => {
          const small = cols <= 2, r = n * 7 + e * 13, i = cols === 1 ? 0 : (n / (cols - 1)) * 2 - 1;
          const card = slot.firstElementChild;
          card.style.setProperty("--card-delay", `${2 + n * 0.06 + e * 0.2}s`);
          card.style.setProperty("--card-x", `${i * (small ? 80 : 350)}px`);
          card.style.setProperty("--card-y", `${(small ? 120 : 300) + e * (small ? 40 : 100)}px`);
          card.style.setProperty("--card-dur", `${1.5 + (r % 4) * 0.2}s`);
          col.appendChild(slot);
        });
        grid.appendChild(col);
      });
    };
    let cols = innerWidth < 768 ? 2 : 3;
    layout(cols);
    new ResizeObserver(() => { const c = grid.clientWidth < 768 ? 2 : 3; if (c !== cols) { cols = c; layout(cols); } }).observe(grid);

    const settle = (card) => { card.classList.remove("card-in"); card.classList.add("card-static"); };
    sd.onReady(() => {
      slots.forEach((slot) => {
        const card = slot.firstElementChild;
        if (reduce) return settle(card);
        let first = true;
        const io = new IntersectionObserver(([en]) => {
          if (first) { first = false; if (!en.isIntersecting) return; }
          else if (!en.isIntersecting) return;
          else card.style.setProperty("--card-delay", "0s");
          io.disconnect();
          card.classList.add("card-in");
          card.addEventListener("animationend", () => settle(card), { once: true });
        }, { threshold: 0 });
        io.observe(slot);
      });
    });
  }

  // ── Clock
  const stage = document.querySelector(".sd-cd-stage");
  const clock = { filled: false, filledAt: 0, value: 26, progress: 0, active: false, centerY: NaN, scale: 1, ring: 0 };
  sd.clock = clock;
  if (stage) {
    const sticky = stage.querySelector(".sd-cd-sticky");
    const wrap = stage.querySelector(".sd-clock-wrap"), handWrap = stage.querySelector(".sd-hand-wrap");
    const circle = stage.querySelector(".sd-clock__circle"), ticks = stage.querySelector(".sd-clock__ticks");
    const digits = stage.querySelector(".sd-clock__digits"), digitEls = [...stage.querySelectorAll(".sd-clock__digit")];
    const hand = stage.querySelector(".sd-hand");
    const N_T = 221, HALF = Math.floor(N_T / 2), INNER = 49 * 0.9655, OUTER = 49 * 0.976, SPAN = 3.5;
    const marks = Array.from({ length: N_T }, (_, e) => {
      const t = (e / N_T) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      return { order: (e - HALF + N_T) % N_T, ox: 50 + OUTER * s, oy: 50 - OUTER * c, ix: 50 + INNER * s, iy: 50 - INNER * c };
    });
    const tickPath = (y) => {
      const e = y * (N_T - 1 + SPAN);
      let d = "";
      for (const m of marks) {
        if (m.order >= e) continue;
        const k = Math.min((e - m.order) / SPAN, 1);
        d += `M${m.ox.toFixed(2)} ${m.oy.toFixed(2)}L${(m.ox + (m.ix - m.ox) * k).toFixed(2)} ${(m.oy + (m.iy - m.oy) * k).toFixed(2)}`;
      }
      return d;
    };
    let lastY = -1;
    const update = () => {
      const m = window.visualViewport?.height ?? innerHeight, S = scrollY;
      const g = wrap.offsetHeight, L = stage.getBoundingClientRect().top + S, C = stage.offsetHeight, I = L + C, F = I - m;
      const z = reduce ? 1 : Math.min(Math.max((S - L) / Math.max(F - L, 1), 0), 1);
      const N = Math.max(2, (m * 2.5) / g), X = (m - g) / (2 * m);
      const Hy = m * (1.5 - (1.5 - X) * z), j = N - (N - 1) * z, Y = 0.25 + 0.75 * z, k = g * j;
      const vis = Hy > -k && Hy < m + k, inside = S >= L && S <= I - m;
      const tf = `translate(-50%, ${Hy}px) scale(${j})`;
      wrap.style.transform = tf; handWrap.style.transform = tf;
      wrap.style.visibility = handWrap.style.visibility = vis ? "visible" : "hidden";
      if (Y !== lastY) {
        lastY = Y;
        circle.setAttribute("stroke-dashoffset", String(1 - Y));
        ticks.setAttribute("d", tickPath(Y));
      }
      const A = Math.min(Math.max((Y - 0.75) / 0.25, 0), 1);
      if (A >= 1 && !clock.filled) { clock.filled = true; clock.filledAt = performance.now(); digits.classList.add("is-filled"); }
      if (!clock.filled) digitEls.forEach((d) => (d.style.strokeDashoffset = String(720 * (1 - A))));
      sticky.style.setProperty("--manifesto-y", `${Hy + k * 0.78}px`);
      sticky.style.setProperty("--manifesto-vis", vis ? "visible" : "hidden");
      const top = inside ? 0 : S < L ? L - S : I - S - m;
      clock.progress = z; clock.active = vis; clock.scale = j; clock.ring = g;
      clock.centerY = vis ? top + Hy + g * 0.5 : NaN;
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();

    // Needle: while drawing, a half turn from bottom (180°) to top (360°), and after filling 1/26 turn every 1s
    let ang = 180, vel = 0;
    const tick = (now) => {
      let target;
      if (clock.filled) {
        const k = ((Math.floor((now - clock.filledAt) / 1000) % 27) + 27) % 27;
        const value = 26 - k;
        if (value !== clock.value) {
          clock.value = value;
          const s = String(value).padStart(2, "0");
          digitEls[0].textContent = s[0]; digitEls[1].textContent = s[1];
        }
        target = 360 + (360 * k) / 26;
      } else target = 180 + 180 * clock.progress;
      let d = target - ang; d -= Math.round(d / 360) * 360;
      if (reduce) ang = target; else { vel += d * 0.26; vel *= 0.32; ang += vel; }
      hand.style.transform = `rotate(${ang}deg)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── 3D objects around the clock — product model spots of the original replaced with basic shapes in the same spots and similar silhouettes (pop out and float after filling the numbers, nudged slightly by the mouse)
  if (sd.renderer && window.THREE && stage) {
    const T = THREE, scene = new T.Scene();
    const cam = new T.PerspectiveCamera(50, 1, 1, 4000);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a8a8a, 1.6));
    const sun = new T.DirectionalLight(0xffffff, 2.9); sun.position.set(2.9, 5, 5); scene.add(sun);
    const mat = (v, rough = 0.55) => new T.MeshStandardMaterial({ color: sd.color(v), roughness: rough, metalness: 0.05 });
    const make = {
      mug: () => { const g = new T.Group(); g.add(new T.Mesh(new T.CylinderGeometry(0.5, 0.45, 0.9, 40, 1, true), mat("--site-sand", 0.35)));
        const bottom = new T.Mesh(new T.CircleGeometry(0.45, 40), mat("--site-sand")); bottom.rotation.x = Math.PI / 2; bottom.position.y = -0.45; g.add(bottom);
        const h = new T.Mesh(new T.TorusGeometry(0.22, 0.07, 16, 40, Math.PI * 1.3), mat("--site-sand")); h.position.x = 0.5; h.rotation.z = -Math.PI * 0.65; g.add(h); return g; },
      bag: () => { const g = new T.Group(); const b = new T.Mesh(new T.BoxGeometry(1.2, 0.8, 0.5, 4, 4, 4), mat("--site-blue", 0.8)); g.add(b);
        for (const x of [-0.25, 0.25]) { const s = new T.Mesh(new T.TorusGeometry(0.28, 0.05, 12, 32, Math.PI), mat("--site-blue")); s.position.set(x, 0.4, 0); g.add(s); } return g; },
      skates: () => { const g = new T.Group(); for (const x of [-0.35, 0.35]) { const boot = new T.Mesh(new T.CapsuleGeometry(0.22, 0.5, 8, 16), mat("--site-rose")); boot.position.set(x, 0.2, 0); g.add(boot);
        for (const z of [-0.25, -0.08, 0.08, 0.25]) { const w = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 0.08, 20), mat("--kf-dim", 0.3)); w.rotation.z = Math.PI / 2; w.position.set(x, -0.25, z * 1.4); g.add(w); } } return g; },
      fruit: () => { const g = new T.Group(); g.add(new T.Mesh(new T.SphereGeometry(0.55, 40, 24), mat("--kf-accent", 0.4)));
        const leaf = new T.Mesh(new T.ConeGeometry(0.12, 0.4, 12), mat("--site-lime")); leaf.position.y = 0.65; g.add(leaf); return g; },
      shoe: () => { const g = new T.Group(); const s = new T.Mesh(new T.CapsuleGeometry(0.3, 1, 8, 24), mat("--site-lime", 0.6)); s.rotation.z = Math.PI / 2; g.add(s);
        const sole = new T.Mesh(new T.BoxGeometry(1.6, 0.14, 0.62), mat("--site-sand")); sole.position.y = -0.3; g.add(sole); return g; },
      blob: () => new T.Mesh(new T.IcosahedronGeometry(0.6, 3), mat("--site-plum", 0.25)),
      box: () => new T.Mesh(new T.BoxGeometry(0.8, 0.8, 0.8), mat("--site-pine", 0.7)),
      ring: () => new T.Mesh(new T.TorusGeometry(0.42, 0.14, 20, 48), mat("--kf-accent-text", 0.3)),
    };
    // Position and size relative to the ring radius (measured on the original 1440 screen)
    const PLACES = [["mug", -0.53, -0.32, 0.17], ["bag", -0.77, 0.27, 0.2], ["skates", -0.45, 0.38, 0.2], ["fruit", 0.78, -0.3, 0.13],
      ["shoe", 0.57, 0.53, 0.15], ["blob", 0.1, 0.77, 0.1], ["box", 0.86, 0.12, 0.08], ["ring", -0.2, -0.86, 0.09]];
    const items = PLACES.map(([kind, x, y, s], i) => {
      const o = make[kind](); o.userData = { x, y, s, i, pop: 0, spin: 0.2 + (i % 3) * 0.12, phase: i * 1.7 };
      o.rotation.set(0.3 * i, 0.7 * i, 0.15 * i); o.visible = false; scene.add(o); return o;
    });
    let shown = false, mx = 0, my = 0, smx = 0, smy = 0;
    addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    sd.layers.push((renderer, now, dt, spread) => {
      const c = sd.clock;
      if (!c.active || !Number.isFinite(c.centerY) || spread > 0.5) return;
      if (c.filled && !shown) {
        shown = true;
        items.forEach((o, i) => gsap.fromTo(o.userData, { pop: 0 }, { pop: 1, duration: reduce ? 0 : 0.9, delay: reduce ? 0 : i * 0.06, ease: "elastic.out(1, 0.55)" }));
      }
      if (!c.filled) { if (shown) { shown = false; items.forEach((o) => { gsap.killTweensOf(o.userData); o.userData.pop = 0; }); } return; }
      const W = innerWidth, H = innerHeight;
      cam.fov = 2 * Math.atan(H / 2 / 800) * 180 / Math.PI; cam.aspect = W / H; cam.position.set(0, 0, 800); cam.updateProjectionMatrix();
      smx += (mx - smx) * 0.06; smy += (my - smy) * 0.06;
      const R = (c.ring / 2) * c.scale, cy = H / 2 - c.centerY, t = now * 0.001;
      for (const o of items) {
        const u = o.userData;
        o.visible = u.pop > 0.001;
        o.position.set(u.x * R + smx * 40 * (1 + u.i % 3), cy - u.y * R + Math.sin(t + u.phase) * 10 - smy * 30, 60);
        o.scale.setScalar(Math.max(u.pop, 0.0001) * u.s * R);
        if (!reduce) { o.rotation.y += u.spin * dt; o.rotation.x += u.spin * 0.4 * dt; }
      }
      renderer.clearDepth();
      renderer.render(scene, cam);
    });
  }

  // ── Carousel: enters at 35% visible (90ms per card), hover turns on once all are settled. Dragging with the mouse pushes it sideways
  const car = document.querySelector(".sd-carousel");
  if (car) {
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      car.classList.add("is-entered");
      const lastShell = car.querySelector(".sd-ccard:last-child .sd-ccard__shell");
      const done = (e) => {
        if (e && e.propertyName !== "transform") return;
        lastShell.removeEventListener("transitionend", done);
        if (matchMedia("(hover: hover) and (pointer: fine)").matches) car.querySelectorAll(".sd-ccard__shell").forEach((s) => s.classList.add("is-hoverable"));
      };
      if (reduce) done(); else lastShell.addEventListener("transitionend", done);
    }, { threshold: 0.35, rootMargin: "0px 0px -20% 0px" });
    io.observe(car);
    let down = false, sx = 0, sl = 0, v = 0, lx = 0, lt = 0, raf = 0;
    car.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; sd.dragged = false; sx = lx = e.clientX; sl = car.scrollLeft; lt = performance.now(); v = 0; cancelAnimationFrame(raf);
    });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 5 && !sd.dragged) { sd.dragged = true; car.classList.add("is-drag"); }
      if (!sd.dragged) return;
      const now = performance.now(); v = (e.clientX - lx) / Math.max(now - lt, 1); lx = e.clientX; lt = now;
      car.scrollLeft = sl - dx;
    });
    addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      if (!sd.dragged) return;
      let vel = v * 16;
      const glide = () => {
        vel *= 0.95; car.scrollLeft -= vel;
        if (Math.abs(vel) > 0.5) raf = requestAnimationFrame(glide);
        else { car.classList.remove("is-drag"); setTimeout(() => (sd.dragged = false), 0); }
      };
      raf = requestAnimationFrame(glide);
    });
  }
  // In the original, the workshop thumbnail reveal interpolation (15% per frame) stalls at .96 and only goes the rest of the way to 1 when it is redrawn on first touch — after that it stays at 1
  const thumb = document.querySelector(".sd-remote__thumb");
  if (thumb && !reduce) thumb.addEventListener("pointerenter", () => {
    let o = 0.96;
    const step = () => { o += (1 - o) * 0.15; if (1 - o < 0.0028) o = 1; thumb.style.opacity = String(o); if (o < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, { once: true });
})();
