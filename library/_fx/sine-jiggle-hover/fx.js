// Menu letter wobble — on hover each letter’s height trembles up and down with sin(16t + index × .35π), briefly surging and then settling
(() => {
  kfFx.register("sine-jiggle-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !(el.textContent || "").trim()) return;
    const keep = el.innerHTML;
    const label = el.textContent.trim();
    // Wrap words as chunks and keep the spaces between as they are — only letters are inline-block
    el.setAttribute("aria-label", label);
    el.textContent = "";
    const chars = [];
    label.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { el.append(" "); return; }
      const word = Object.assign(document.createElement("span"), { className: "fx-sj-word" });
      word.setAttribute("aria-hidden", "true");
      Array.from(w).forEach((c) => {
        const s = Object.assign(document.createElement("span"), { className: "fx-sj-char", textContent: c });
        chars.push(s);
        word.append(s);
      });
      el.append(word);
    });
    const peak = +(options.peak ?? 3), up = +(options.up ?? 0.075), down = +(options.down ?? 0.4), speed = +(options.speed ?? 16), step = +(options.step ?? 0.35);
    const st = { h: 0, phase: 0 };
    const draw = () => {
      const t = st.phase + Date.now() / 1000;
      chars.forEach((s, i) => (s.style.transform = `translateY(${Math.sin(speed * t + i * step * Math.PI) * st.h}px)`));
    };
    let tl = null;
    const enter = () => {
      st.phase = Math.random() * Math.PI * 2;
      if (tl) tl.kill();
      tl = gsap.timeline().to(st, { h: peak, duration: up, ease: "sine.inOut", onUpdate: draw }).to(st, { h: 0, duration: down, ease: "sine.inOut", onUpdate: draw });
    };
    el.addEventListener("mouseenter", enter);
    return () => {
      el.removeEventListener("mouseenter", enter);
      if (tl) tl.kill();
      el.innerHTML = keep;
      el.removeAttribute("aria-label");
    };
  });
})();
