// Interaction shared by every place: doodle drawing, steam line drawing, phone menu panel, booking modal, FAQ open and close.
// Entrance, transition, loader and booking strip are handled by motion parts (studio-appear·step-loop-carousel·logo-blur-loader·view-dock-rise).
(() => {
  const SVGNS = "http://www.w3.org/2000/svg";

  // Like the original hero image, hundreds of short curves fill a 376×400 board, and in the upper middle two eyes and two profile faces look at each other.
  // Drawn with a fixed-seed random so it is always the same picture — the loader (pale lines) and the hero (salmon color) use the same picture
  const seeded = (a) => () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const FACE = [
    "M146 98C150 87 162 82 171 86", "M157 112Q163 108 169 111", "M172 92C176 100 170 104 173 110C176 116 171 120 174 126",
    "M169 136Q173 142 166 148", "M147 127Q151 145 166 156", "M140 104C134 112 136 124 142 130",
    "M198 94C194 100 200 104 197 110C194 116 199 120 196 126", "M201 113Q207 109 214 112",
    "M206 98C210 91 217 95 215 101C213 106 219 109 223 104", "M219 113C223 119 227 121 231 116", "M200 141Q210 154 226 150",
    "M228 128C236 134 236 146 230 152",
  ];
  const EYES = [[164, 117], [205, 119]];
  const scribblePaths = () => {
    const rnd = seeded(37);
    const R = (a, b) => a + (b - a) * rnd();
    const out = [];
    const step = 29;
    for (let gy = 60; gy < 410; gy += step) {
      for (let gx = -6; gx < 388; gx += step) {
        const cx = gx + R(-6, 6), cy = gy + R(-6, 6);
        if (cx > 134 && cx < 238 && cy > 78 && cy < 162) continue;
        if (rnd() < 0.1) continue;
        const ang = R(0, Math.PI * 2), L = R(21, 40), c = Math.cos(ang), s = Math.sin(ang);
        const p = (x, y) => `${(cx + x * c - y * s).toFixed(1)} ${(cy + x * s + y * c).toFixed(1)}`;
        const t = rnd();
        if (t < 0.42) {
          const h = R(0.25, 0.55) * L * (rnd() < 0.5 ? -1 : 1);
          out.push(`M${p(-L / 2, 0)}Q${p(0, h * 1.6)} ${p(L / 2, 0)}`);
        } else if (t < 0.7) {
          const h = R(0.2, 0.4) * L;
          out.push(`M${p(-L / 2, 0)}C${p(-L / 6, h * 1.6)} ${p(L / 6, -h * 1.6)} ${p(L / 2, 0)}`);
        } else if (t < 0.86) {
          out.push(`M${p(-L / 2, 0)}Q${p(0, R(-2, 2))} ${p(L / 2, 0)}`);
        } else if (t < 0.94) {
          const h = R(0.3, 0.5) * L;
          out.push(`M${p(-L / 2, 0)}Q${p(0, h * 1.6)} ${p(L / 2, 0)}T${p(L * 0.85, -h * 0.5)}`);
        } else if (t < 0.97) {
          const r = R(5, 8);
          out.push(`M${p(r, 0)}A${r.toFixed(1)} ${r.toFixed(1)} 0 1 1 ${p(r * Math.cos(5.6), r * Math.sin(5.6))}`);
        } else {
          const r = R(6, 9);
          out.push(`M${p(-r, 0)}L${p(r, 0)}A${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${p(r * Math.cos(0.8), r * Math.sin(0.8))}`);
        }
      }
    }
    return out.concat(FACE);
  };
  // Steam — two twisted ribbon strands (center line waves, both edges cross over as they rise)
  const ribbon = (cx, amp, top, bottom, phase, wmax) => {
    const L = [], Rr = [];
    for (let y = bottom; y >= top; y -= 2) {
      const k = (bottom - y) / (bottom - top);
      const x = cx + amp * Math.sin(y / 11 + phase) * (0.6 + 0.4 * k);
      const w = wmax * Math.cos(y / 7 + phase * 1.7) * (1 - 0.5 * k);
      L.push(`${(x - w).toFixed(1)} ${y}`);
      Rr.push(`${(x + w).toFixed(1)} ${y}`);
    }
    return [`M${L.join("L")}`, `M${Rr.join("L")}`];
  };
  const STEAM = [...ribbon(24, 9, 4, 158, 0.4, 5), ...ribbon(46, 8, 40, 150, 2.1, 4.2)];
  const draw = (svg, list, eyes) => {
    if (svg.childElementCount) return;
    const frag = document.createDocumentFragment();
    for (const d of list) {
      const path = document.createElementNS(SVGNS, "path");
      path.setAttribute("d", d);
      frag.append(path);
    }
    for (const [x, y] of eyes || []) {
      const c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 2.2);
      frag.append(c);
    }
    svg.append(frag);
  };
  const scribble = scribblePaths();
  document.querySelectorAll("svg[data-scribble]").forEach((svg) => draw(svg, scribble, EYES));
  document.querySelectorAll("svg[data-steam]").forEach((svg) => draw(svg, STEAM));

  // Phone menu panel · booking modal — like the original STUDIO modal, the panel enters the frame right after the press, and from the next frame on it goes from transparent in .4s cubic-bezier(.4,.4,0,1)
  const menu = document.querySelector(".et-menu");
  const burger = document.querySelector("[data-menu-open]");
  const fade = (el, open) => {
    if (open) {
      el.classList.add("is-arming");
      requestAnimationFrame(() => {
        el.hidden = false;
        requestAnimationFrame(() => { el.classList.remove("is-arming"); el.classList.add("is-open"); });
      });
    } else {
      el.classList.remove("is-open");
      const done = () => { if (!el.classList.contains("is-open")) el.hidden = true; };
      el.addEventListener("transitionend", done, { once: true });
      setTimeout(done, 450);
    }
  };
  if (menu && burger) {
    // Original phone menu brings in its panel about 70ms after the press (STUDIO modal routing) — a bit more than one frame earlier than the booking modal (~90ms)
    burger.addEventListener("click", () => { setTimeout(() => fade(menu, true), 34); burger.setAttribute("aria-expanded", "true"); });
    menu.querySelectorAll("[data-menu-close]").forEach((b) => b.addEventListener("click", () => { fade(menu, false); burger.setAttribute("aria-expanded", "false"); }));
  }

  // Booking modal — opens from the header reserve link, the booking band and the fixed pill
  const modal = document.querySelector(".et-modal");
  if (modal) {
    document.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); fade(modal, true); }));
    modal.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", () => fade(modal, false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) fade(modal, false); });
  }

  // FAQ — original STUDIO fold: on press the answer opens immediately (no transition), the triangle flips and Q. turns bold. Only one open at a time (closes on outside press)
  const faqs = [...document.querySelectorAll(".et-faq")];
  faqs.forEach((f) => {
    const q = f.querySelector(".et-faq__q");
    q.addEventListener("click", () => {
      const open = f.classList.contains("is-close");
      faqs.forEach((o) => { o.classList.add("is-close"); o.querySelector(".et-faq__q").setAttribute("aria-expanded", "false"); });
      if (open) { f.classList.remove("is-close"); q.setAttribute("aria-expanded", "true"); }
    });
  });
})();
