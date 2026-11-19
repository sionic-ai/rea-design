(() => {
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  kfFx.register("ring-caption-type", (el, { options, reduce }) => {
    const caps = [...el.querySelectorAll('[data-fx-part="caption"]')];
    if (!caps.length) return;
    const faces = [...el.querySelectorAll('[data-fx-part="face"]')];
    const each = +(options.each ?? 0.05), play = options.play || "auto";
    const startDeg = +(options.start ?? -70), inset = +(options.inset ?? 4);
    const texts = caps.map((c) => c.textContent.trim());
    const id = "fx-ring-path-" + (++uid);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("data-fx-part", "ring");
    svg.setAttribute("aria-hidden", "true");
    svg.style.transform = `rotate(${startDeg}deg)`;
    const r = 50 - inset;
    // Clockwise circle: text starts at top center and wraps rightward
    svg.innerHTML = `<path id="${id}" fill="none" d="M50,${50 - r} a${r},${r} 0 1,1 -0.01,0"/>`;
    const lines = texts.map(() => {
      const t = document.createElementNS(NS, "text");
      const p = document.createElementNS(NS, "textPath");
      p.setAttribute("href", "#" + id);
      t.append(p); svg.append(t);
      return p;
    });
    el.prepend(svg);
    let i = 0, busy = false, timer = 0, lock = 0, waitT = 0;
    const lastDelay = (n) => (n.length - 1) * each;
    function type(k) {
      const p = lines[k], str = texts[k];
      p.textContent = "";
      [...str].forEach((ch, n) => {
        const s = document.createElementNS(NS, "tspan");
        s.textContent = ch;
        s.style.animationDelay = n * each + "s";
        p.append(s);
      });
      busy = true;
      clearTimeout(lock);
      lock = setTimeout(() => { busy = false; }, (lastDelay(str) + 0.3) * 1000);
    }
    function show(k) {
      i = k;
      el.setAttribute("data-num", String(k + 1).padStart(2, "0"));
      lines.forEach((p, n) => p.parentNode.classList.toggle("is-on", n === k));
      faces.forEach((f, n) => f.classList.toggle("is-on", n === k % faces.length));
      type(k);
    }
    const cycle = Math.max(1000 * (texts.length * each + 1), 3000);
    const next = () => { if (!busy) show((i + 1) % texts.length); };
    const loop = (now) => { clearInterval(timer); if (now) next(); timer = setInterval(next, cycle); };
    show(0);
    if (!reduce) {
      if (play === "auto") loop(false);
      else if (play === "wait") waitT = setTimeout(() => loop(true), 1500);
    }
    const click = () => {
      show((i + 1) % texts.length);
      if (!reduce && (play === "auto" || play === "wait")) { clearTimeout(waitT); loop(false); }
    };
    el.addEventListener("click", click);
    return () => {
      clearInterval(timer); clearTimeout(lock); clearTimeout(waitT);
      el.removeEventListener("click", click);
      svg.remove();
      faces.forEach((f) => f.classList.remove("is-on"));
      el.removeAttribute("data-num");
    };
  });
})();
