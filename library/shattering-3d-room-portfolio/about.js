// About page: big name letter parallax · reading sentence (letters brighten across a ten-character width) · four-word rotator.
// Original values: name letter speed .1 + (i·7 mod 5)·.045 · reading progress (screen 82% − top edge)/(height + screen 30%) · per-word distance d gives opacity 1−.8d (if over 1, .2·(1.9−d)/.9), size 1−.09d, right shift d^1.6·1.6vw
// · The step switches with smoothstep in the middle 56% of its share, and when it changes the text bounces by −16% · −3° over .72s (38ms each)
(() => {
  if (RI.reduced) return;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const blue = () => getComputedStyle(document.documentElement).getPropertyValue("--site-blue-ink").trim();

  const name = document.querySelector(".ab-name");
  let lastT = -1;
  RI.ticks.add(() => {
    const gs = name ? name.querySelectorAll(".fx-g") : [];
    const t = Math.min(scrollY, innerHeight);
    if (!gs.length || t === lastT) return false;
    lastT = t;
    gs.forEach((g, i) => (g.style.translate = t ? `0 ${(-t * (0.1 + ((i * 7) % 5) * 0.045)).toFixed(1)}px` : ""));
    return false;
  });

  // Reading sentence — wrap each character and light up as many as the reading position covers
  const scrubs = [...document.querySelectorAll("[data-scrub]")].map((el) => {
    const chars = [], sr = document.createElement("span"), vis = document.createElement("span");
    sr.className = "ri-sr"; sr.textContent = el.textContent.trim();
    vis.setAttribute("aria-hidden", "true");
    const walk = (from, into) => from.childNodes.forEach((n) => {
      if (n.nodeType === 3) for (const ch of n.textContent) { const s = document.createElement("span"); s.className = "fx-s"; s.textContent = ch; chars.push(s); into.append(s); }
      else if (n.nodeName === "BR") into.append(document.createElement("br"));
      else if (n.nodeType === 1) { const c = n.cloneNode(false); into.append(c); walk(n, c); }
    });
    walk(el, vis);
    el.textContent = "";
    el.append(sr, vis);
    return { el, chars, shown: chars.map(() => -1), edge: chars.map(() => false) };
  });
  RI.ticks.add(() => {
    const h = innerHeight, c = blue();
    scrubs.forEach((s) => {
      const r = s.el.getBoundingClientRect();
      if (r.bottom < -h * 0.2 || r.top > h * 1.2) return;
      const p = clamp((h * 0.82 - r.top) / (r.height + h * 0.3), 0, 1), w = 10, d = p * (s.chars.length + w);
      s.chars.forEach((ch, i) => {
        const k = clamp((d - i) / w, 0, 1), o = Math.round((0.14 + 0.86 * smooth(k)) * 100) / 100, edge = k > 0 && k < 0.9;
        if (o === s.shown[i] && edge === s.edge[i]) return;
        s.shown[i] = o; s.edge[i] = edge;
        ch.style.opacity = o;
        ch.style.color = edge ? c : "";
      });
    });
    return false;
  });

  // Four-word rotator
  const box = document.querySelector(".ab-process");
  if (!box) return;
  const steps = [...box.querySelectorAll(".ab-step")], words = steps.map((s) => s.querySelector(".ab-step-word")), bodies = steps.map((s) => s.querySelector(".ab-step-body"));
  const mq = matchMedia("(min-width: 900px) and (min-height: 600px)");
  let pinned = false, at = -1, played = -1;
  box.style.setProperty("--steps", steps.length);
  words.forEach((w, i) => w.style.setProperty("--k", i));
  const bounce = (w) => { const c = blue(); w.querySelectorAll(".fx-g").forEach((g, i) => g.animate([{ transform: "none", color: c }, { transform: "translateY(-16%) rotate(-3deg)", color: c, offset: 0.35 }, { transform: "none" }], { duration: 720, delay: i * 38, easing: "cubic-bezier(.16, 1, .3, 1)" })); };
  const update = () => {
    if (!pinned) return false;
    const r = box.getBoundingClientRect(), len = Math.max(1, r.height - innerHeight);
    const p = clamp(-r.top / len, 0, 1) * (steps.length - 1), n = Math.min(Math.floor(p), steps.length - 2);
    const f = n + smooth(clamp((p - n - 0.22) / 0.56, 0, 1));
    box.style.setProperty("--f", f.toFixed(4));
    words.forEach((w, i) => {
      const d = Math.abs(i - f);
      w.style.opacity = (d <= 1 ? 1 - d * 0.8 : Math.max(0, (0.2 * (1.9 - d)) / 0.9)).toFixed(3);
      w.style.scale = (1 - Math.min(d, 2) * 0.09).toFixed(3);
      w.style.translate = `${(Math.min(d, 2) ** 1.6 * 1.6).toFixed(2)}vw 0`;
    });
    const k = Math.round(f);
    if (k !== at) { at = k; bodies.forEach((b, i) => (b.dataset.state = i < at ? "before" : i > at ? "after" : "active")); }
    if (at !== played && r.top < innerHeight * 0.5) {
      if (played !== -1) bounce(words[at]);
      played = at;
      bodies[at].querySelectorAll("[data-fx]").forEach((el, i) => RI.fxRun(el, 120 + i * 60));
    }
    return false;
  };
  const arm = () => {
    pinned = mq.matches;
    box.classList.toggle("is-pinned", pinned);
    at = played = -1;
    bodies.forEach((b) => b.toggleAttribute("data-fx-manual", pinned));
    if (!pinned) { words.forEach((w) => { w.style.opacity = w.style.scale = w.style.translate = ""; }); bodies.forEach((b) => delete b.dataset.state); }
  };
  mq.addEventListener("change", arm);
  arm();
  RI.ticks.add(update);
})();
