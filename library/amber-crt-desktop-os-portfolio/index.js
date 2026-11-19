// Desktop — draws the five pictures a particle portrait reads in clothing colors (photo slot: a cut-out photo goes in for real), and links corner menu · career · profile screen · contact window
(() => {
  const css = getComputedStyle(document.documentElement), v = (n) => css.getPropertyValue(n).trim();
  const INK = v("--kf-ink"), AMBER = v("--kf-ink-soft"), EMBER = v("--kf-accent"), RUST = v("--kf-accent-soft");

  // Image slot — particles light up more and further forward in bright, warm areas, so paint faces and hands bright and clothes dark
  const shade = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; };
  const blob = (g, x, y, rx, ry, fill) => { g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  const bust = (g, { head = [190, 150, 62, 76], body = true } = {}) => {
    if (body) {
      g.fillStyle = shade(g, 0, 250, 0, 475, [EMBER, RUST]);
      g.beginPath(); g.moveTo(60, 475); g.bezierCurveTo(70, 320, 120, 270, 190, 262); g.bezierCurveTo(260, 270, 310, 320, 320, 475); g.fill();
    }
    blob(g, head[0], head[1] + head[3] * 0.95, 26, 30, shade(g, 0, head[1] + 40, 0, head[1] + 120, [AMBER, EMBER]));
    blob(g, head[0], head[1], head[2], head[3], shade(g, head[0] - head[2], head[1] - head[3], head[0] + head[2], head[1] + head[3], [INK, AMBER, EMBER]));
    blob(g, head[0], head[1] - head[3] * 0.62, head[2] * 1.02, head[3] * 0.45, RUST);
  };
  const hand = (g, x, y, s, rot) => {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    g.fillStyle = shade(g, 0, -70, 0, 60, [INK, AMBER]);
    g.beginPath(); g.roundRect(-26, -10, 52, 64, 14); g.fill();
    [-20, -7, 6, 19].forEach((fx, i) => { g.beginPath(); g.roundRect(fx - 6, -62 + Math.abs(i - 1.5) * 8, 12, 58, 6); g.fill(); });
    g.beginPath(); g.roundRect(22, 4, 34, 12, 6); g.fill();
    g.fillStyle = shade(g, 0, 50, 0, 160, [AMBER, EMBER]); g.fillRect(-18, 50, 36, 120);
    g.restore();
  };
  const frame = (g, x, y, w, h, rot) => {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.fillStyle = AMBER; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 6); g.fill();
    g.fillStyle = RUST; g.fillRect(-w / 2 + 6, -h / 2 + 14, w - 12, h - 20);
    g.fillStyle = INK; g.fillRect(-w / 2, -h / 2, w, 10);
    blob(g, w / 4, 0, w / 9, w / 9, INK);
    g.restore();
  };
  const draw = {
    hello: (g) => { bust(g); hand(g, 70, 150, 1.25, -0.25); },
    projets: (g) => { bust(g, { head: [190, 175, 56, 70] }); hand(g, 70, 270, 1, -0.6); hand(g, 315, 300, 1, 0.5); frame(g, 95, 80, 90, 72, -0.15); frame(g, 300, 90, 92, 74, 0.12); frame(g, 300, 200, 84, 66, 0.08); frame(g, 120, 330, 62, 50, -0.3); },
    parcours: (g) => {
      g.fillStyle = shade(g, 0, 330, 0, 475, [AMBER, RUST]); g.fillRect(20, 350, 340, 26);
      g.fillStyle = INK; g.beginPath(); g.roundRect(190, 190, 150, 110, 8); g.fill();
      g.fillStyle = RUST; g.fillRect(200, 200, 130, 88);
      blob(g, 130, 170, 54, 66, shade(g, 70, 100, 190, 230, [INK, AMBER, EMBER]));
      g.fillStyle = shade(g, 0, 230, 0, 475, [EMBER, RUST]); g.beginPath(); g.moveTo(40, 475); g.bezierCurveTo(50, 300, 90, 250, 140, 250); g.bezierCurveTo(200, 260, 230, 330, 240, 360); g.lineTo(200, 475); g.fill();
    },
    profil: (g) => { bust(g, { head: [190, 200, 110, 135] }); },
    contact: (g) => {
      bust(g, { head: [175, 150, 60, 74] });
      g.save(); g.translate(250, 160); g.rotate(0.35);
      g.fillStyle = INK; g.beginPath(); g.roundRect(-20, -70, 40, 140, 12); g.fill();
      g.restore();
      hand(g, 268, 230, 0.9, 0.3);
      g.strokeStyle = AMBER; g.lineWidth = 6; g.beginPath(); g.moveTo(255, 230); g.bezierCurveTo(330, 330, 200, 420, 260, 470); g.stroke();
    },
  };
  document.querySelectorAll('.e-home canvas[data-fx-part="shape"]').forEach((c) => {
    const g = c.getContext("2d");
    if (g && draw[c.dataset.key]) draw[c.dataset.key](g);
  });
  // Only where the cursor has passed, the original picture shows through between strokes (fluid handprint of the original portrait)
  window.eddyTrail?.plane(document.querySelector(".e-home"));

  // Corner menu — only the hovered one gets cream text + an Enter band (original is-on)
  const home = document.querySelector(".e-home"), picks = [...document.querySelectorAll(".e-hall .hs")];
  const mark = (b) => picks.forEach((p) => p.classList.toggle("is-on", p === b));
  picks.forEach((b) => { b.addEventListener("pointerenter", () => mark(b)); b.addEventListener("focus", () => mark(b)); });

  // Switching screens — #parcours·#profil bring up that screen instead of the desktop and turn on the path line. Esc and the ~/Desktop in the path return back.
  const views = [...document.querySelectorAll(".e-view")], here = document.querySelector("[data-sub-here]");
  const NAMES = { parcours: "Career.log", profil: "Profile.sys" };
  const route = () => {
    const name = location.hash.slice(1);
    const view = views.find((x) => x.dataset.view === name);
    views.forEach((x) => (x.hidden = x !== view));
    home.hidden = !!view;
    document.body.classList.toggle("has-sub", !!view);
    if (view) {
      here.textContent = NAMES[name];
      view.querySelectorAll('[data-fx~="frame-step-reveal"]').forEach((el) => el.dispatchEvent(new Event("fx:replay")));
      if (name === "parcours") pickPanel(at, true);
    } else {
      home.querySelectorAll('[data-fx~="frame-step-reveal"]').forEach((el) => el.dispatchEvent(new Event("fx:replay")));
    }
    if (name === "contact") { history.replaceState(null, "", location.pathname); openContact(); }
  };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-view-go]");
    if (t) { e.preventDefault(); location.hash = t.dataset.viewGo; document.querySelector(".e-menu.is-open")?.classList.remove("is-open"); }
    if (e.target.closest("[data-home-go]")) location.hash = "";
  });
  document.addEventListener("site:home", () => { if (location.hash) location.hash = ""; });
  addEventListener("hashchange", route);

  // Career — pick a board with a cell (box in the branch diagram) or ←→ and the row pushes that board to center
  const row = document.querySelector("[data-log-row]"), panels = [...row.children], nodes = [...document.querySelectorAll(".e-log__rail .node")], cmd = document.querySelector("[data-log-cmd]");
  let at = 0;
  const pickPanel = (i, now) => {
    at = Math.max(0, Math.min(panels.length - 1, i));
    const p = panels[at], step = p.offsetWidth + parseFloat(getComputedStyle(row).columnGap || 0);
    gsap.to(row, { x: -at * step, duration: now ? 0 : 0.6, ease: "power3.out", overwrite: true });
    panels.forEach((x, j) => x.classList.toggle("is-on", j === at));
    nodes.forEach((x, j) => x.classList.toggle("is-on", j === at));
    cmd.textContent = `git checkout ${p.dataset.hash} --detach && git show ${p.dataset.hash}`;
  };
  nodes.forEach((n) => n.addEventListener("click", () => pickPanel(+n.dataset.node)));
  panels.forEach((p, j) => p.addEventListener("click", () => pickPanel(j)));
  document.addEventListener("keydown", (e) => {
    if (location.hash !== "#parcours") return;
    if (e.key === "ArrowRight") pickPanel(at + 1);
    if (e.key === "ArrowLeft") pickPanel(at - 1);
  });

  // Contact — a letter window and a shortcut window open side by side and blur the desktop. Closing the letter window closes both
  const mail = document.querySelector('[data-win="contact"]'), links = document.querySelector('[data-win="contact-links"]'), veil = document.querySelector("[data-veil]");
  const openContact = () => {
    links.dispatchEvent(new Event("fx:open"));
    mail.dispatchEvent(new Event("fx:open"));
    veil.classList.add("is-on");
    document.body.classList.add("has-sub");
    here.textContent = "Contact.app";
    requestAnimationFrame(() => {
      const W = innerWidth, H = innerHeight, mw = mail.offsetWidth, lw = links.offsetWidth;
      if (W < 900) { gsap.set(mail, { x: (W - mw) / 2, y: Math.max(80, (H - mail.offsetHeight) / 2) }); gsap.set(links, { autoAlpha: 0 }); return; }
      const x = Math.max(12, (W - (mw + 26 + lw)) / 2), y = Math.max(84, (H - mail.offsetHeight) / 2 - 20);
      gsap.set(mail, { x, y });
      gsap.set(links, { x: x + mw + 26, y: y + 24 });
    });
  };
  window.eddyPageOpen = (name) => (name === "contact" ? (openContact(), true) : false);
  mail.addEventListener("fx:close", () => {
    links.dispatchEvent(new Event("fx:close"));
    veil.classList.remove("is-on");
    if (!location.hash) document.body.classList.remove("has-sub");
  });
  veil.addEventListener("click", () => mail.dispatchEvent(new Event("fx:close")));

  document.addEventListener("site:enter", route, { once: true });
})();
