// Shared across the whole site — hand-drawn character (four frames swapped every 0.5 seconds for a boiling line), confetti ribbons, menu icon, header bar hiding, menu drawer and dropdown,
// Follow-section hop, phone bottom reservation bar, back to top. Values are the original common.js as is (default curve power2.out).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power2.out" });
  const J = (window.J = {});
  const phone = () => innerWidth < 768;
  J.phone = phone;

  // Same seed gives the same picture — so the confetti doesn’t change every time it opens
  J.rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hash = (s) => [...s].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7);

  // Turns the vertex list into a confetti cut-out outline with only the corners rounded
  const smooth = (pts) => {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let d = `M${mid(pts[n - 1], pts[0]).map((v) => v.toFixed(1)).join(" ")}`;
    for (let i = 0; i < n; i++) {
      const p = pts[i], m = mid(p, pts[(i + 1) % n]);
      d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
    }
    return d + "Z";
  };
  const arc = (cx, cy, r, a0, a1, n, wob = 0, rnd = Math.random) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((a0 + ((a1 - a0) * i) / (n - 1)) * Math.PI) / 180, rr = r + (rnd() - 0.5) * wob;
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    });

  // Six characters — not copying the original art, but redrawn with the same silhouette feel (tree · lollipop · dinosaur head · hourglass · hand · C bug)
  const CHARA = {
    green: { pts: [[50, 4], [63, 17], [56, 21], [74, 31], [61, 37], [80, 50], [63, 55], [82, 70], [59, 74], [55, 79], [55, 116], [45, 116], [45, 79], [41, 74], [18, 70], [37, 55], [20, 50], [39, 37], [26, 31], [44, 21], [37, 17]], eyes: [[43, 42], [56, 44]] },
    orange: { pts: () => arc(50, 40, 38, 0, 350, 22, 5, J.rng(3)).concat([[56, 76], [57, 116], [43, 116], [44, 76]]), eyes: [[38, 36], [56, 34]] },
    red: { pts: [[30, 112], [27, 82], [18, 60], [17, 38], [27, 17], [48, 7], [69, 11], [82, 26], [80, 42], [66, 47], [78, 55], [64, 59], [76, 68], [60, 71], [68, 83], [51, 85], [53, 112]], eyes: [[55, 24], [68, 27]] },
    purple: { pts: [[18, 5], [82, 5], [77, 21], [61, 50], [65, 80], [84, 115], [16, 115], [35, 80], [39, 50], [23, 21]], eyes: [[43, 22], [58, 22]] },
    gray: { pts: [[16, 112], [12, 74], [6, 44], [12, 32], [22, 40], [27, 62], [31, 30], [33, 10], [45, 8], [47, 32], [50, 56], [56, 22], [62, 8], [73, 12], [71, 40], [69, 58], [80, 36], [92, 38], [89, 64], [80, 92], [84, 112]], eyes: [[36, 82], [51, 84]] },
    blue: { pts: () => arc(52, 62, 46, -40, 225, 16, 2, J.rng(9)).concat(arc(52, 62, 22, 225, -40, 12, 1.5, J.rng(11))), eyes: [[78, 22], [90, 30]] },
  };
  J.chara = (color) => {
    const c = CHARA[color];
    if (!c) return "";
    const base = typeof c.pts === "function" ? c.pts() : c.pts;
    let frames = "";
    for (let f = 1; f <= 4; f++) {
      const r = J.rng(hash(color) + f * 101);
      const pts = base.map(([x, y]) => [x + (r() - 0.5) * 3.2, y + (r() - 0.5) * 3.2]);
      const eyes = c.eyes.map(([x, y]) => {
        const ex = x + (r() - 0.5) * 1.6, ey = y + (r() - 0.5) * 1.6;
        return `<circle class="eye" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="6"/><circle class="pupil" cx="${(ex + 1.4).toFixed(1)}" cy="${(ey + 0.6).toFixed(1)}" r="3.3"/>`;
      }).join("");
      frames += `<g data-f="${f}"><path fill="currentColor" d="${smooth(pts)}"/>${eyes}</g>`;
    }
    return `<svg viewBox="-6 -2 112 124" aria-hidden="true">${frames}</svg>`;
  };
  const paintCharas = (root = document) =>
    root.querySelectorAll(".c-character").forEach((el) => {
      if (el.dataset.drawn) return;
      const color = ["red", "orange", "purple", "blue", "green", "gray"].find((k) => el.classList.contains(`-${k}`));
      let span = el.querySelector("span");
      if (!span) { span = document.createElement("span"); el.append(span); }
      span.innerHTML = J.chara(color);
      el.dataset.drawn = "1";
    });

  // Confetti pieces — triangle, circle, semicircle, bar, zigzag, droplet
  const COLORS = ["red", "orange", "purple", "blue", "green", "gray"];
  const piece = (r, x, y, s, cols = COLORS) => {
    const col = `var(--site-${cols[Math.floor(r() * cols.length)]})`, rot = Math.floor(r() * 360), k = Math.floor(r() * 6);
    const t = `transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${rot})"`;
    if (k === 0) return `<path ${t} style="fill:${col}" d="M0 ${-s}L${s * 0.9} ${s * 0.6}L${-s * 0.9} ${s * 0.6}Z"/>`;
    if (k === 1) return `<circle ${t} style="fill:${col}" r="${(s * 0.7).toFixed(0)}"/>`;
    if (k === 2) return `<path ${t} style="fill:${col}" d="M${-s} 0A${s} ${s} 0 0 1 ${s} 0Z"/>`;
    if (k === 3) return `<rect ${t} style="fill:${col}" x="${-s}" y="${-s * 0.22}" width="${s * 2}" height="${s * 0.44}" rx="${s * 0.22}"/>`;
    if (k === 4) return `<path ${t} style="fill:none;stroke:${col}" stroke-width="${(s * 0.32).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" d="M${-s} 0L${-s / 2} ${-s / 2}L0 0L${s / 2} ${-s / 2}L${s} 0"/>`;
    return `<path ${t} style="fill:${col}" d="M0 ${-s}C${s} ${-s * 0.2} ${s * 0.6} ${s} 0 ${s}S${-s} ${-s * 0.2} 0 ${-s}Z"/>`;
  };
  // data-confetti="band"(One line following the wave) | "scatter"(Evenly scattered) | "edge"(top and bottom edges only), data-confetti-size piece size, data-seed,
  // data-confetti-colors="beige pale" Giving a color name like this applies only that color (background pattern), data-confetti-density sets the scatter density multiplier
  J.confetti = (el) => {
    const W = 1440, H = Math.max(40, Math.round((el.offsetHeight / Math.max(1, el.offsetWidth)) * W));
    const mode = el.dataset.confetti || "band", size = +(el.dataset.confettiSize ?? 26), r = J.rng(+(el.dataset.seed ?? 1));
    const cols = el.dataset.confettiColors ? el.dataset.confettiColors.split(" ") : COLORS;
    let out = "";
    if (mode === "band") {
      const n = Math.round(W / (size * 2.1));
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5) * (W / n) + (r() - 0.5) * size, y = H / 2 + Math.sin((x / W) * Math.PI * 3) * H * 0.18 + (r() - 0.5) * H * 0.3;
        out += piece(r, x, y, size * (0.7 + r() * 0.6), cols);
      }
    } else {
      const n = Math.round(((W * H) / (size * size * (mode === "edge" ? 9 : 16))) * +(el.dataset.confettiDensity ?? 1));
      for (let i = 0; i < n; i++) {
        let y = r() * H;
        if (mode === "edge") y = r() < 0.5 ? r() * H * 0.22 : H - r() * H * 0.22;
        out += piece(r, r() * W, y, size * (0.6 + r() * 0.7), cols);
      }
    }
    el.querySelector(":scope > svg.j-confetti")?.remove();
    el.insertAdjacentHTML("afterbegin", `<svg class="j-confetti" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${out}</svg>`);
  };

  // Menu icon: off is a single beige, on (hover) is confetti colors
  const ICON = {
    features: (a, b) => `<path style="fill:${a}" d="M8 44V22C8 11 16 4 24 4s16 7 16 18v22H30V26a6 6 0 0 0-12 0v18Z"/><circle style="fill:${b}" cx="24" cy="15" r="3"/>`,
    activity: (a, b) => `<path style="fill:${a}" d="M14 8l6 10H8Z"/><circle style="fill:${b}" cx="33" cy="14" r="7"/><path style="fill:${b}" d="M9 26h12v14H9Z"/><path style="fill:${a}" d="M33 25c6 0 8 6 8 9s-3 7-8 7-8-4-8-7 2-9 8-9Z"/>`,
    guide: (a, b) => `<path style="fill:${a}" d="M24 6a12 12 0 0 1 7 22v6H17v-6a12 12 0 0 1 7-22Z"/><path style="fill:${b}" d="M18 37h12v4H18Z"/><path style="fill:${b}" d="M20 43h8v2h-8Z"/>`,
    gourmet: (a, b) => `<path style="fill:${a}" d="M12 6h2v10h2V6h2v10h2V6h2v12a5 5 0 0 1-4 5v21h-4V23a5 5 0 0 1-4-5Z"/><path style="fill:${b}" d="M32 6c5 2 6 10 6 16h-3v22h-4V6Z"/>`,
    access: (a, b) => `<path style="fill:${a}" d="M24 4a13 13 0 0 1 13 13c0 10-13 27-13 27S11 27 11 17A13 13 0 0 1 24 4Z"/><circle style="fill:${b}" cx="24" cy="17" r="5"/>`,
    ticket: (a, b) => `<path style="fill:${a}" d="M6 14h36v7a3 3 0 0 0 0 6v7H6v-7a3 3 0 0 0 0-6Z"/><path style="fill:${b}" d="M28 16h2v16h-2Z"/>`,
    cafe: (a, b) => `<path style="fill:${a}" d="M9 18h24v10a12 12 0 0 1-24 0Z"/><path style="fill:${b}" d="M33 21h3a5 5 0 0 1 0 10h-3v-3h3a2 2 0 0 0 0-4h-3Z"/><path style="fill:${b}" d="M16 6c3 3-2 5 1 9h-3c-3-4 2-6-1-9Z"/>`,
    restaurant: (a, b) => `<path style="fill:${a}" d="M6 24h36a18 18 0 0 1-36 0Z"/><path style="fill:${b}" d="M30 6l3 1-6 15h-3Z"/><path style="fill:${b}" d="M36 8l3 1-8 13h-3Z"/>`,
    library: (a, b) => `<path style="fill:${a}" d="M8 8h9v32H8Z"/><path style="fill:${b}" d="M19 12h8v28h-8Z"/><path style="fill:${a}" d="M29 9l7-2 6 30-7 2Z"/>`,
    shop: (a, b) => `<path style="fill:${a}" d="M10 16h28l-3 26H13Z"/><path style="fill:none;stroke:${b}" stroke-width="3" d="M17 20v-6a7 7 0 0 1 14 0v6"/>`,
  };
  const ICON_ON = { features: ["red", "orange"], activity: ["purple", "blue"], guide: ["orange", "gray"], gourmet: ["green", "red"], access: ["blue", "orange"], ticket: ["red", "purple"], cafe: ["orange", "blue"], restaurant: ["green", "red"], library: ["blue", "orange"], shop: ["purple", "red"] };
  const paintIcons = (root = document) =>
    root.querySelectorAll(".j-nav__pict[data-icon]").forEach((el) => {
      const k = el.dataset.icon, f = ICON[k];
      if (!f || el.firstElementChild) return;
      const [x, y] = ICON_ON[k];
      el.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true">${f("var(--site-beige)", "var(--kf-dim)")}</svg><svg viewBox="0 0 48 48" aria-hidden="true">${f(`var(--site-${x})`, `var(--site-${y})`)}</svg>`;
    });

  // Current page menu uses the lit icon (original -current)
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(`.j-nav__item[href="${here}"]`).forEach((a) => a.classList.add("-current"));

  J.init = (root = document) => { paintCharas(root); paintIcons(root); root.querySelectorAll("[data-confetti]").forEach(J.confetti); };
  J.init();
  let rw = innerWidth;
  addEventListener("resize", () => { if (Math.abs(innerWidth - rw) < 2) return; rw = innerWidth; document.querySelectorAll("[data-confetti]").forEach(J.confetti); });

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { reduce } = ctx.conditions;
    J.reduce = reduce;

    // Hand-drawn boiling — original: every 0.5s data-type is randomly 0~4 (0 is the first frame)
    const charas = document.querySelectorAll(".c-character");
    let boil;
    if (!reduce && charas.length) {
      const tick = () => { charas.forEach((el) => (el.dataset.type = Math.floor(Math.random() * 5) || 1)); boil = gsap.delayedCall(0.5, tick); };
      tick();
    }

    // Follow — title and icon rise 30px from below with back.out, characters start from the center, then hop 35px one by one
    const follow = document.querySelector(".c-follow");
    if (follow) {
      const kids = [...follow.querySelectorAll(".c-follow__sns .c-character span")];
      const title = follow.querySelector(".c-follow__title"), insta = follow.querySelector(".c-follow__insta");
      if (reduce) gsap.set([title, insta, ...kids], { opacity: 1, y: 0 });
      else {
        gsap.set([title, insta], { opacity: 0, y: 30 });
        gsap.set(kids, { opacity: 0, y: 30 });
        ScrollTrigger.batch(follow, {
          start: "top 70%", once: true,
          onEnter: () => gsap.timeline()
            .to([title, insta], { opacity: 1, y: 0, duration: 0.2, stagger: 0.1, ease: "back.out" })
            .to(kids, { opacity: 1, y: 0, duration: 0.2, delay: 0.2, stagger: { each: 0.1, from: "center" }, ease: "back.out" })
            .call(() => kids.forEach((k, i) => gsap.timeline().to(k, { y: -35, duration: 0.15, delay: 0.05 * i + 0.2, ease: "power2.out" }).to(k, { y: 0, duration: 0.15, ease: "power2.in" }))),
        });
      }
    }
    return () => boil && boil.kill();
  });

  // Header band — hides when scrolling down (past 60px, phone 30px) and shows when scrolling up. Phone bottom booking bar past 10px
  const header = document.querySelector(".j-header"), burger = document.querySelector(".j-burger"), gnav = document.querySelector(".j-gnav");
  const conv = document.querySelector(".c-conversion");
  let last = scrollY, dir = "", t0 = 0;
  addEventListener("scroll", () => {
    const now = performance.now();
    if (now - t0 < 20) return;
    t0 = now;
    const y = scrollY, border = window._jnp_topBorder || (phone() ? 30 : 60);
    conv && conv.classList.toggle("-show", y > 10);
    if (J.menuOpen) return;
    if (y > last) { if (dir !== "down" && y > border) { dir = "down"; header?.classList.add("-hide"); burger?.classList.add("-hide"); } }
    else if (y < last && dir !== "up") { dir = "up"; header?.classList.remove("-hide"); burger?.classList.remove("-hide"); }
    last = y;
  }, { passive: true });

  // Menu drawer — 0.4s from the right, backdrop veil too. Closes with Esc
  const setMenu = (open) => {
    J.menuOpen = open;
    gnav?.classList.toggle("-open", open);
    burger?.classList.toggle("-open", open);
    burger?.setAttribute("aria-expanded", open);
  };
  burger?.addEventListener("click", () => setMenu(!J.menuOpen));
  document.querySelector(".j-gnav__bg")?.addEventListener("click", () => setMenu(false));
  addEventListener("keydown", (e) => e.key === "Escape" && J.menuOpen && setMenu(false));

  // Dropdown: appears in 0.2s on hover and disappears when leaving the panel
  document.querySelectorAll(".j-nav__item.-over").forEach((item) => {
    const over = item.querySelector(".j-nav__over");
    item.addEventListener("mouseover", () => gsap.to(over, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }));
    over.addEventListener("mouseleave", () => gsap.to(over, { autoAlpha: 0, duration: 0.2, ease: "power1.out" }));
  });

  // Back to top and inner anchors — 0.7s power2.inOut
  document.querySelectorAll(".js-anchor").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.getAttribute("href"), t = id && id.length > 1 ? document.querySelector(id) : null;
      const y = t ? t.getBoundingClientRect().top + scrollY - 20 : 0;
      gsap.to(document.scrollingElement, { scrollTop: y, duration: J.reduce ? 0 : 0.7, ease: "power2.inOut" });
    }),
  );

  // Video modal: opens in 0.3s, and on close rests 0.1s then runs 0.3s
  const modal = document.querySelector(".movie-modal");
  if (modal) {
    let open = false;
    const close = () => { gsap.to(modal, { display: "none", autoAlpha: 0, delay: 0.1, duration: 0.3 }); open = false; };
    document.querySelectorAll(".js-play-movie").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); gsap.to(modal, { display: "block", autoAlpha: 1, duration: 0.3 }); open = true; }));
    modal.querySelector(".modal-close")?.addEventListener("click", close);
    modal.addEventListener("click", (e) => e.target.classList.contains("modal-inner") && close());
    addEventListener("keydown", (e) => e.key === "Escape" && open && close());
  }

  // Original re-measures positions after all images have loaded — same result even if fonts arrive late
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
