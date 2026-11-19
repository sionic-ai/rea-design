// A 56-frame brush-stroke sprite mask is stepped over the title block with steps(55) to paint it in at once, while the letters enter from 50px aside at .018s intervals. fx:out erases it in reverse
(() => {
  let SPRITE = null;
  const sprite = () => {
    if (SPRITE) return SPRITE;
    const F = 56, W = 160, H = 90, c = document.createElement("canvas");
    c.width = F * W; c.height = H;
    const g = c.getContext("2d");
    let s = 11;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const rows = 14, rh = H / rows, lag = Array.from({ length: rows }, () => rnd() * 0.32), wob = Array.from({ length: rows }, () => rnd() * 6);
    const drops = Array.from({ length: 50 }, () => ({ x: rnd(), y: rnd(), r: 1.5 + rnd() * 5, t: rnd() * 0.8 }));
    g.fillStyle = "#fff"; /* Not skin: mask alpha plate — only painted areas show */
    for (let f = 0; f < F; f++) {
      const p = f / (F - 1);
      g.save(); g.beginPath(); g.rect(f * W, 0, W, H); g.clip(); g.translate(f * W, 0);
      if (f === F - 1) g.fillRect(0, 0, W, H);
      else {
        for (let r = 0; r < rows; r++) {
          const e = (p * 1.5 - lag[r]) * W;
          if (e <= 0) continue;
          const y = r * rh - 1, h = rh + 2;
          g.beginPath(); g.moveTo(0, y); g.lineTo(e - wob[r], y); g.quadraticCurveTo(e + rh * 0.8, y + h * 0.5, e - wob[r] * 0.5, y + h); g.lineTo(0, y + h); g.closePath(); g.fill();
        }
        drops.forEach((d) => { if (p > d.t) { g.beginPath(); g.arc(d.x * W, d.y * H, d.r * Math.min(1, (p - d.t) * 4), 0, Math.PI * 2); g.fill(); } });
      }
      g.restore();
    }
    return (SPRITE = `url(${c.toDataURL("image/png")})`);
  };
  // Split letters only inside word chunks — leave the spaces between as they are so multi-line Korean doesn’t break mid-word
  const split = (el) => {
    const chars = [];
    const walk = (n) => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
        parts.forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          const word = document.createElement("span");
          word.className = "fx-sbt-word";
          for (const ch of w) { const c = document.createElement("span"); c.className = "fx-sbt-char"; c.textContent = ch; word.appendChild(c); chars.push(c); }
          frag.appendChild(word);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains("fx-sbt-char")) Array.from(n.childNodes).forEach(walk);
    };
    Array.from(el.childNodes).forEach(walk);
    return chars;
  };
  kfFx.register("stepped-brush-title", (el, { options, reduce }) => {
    if (!window.gsap || !el.textContent.trim()) return;
    const dur = +(options.dur ?? 1.3), steps = +options.steps || 55, cdur = +(options.chars ?? 1.5), shift = +(options.shift ?? 50), stagger = +(options.stagger ?? 0.018), delay = +(options.delay ?? 0);
    const outDur = +(options.out ?? 0.8), ease = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    const html = el.innerHTML;
    const chars = split(el);
    el.style.setProperty("--fx-sbt-mask", sprite());
    el.style.setProperty("--fx-sbt-size", `${(steps + 1) * 100}% 100%`);
    const show = () => {
      gsap.killTweensOf([el, chars]);
      if (reduce) { gsap.set(chars, { autoAlpha: 1, x: 0 }); el.classList.add("is-mask-off"); return; }
      el.classList.remove("is-mask-off");
      gsap.fromTo(chars, { x: shift, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: cdur, ease, delay, stagger, clearProps: "transform" });
      gsap.fromTo(el, { "--fx-sbt-pos": "0%" }, { "--fx-sbt-pos": "100%", duration: dur, ease: `steps(${steps})`, delay, onComplete: () => el.classList.add("is-mask-off") });
    };
    const hide = () => {
      gsap.killTweensOf([el, chars]);
      el.classList.remove("is-mask-off");
      gsap.fromTo(chars.slice().reverse(), { autoAlpha: 1 }, { autoAlpha: 0, duration: reduce ? 0 : 0.65, ease, stagger: reduce ? 0 : 0.012 });
      gsap.fromTo(el, { "--fx-sbt-pos": "100%" }, { "--fx-sbt-pos": "0%", duration: reduce ? 0 : outDur, ease: `steps(${steps})` });
    };
    gsap.set(chars, { autoAlpha: 0 });
    const ac = new AbortController();
    el.addEventListener("fx:play", show, { signal: ac.signal });
    el.addEventListener("fx:out", hide, { signal: ac.signal });
    el.addEventListener("fx:reset", () => { gsap.killTweensOf([el, chars]); gsap.set(chars, { autoAlpha: 0 }); el.classList.remove("is-mask-off"); el.style.setProperty("--fx-sbt-pos", "0%"); }, { signal: ac.signal });
    let io = null;
    if (options.on !== "manual") {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); io = null; show(); } });
      io.observe(el);
    }
    return () => { ac.abort(); io && io.disconnect(); gsap.killTweensOf([el, chars]); el.innerHTML = html; el.classList.remove("is-mask-off"); ["--fx-sbt-mask", "--fx-sbt-size", "--fx-sbt-pos"].forEach((p) => el.style.removeProperty(p)); };
  });
})();
