// Screen-fixed isometric factory + step cards on the right. The original art isn’t used, but the composition is the same (conveyor from top left → bottom right, bending toward the cloud,
// Redrawn with (big back box, laser door, robot arm).
// Original values: a card is active when its center is within 30~70% of the screen · only stage zones 1..N turn on and the rest are covered with cream .75 ·
// Image reveal opacity/transform .7s cubic-bezier(.22,1,.36,1), ±120px·scale .92 · enters when the visible ratio is .62 or more, exits when below .38.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  // Skin comes from --site-* in shared.css — change the skin and the factory image changes with it
  const C = {
    floorLine: "var(--site-highlight)",
    pinkLight: "var(--site-pink-light)",
    pink: "var(--site-pink)",
    pinkMid: "var(--site-pink-mid)",
    coral: "var(--site-coral)",
    dark: "var(--site-dark)",
    dark2: "var(--site-dark-2)",
    skin: "var(--site-skin)",
    hair: "var(--site-hair)",
    white: "var(--kf-surface)",
    paper: "var(--site-paper)",
    shade: "var(--site-shade)",
    yellow: "var(--site-highlight)",
    wall: "var(--site-wall)",
    wall2: "var(--site-wall-2)",
    shadow: "var(--site-shadow-ink)",
  };
  const OX = 150;
  const OY = 400;
  const P = (x, y, z = 0) => [OX + (x - y) * 0.866, OY + (x + y) * 0.5 - z];
  const S = (pts) => pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    // Fill is a variable, so it is set via style rather than a presentation attribute
    for (const k in attrs) ["fill", "stroke", "font-family"].includes(k) && String(attrs[k]).startsWith("var(") ? n.style.setProperty(k, attrs[k]) : n.setAttribute(k, attrs[k]);
    parent?.append(n);
    return n;
  };
  const poly = (g, pts, fill, extra = {}) => el("polygon", { points: S(pts), fill, ...extra }, g);

  const box = (g, [x0, x1, y0, y1, z0, z1], { top, left, right }) => {
    poly(g, [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], top);
    poly(g, [P(x0, y1, z1), P(x1, y1, z1), P(x1, y1, z0), P(x0, y1, z0)], left);
    poly(g, [P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0), P(x1, y0, z0)], right);
  };

  const person = (g, x, y, { shirt = C.coral, hold = "none", flip = false } = {}) => {
    const [X, Y] = P(x, y);
    const p = el("g", { class: "bf-person" }, g);
    const s = flip ? -1 : 1;
    el("ellipse", { cx: X, cy: Y + 2, rx: 14, ry: 5, fill: C.shadow }, p);
    el("path", { d: `M${X - 4} ${Y - 44} L${X - 6} ${Y - 2} M${X + 4} ${Y - 44} L${X + 5} ${Y + 2}`, stroke: C.dark, "stroke-width": 6, "stroke-linecap": "round", fill: "none" }, p);
    el("rect", { x: X - 11, y: Y - 82, width: 22, height: 42, rx: 8, fill: shirt }, p);
    const arm = el("g", { class: "bf-arm", "data-ox": X + 8 * s, "data-oy": Y - 74 }, p);
    el("path", { d: `M${X + 8 * s} ${Y - 74} L${X + 20 * s} ${Y - 56}`, stroke: shirt, "stroke-width": 7, "stroke-linecap": "round" }, arm);
    el("circle", { cx: X + 21 * s, cy: Y - 54, r: 3.6, fill: C.skin }, arm);
    if (hold === "laptop") {
      poly(arm, [[X + 14 * s, Y - 60], [X + 34 * s, Y - 50], [X + 34 * s, Y - 66], [X + 14 * s, Y - 76]], C.dark2);
      poly(arm, [[X + 16 * s, Y - 62], [X + 32 * s, Y - 54], [X + 32 * s, Y - 64], [X + 16 * s, Y - 72]], C.white, { class: "bf-screen" });
    }
    if (hold === "paper") poly(arm, [[X + 16 * s, Y - 70], [X + 28 * s, Y - 64], [X + 28 * s, Y - 46], [X + 16 * s, Y - 52]], C.white);
    el("path", { d: `M${X - 8 * s} ${Y - 74} L${X - 14 * s} ${Y - 50}`, stroke: shirt, "stroke-width": 7, "stroke-linecap": "round" }, p);
    el("circle", { cx: X, cy: Y - 92, r: 10, fill: C.skin }, p);
    el("path", { d: `M${X - 10} ${Y - 92} q0 -14 11 -13 q10 0 9 9 q-6 -3 -12 -1 q-4 2 -8 5z`, fill: C.hair }, p);
    return p;
  };

  const robot = (g, x, y) => {
    const [X, Y] = P(x, y);
    const r = el("g", { class: "bf-robot" }, g);
    el("ellipse", { cx: X, cy: Y + 2, rx: 22, ry: 7, fill: C.shadow }, r);
    el("path", { d: `M${X - 20} ${Y - 4} q0 -40 20 -40 q20 0 20 40 q-20 10 -40 0z`, fill: C.pink }, r);
    el("path", { d: `M${X - 22} ${Y - 30} q-6 10 -2 22 M${X + 22} ${Y - 30} q6 10 2 22`, stroke: C.pinkMid, "stroke-width": 6, "stroke-linecap": "round", fill: "none" }, r);
    const head = el("g", { class: "bf-head" }, r);
    el("path", { d: `M${X - 17} ${Y - 46} q0 -20 17 -20 q17 0 17 20z`, fill: C.pinkLight }, head);
    el("rect", { x: X - 12, y: Y - 56, width: 24, height: 7, rx: 3.5, fill: C.dark }, head);
    el("circle", { cx: X - 5, cy: Y - 52.5, r: 1.8, fill: C.yellow, class: "bf-eye" }, head);
    el("circle", { cx: X + 5, cy: Y - 52.5, r: 1.8, fill: C.yellow, class: "bf-eye" }, head);
    el("path", { d: `M${X + 6} ${Y - 64} l8 -12`, stroke: C.dark, "stroke-width": 2 }, head);
    el("circle", { cx: X + 14, cy: Y - 76, r: 3, fill: C.coral, class: "bf-blink" }, head);
    return r;
  };

  const belt = (g, x0, x1, y0, y1, alongY = false) => {
    box(g, [x0, x1, y0, y1, 0, 48], { top: C.dark, left: C.pink, right: C.pinkMid });
    if (!alongY) {
      poly(g, [P(x0, y1, 48), P(x1, y1, 48), P(x1, y1, 40), P(x0, y1, 40)], C.dark);
      for (let x = x0 + 16; x < x1; x += 34) el("circle", { cx: P(x, y1, 28)[0], cy: P(x, y1, 28)[1], r: 3, fill: C.dark }, g);
    } else {
      poly(g, [P(x1, y0, 48), P(x1, y1, 48), P(x1, y1, 40), P(x1, y0, 40)], C.dark);
      for (let y = y0 + 16; y < y1; y += 34) el("circle", { cx: P(x1, y, 28)[0], cy: P(x1, y, 28)[1], r: 3, fill: C.dark }, g);
    }
  };

  const cube = (g, x, y, z, w, h, cls = "") => {
    const c = el("g", { class: cls }, g);
    box(c, [x - w / 2, x + w / 2, y - w / 2, y + w / 2, z, z + h], { top: C.white, left: C.paper, right: C.shade });
    return c;
  };

  const build = (root) => {
    // Like the original, scales the whole scene 1.22x and centers it so the art fills the screen
    const svg = el("g", { transform: "translate(-46.5 -117.7) scale(1.22)" }, root);
    const groups = [];
    const G = (step, cls = "") => {
      const g = el("g", { class: `bf-step ${cls}`, "data-step": step }, svg);
      groups.push(g);
      return g;
    };

    // 1 — Zone where ideas come in: dotted floor line, person at the whiteboard, light bulb
    const s1 = G(1);
    poly(s1, [P(21, -94), P(483, -94), P(483, 148), P(21, 148)], "none", { stroke: C.floorLine, "stroke-width": 6, "stroke-dasharray": "14 10" });
    poly(s1, [P(40, -80, 40), P(150, -80, 40), P(150, -80, 150), P(40, -80, 150)], C.pink);
    poly(s1, [P(40, -80, 40), P(40, -80, 150), P(40, -88, 150), P(40, -88, 40)], C.pinkMid);
    for (let i = 0; i < 3; i++) el("path", { d: `M${P(56, -80, 128 - i * 22).join(" ")} L${P(120 - i * 18, -80, 128 - i * 22).join(" ")}`, stroke: C.white, "stroke-width": 4, "stroke-linecap": "round" }, s1);
    person(s1, 81, -52, { hold: "paper", flip: true });
    const [bx, by] = P(81, -52, 128);
    const bulb = el("g", { class: "bf-idea" }, s1);
    el("circle", { cx: bx, cy: by, r: 22, fill: C.yellow, opacity: 0.35, class: "bf-glow" }, bulb);
    el("circle", { cx: bx, cy: by, r: 10, fill: C.yellow }, bulb);
    el("rect", { x: bx - 4, y: by + 9, width: 8, height: 6, rx: 1.5, fill: C.dark2 }, bulb);
    robot(s1, 157, -67);

    // 6 — the large box at the back (the always-answering admin cell). The front is open so the person and robot inside are visible
    const s6 = G(6, "bf-pm");
    const [x0, x1, y0, y1, H] = [258, 458, -289, -149, 240];
    poly(s6, [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)], C.wall);
    poly(s6, [P(x0, y0), P(x1, y0), P(x1, y0, H), P(x0, y0, H)], C.wall2);
    poly(s6, [P(x0, y0), P(x0, y1), P(x0, y1, H), P(x0, y0, H)], C.pink);
    person(s6, 320, -215, { hold: "laptop", shirt: C.pinkMid });
    person(s6, 395, -235, { shirt: C.coral });
    robot(s6, 420, -190);
    box(s6, [x0, x1, y1 - 14, y1 + 10, 58, 72], { top: C.pinkLight, left: C.pink, right: C.pinkMid });
    const ring = (pts) => `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L")}Z`;
    el("path", {
      d: ring([P(x0, y1, H), P(x1, y1, H), P(x1, y1), P(x0, y1)]) + ring([P(x0 + 22, y1, H - 26), P(x1 - 22, y1, H - 26), P(x1 - 22, y1, 72), P(x0 + 22, y1, 72)]),
      fill: C.pink,
      "fill-rule": "evenodd",
    }, s6);
    poly(s6, [P(x1, y0, H), P(x1, y1, H), P(x1, y1), P(x1, y0)], C.pinkMid);
    poly(s6, [P(x0, y0, H), P(x1, y0, H), P(x1, y1, H), P(x0, y1, H)], C.pinkLight);
    const sign = el("g", { class: "bf-sign" }, s6);
    // Each letter has a depth (bf-depth) below and a face (bf-face) on top — like the original, the depth grows from the top and the face grows late as it lights up
    [..."AI 24/7"].forEach((ch, i) => {
      const [ex, ey] = P(x0 + 18 + i * 25, (y0 + y1) / 2 + 16, H);
      const wrap = el("g", { class: "bf-letter" }, sign);
      const font = { "font-size": 46, "font-weight": 700, "font-family": "var(--kf-font-display)" };
      el("text", { transform: `matrix(.866 .5 -.866 .5 ${ex.toFixed(1)} ${(ey + 6).toFixed(1)})`, ...font, fill: C.coral }, el("g", { class: "bf-depth" }, wrap)).textContent = ch;
      el("text", { transform: `matrix(.866 .5 -.866 .5 ${ex.toFixed(1)} ${ey.toFixed(1)})`, ...font, fill: C.pinkMid }, el("g", { class: "bf-face" }, wrap)).textContent = ch;
    });

    // 2 — A questioning robot and a person holding a progress board
    const s2 = G(2);
    robot(s2, 240, -60);
    const [qx, qy] = P(240, -60, 104);
    const bub = el("g", { class: "bf-bubbles" }, s2);
    el("path", { d: `M${qx + 8} ${qy - 6} h30 a6 6 0 0 1 6 6 v20 a6 6 0 0 1 -6 6 h-20 l-8 8 v-8 a6 6 0 0 1 -6 -6 v-20 a6 6 0 0 1 6 -6z`, fill: C.white }, bub);
    el("text", { x: qx + 22, y: qy + 18, "font-size": 20, "font-weight": 700, fill: C.coral, "text-anchor": "middle", "font-family": "var(--kf-font-display)" }, bub).textContent = "?";
    el("path", { d: `M${qx + 26} ${qy + 40} h22 a5 5 0 0 1 5 5 v12 a5 5 0 0 1 -5 5 h-22 a5 5 0 0 1 -5 -5 v-12 a5 5 0 0 1 5 -5z`, fill: C.white }, bub);
    el("text", { x: qx + 37, y: qy + 55, "font-size": 14, "font-weight": 700, fill: C.dark, "text-anchor": "middle" }, bub).textContent = "…";
    person(s2, 323, -93, { hold: "laptop" });

    // 4 — Robot arm and stacked parcels (behind the conveyor)
    const s4 = G(4);
    [0, 1, 2].forEach((i) => cube(s4, 540, -60, i * 14, 34, 14));
    const [ax, ay] = P(560, -150);
    el("ellipse", { cx: ax, cy: ay, rx: 30, ry: 15, fill: C.pinkMid }, s4);
    el("rect", { x: ax - 30, y: ay - 18, width: 60, height: 18, fill: C.pinkMid }, s4);
    el("ellipse", { cx: ax, cy: ay - 18, rx: 30, ry: 15, fill: C.pink }, s4);
    el("rect", { x: ax - 9, y: ay - 52, width: 18, height: 36, rx: 6, fill: C.coral }, s4);
    const up = el("g", { class: "bf-arm-up", "data-ox": ax, "data-oy": ay - 50 }, s4);
    el("path", { d: `M${ax} ${ay - 50} L${ax + 34} ${ay - 112}`, stroke: C.pink, "stroke-width": 16, "stroke-linecap": "round" }, up);
    el("circle", { cx: ax, cy: ay - 50, r: 10, fill: C.pinkMid }, up);
    const fore = el("g", { class: "bf-arm-fore", "data-ox": ax + 34, "data-oy": ay - 112 }, up);
    el("path", { d: `M${ax + 34} ${ay - 112} L${ax + 92} ${ay - 98}`, stroke: C.pinkLight, "stroke-width": 12, "stroke-linecap": "round" }, fore);
    el("circle", { cx: ax + 34, cy: ay - 112, r: 9, fill: C.pinkMid }, fore);
    el("path", { d: `M${ax + 92} ${ay - 98} l6 14 M${ax + 92} ${ay - 98} l-6 14`, stroke: C.dark, "stroke-width": 4, "stroke-linecap": "round" }, fore);

    // 3 — Pillar behind the laser door
    const s3back = G(3);
    box(s3back, [470, 495, -24, -8, 0, 150], { top: C.pinkLight, left: C.pink, right: C.pinkMid });

    // Conveyor: stage 1·2·3 modules + a stage 5 module that bends toward the cloud
    belt(G(1), -40, 195, 0, 60);
    belt(G(2), 205, 420, 0, 60);
    belt(G(3), 430, 600, 0, 60);
    belt(G(5), 600, 660, -300, 60, true);

    // Boxes flowing on the conveyor — they switch on and off following the stage of where they are now
    const flow = el("g", { class: "bf-flow" }, svg);
    const boxes = [0, 1, 2, 3].map(() => {
      const c = el("g", {}, flow);
      box(c, [-13, 13, -13, 13, 0, 18], { top: C.white, left: C.paper, right: C.shade });
      return c;
    });

    // 3 — pillars, beam and light in front of the laser door
    const s3 = G(3);
    const laser = el("polygon", { points: S([P(482, -8, 140), P(482, 66, 140), P(482, 66, 48), P(482, -8, 48)]), fill: C.coral, opacity: 0.35, class: "bf-laser" }, s3);
    box(s3, [470, 495, 66, 82, 0, 150], { top: C.pinkLight, left: C.pink, right: C.pinkMid });
    box(s3, [468, 497, -26, 84, 150, 168], { top: C.pinkLight, left: C.pink, right: C.pinkMid });
    const [lx, ly] = P(482, 30, 168);
    el("ellipse", { cx: lx, cy: ly - 6, rx: 12, ry: 8, fill: C.yellow, class: "bf-warn" }, s3);
    el("ellipse", { cx: lx, cy: ly - 2, rx: 12, ry: 5, fill: C.dark }, s3);
    person(s3, 557, 112, { hold: "laptop" });
    robot(s3, 610, 150);
    laser.dataset.k = "laser";

    // 5 — Clouds and the person in front
    const s5 = G(5, "bf-cloud");
    const [cx, cy] = P(640, -350, 60);
    const cloud = el("g", { class: "bf-cloudbody" }, s5);
    [[-70, 18, 46], [-24, -10, 58], [34, -2, 52], [72, 22, 40], [0, 30, 50]].forEach(([dx, dy, r]) => el("circle", { cx: cx + dx, cy: cy + dy, r, fill: C.pink }, cloud));
    [[-50, 36, 34], [20, 40, 40], [66, 36, 28]].forEach(([dx, dy, r]) => el("circle", { cx: cx + dx, cy: cy + dy, r, fill: C.pinkMid, opacity: 0.55 }, cloud));
    [[-24, -16, 44], [34, -8, 38]].forEach(([dx, dy, r]) => el("circle", { cx: cx + dx, cy: cy + dy, r, fill: C.pinkLight }, cloud));
    person(s5, 720, -230, { hold: "laptop", flip: true });

    return { groups, boxes };
  };

  // Box path: starts above the step 1 module → along x to 630 → along y into the clouds (-330)
  const PATH_X = [-30, 630];
  const PATH_Y = [30, -330];
  const LEN = PATH_X[1] - PATH_X[0] + (PATH_Y[0] - PATH_Y[1]);
  const at = (d) => {
    const along = PATH_X[1] - PATH_X[0];
    if (d <= along) return [PATH_X[0] + d, PATH_Y[0]];
    return [PATH_X[1], PATH_Y[0] - (d - along)];
  };
  const stepOf = (x, y) => (y >= 0 ? (x < 200 ? 1 : x < 425 ? 2 : x < 600 ? 3 : 5) : y > -180 ? 4 : 5);

  window.SY_factory = (section) => {
    const svg = section.querySelector("[data-factory]");
    const { groups, boxes } = build(svg);
    const reduced = SY.reduced;
    const desk = matchMedia("(min-width: 1024px)");
    const steps = [...section.querySelectorAll(".bf__step")];
    const visual = section.querySelector(".bf__visual");
    const stage = section.querySelector(".bf__stage");
    let N = 6;

    const paint = () => {
      const lit = !desk.matches || reduced ? 6 : N;
      groups.forEach((g) => g.classList.toggle("is-off", Number(g.dataset.step) > lit));
    };

    // Things that keep spinning — only spin when visible
    const loops = gsap.timeline({ paused: true });
    const flowState = { d: 0 };
    loops.to(flowState, {
      d: LEN,
      duration: 14,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        const lit = !desk.matches || reduced ? 6 : N;
        boxes.forEach((b, i) => {
          const d = (flowState.d + (i * LEN) / boxes.length) % LEN;
          const [x, y] = at(d);
          const [X, Y] = P(x, y, 48);
          b.setAttribute("transform", `translate(${(X - OX).toFixed(1)} ${(Y - OY).toFixed(1)})`);
          b.style.opacity = stepOf(x, y) > lit ? 0.25 : 1;
        });
      },
    }, 0);
    const swing = (sel, from, to, dur) =>
      svg.querySelectorAll(sel).forEach((n, i) => {
        loops.fromTo(n, { rotation: from }, { rotation: to, svgOrigin: `${n.dataset.ox} ${n.dataset.oy}`, duration: dur, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.23 }, 0);
      });
    swing(".bf-arm", -6, 14, 0.9);
    swing(".bf-arm-up", -10, 12, 1.6);
    swing(".bf-arm-fore", 14, -12, 1.6);
    loops.to(svg.querySelectorAll(".bf-blink"), { opacity: 0.2, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)", stagger: 0.3 }, 0);
    loops.to(svg.querySelectorAll(".bf-head"), { y: -2, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.2 }, 0);
    loops.to(svg.querySelector(".bf-glow"), { attr: { r: 30 }, opacity: 0.15, duration: 1.1, repeat: -1, yoyo: true, ease: "sine.inOut" }, 0);
    loops.to(svg.querySelector(".bf-laser"), { opacity: 0.7, duration: 0.12, repeat: -1, yoyo: true, ease: "steps(2)", repeatDelay: 0.4 }, 0);
    loops.to(svg.querySelector(".bf-warn"), { opacity: 0.35, duration: 0.45, repeat: -1, yoyo: true, ease: "steps(1)" }, 0);
    loops.to(svg.querySelector(".bf-cloudbody"), { y: -5, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" }, 0);
    loops.to(svg.querySelector(".bf-bubbles"), { y: -4, duration: 1.3, repeat: -1, yoyo: true, ease: "sine.inOut" }, 0);
    loops.to(svg.querySelectorAll(".bf-screen"), { opacity: 0.55, duration: 0.7, repeat: -1, yoyo: true, ease: "steps(1)", stagger: 0.35 }, 0);
    loops.progress(0.001);

    // On entering step 6 the sign letters fall and bounce one by one — exactly as in the original: .11s letter gap · settle with a bounce over .72s (height 18~26px, skewed -.55 along the isometric axis),
    // grows .72→1 while thickness grows with back.out and the face turns on .22 later, and the 6.5px spread from the center gathers back. Once seated, it wobbles very slightly on a 4s cycle
    const LET_EACH = 0.11, LET_DUR = 0.72, LET_SPREAD = 6.5;
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const outQ = (v) => 1 - (1 - v) * (1 - v);
    const backO = (v) => 1 + 2.70158 * (v - 1) ** 3 + 1.70158 * (v - 1) ** 2;
    const bounceO = (v) => (v < 1 / 2.75 ? 7.5625 * v * v : v < 2 / 2.75 ? 7.5625 * (v -= 1.5 / 2.75) * v + 0.75 : v < 2.5 / 2.75 ? 7.5625 * (v -= 2.25 / 2.75) * v + 0.9375 : 7.5625 * (v -= 2.625 / 2.75) * v + 0.984375);
    const hash = (v) => { const s = Math.sin(v * 12.9898) * 43758.5453; return s - Math.floor(s); };
    const f2 = (v) => (Math.round(v * 100) / 100).toString();
    const around = (x, y, tf) => `translate(${f2(x)} ${f2(y)}) ${tf} translate(${f2(-x)} ${f2(-y)})`;
    const letters = [...svg.querySelectorAll(".bf-letter")].filter((w) => w.textContent.trim()).map((wrap, i) => {
      const depth = wrap.querySelector(".bf-depth"), face = wrap.querySelector(".bf-face");
      const b = wrap.getBBox(), fb = face.getBBox(), db = depth.getBBox();
      return { wrap, depth, face, i, cx: b.x + b.width / 2, cy: b.y + b.height / 2, top: { x: db.x + db.width / 2, y: db.y }, fc: { x: fb.x + fb.width / 2, y: fb.y + fb.height / 2 }, bob: 18 + 8 * hash(Math.min(i, 4) * 41 + 9) };
    });
    let signT0 = 0, signHeld = 0, signRun = false, signRaf = 0, signOn = false;
    const signNow = () => (signRun ? performance.now() / 1e3 - signT0 : signHeld);
    const drawSign = () => {
      const now = signNow(), n = letters.length;
      for (const L of letters) {
        const c = now - L.i * LET_EACH;
        let o = 1, s = 1, a = 1, dep = 1, fo = 1, fs = 1, l = 0;
        if (c < 0) (o = 0), (s = 1), (a = 0.72), (dep = 0.08), (fo = 0), (fs = 0.55), (l = 1);
        else if (c < LET_DUR) {
          const f = c / LET_DUR, d = clamp((f - 0.22) / 0.5);
          o = outQ(clamp(f / 0.28)); s = 1 - bounceO(f); a = 0.78 + 0.22 * outQ(clamp(f / 0.78)); dep = 0.08 + 0.92 * backO(clamp((f - 0.06) / 0.55));
          fo = outQ(d); fs = 0.62 + 0.38 * outQ(d); l = 1 - outQ(f);
        } else s = -Math.sin((now / 4) * Math.PI * 2) * 0.045;
        const y = L.bob * s, h = (L.i - (n - 1) / 2) * LET_SPREAD * l;
        L.wrap.setAttribute("opacity", f2(o));
        L.wrap.setAttribute("transform", around(L.cx, L.cy, `translate(${f2(-y * 0.55 + 0.866 * h)} ${f2(-y + 0.5 * h)}) scale(${f2(a)})`));
        dep >= 0.999 ? L.depth.removeAttribute("transform") : L.depth.setAttribute("transform", around(L.top.x, L.top.y, `scale(1 ${f2(Math.max(0.06, dep))})`));
        L.face.setAttribute("opacity", f2(fo));
        Math.abs(fs - 1) < 8e-4 ? L.face.removeAttribute("transform") : L.face.setAttribute("transform", around(L.fc.x, L.fc.y, `scale(${f2(fs)})`));
      }
    };
    const signLoop = () => { drawSign(); signRaf = requestAnimationFrame(signLoop); };
    const signPlay = () => { if (signRun) return; signT0 = performance.now() / 1e3 - signHeld; signRun = true; if (!signRaf) signLoop(); };
    const signPause = () => { if (!signRun) return; signHeld = signNow(); signRun = false; cancelAnimationFrame(signRaf); signRaf = 0; };
    const sign = (on) => {
      if (on === signOn || reduced) return;
      signOn = on;
      on ? signPlay() : signPause();
    };

    if (reduced) {
      paint();
      return;
    }

    new IntersectionObserver(([e]) => {
      e.isIntersecting ? loops.play() : loops.pause();
      e.isIntersecting ? signOn && signPlay() : signPause();
    }).observe(section);

    const active = () => {
      const lo = innerHeight * 0.3;
      const hi = innerHeight * 0.7;
      const mids = steps.map((s) => {
        const r = s.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      let idx = -1;
      mids.forEach((m, i) => m <= hi && m > lo && (idx = i));
      if (idx < 0) mids.forEach((m, i) => m <= hi && (idx = i));
      return idx;
    };

    let inside = false;
    let lastY = scrollY;
    let down = true;
    const ratio = () => {
      const r = visual.getBoundingClientRect();
      const seen = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      return seen / Math.min(r.height || innerHeight, innerHeight);
    };
    const show = (on, instant) => {
      const off = `translate3d(0, ${on === down ? 120 : -120}px, 0) scale(0.92)`;
      if (instant) {
        stage.style.transition = "none";
        stage.style.opacity = on ? "1" : "0";
        stage.style.transform = on ? "none" : off;
        stage.offsetWidth;
        stage.style.transition = "";
        return;
      }
      if (on) {
        stage.style.transition = "none";
        stage.style.opacity = "0";
        stage.style.transform = off;
        stage.offsetWidth;
        stage.style.transition = "";
        stage.style.opacity = "1";
        stage.style.transform = "none";
      } else {
        stage.style.opacity = "0";
        stage.style.transform = off;
      }
    };

    const tick = () => {
      const y = scrollY;
      if (y !== lastY) (down = y > lastY), (lastY = y);
      if (!desk.matches) {
        section.classList.remove("is-ready", "is-built");
        stage.style.opacity = "";
        stage.style.transform = "";
        N = 6;
        paint();
        return;
      }
      section.classList.add("is-ready", "is-built");
      const now = ratio() >= (inside ? 0.38 : 0.62);
      if (now !== inside) {
        inside = now;
        show(now, false);
      }
      const idx = active();
      steps.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      section.dataset.activeStep = String(idx + 1);
      const n = idx < 0 ? 6 : idx + 1;
      if (n !== N) {
        N = n;
        paint();
      }
      sign(N >= 6 && inside);
    };

    inside = desk.matches && ratio() >= 0.62;
    show(inside || !desk.matches, true);
    paint();
    gsap.ticker.add(tick);
    desk.addEventListener("change", () => show(true, true));
  };
})();
