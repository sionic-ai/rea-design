// On hover, four color bands sweep inside the button diagonally from the left (bottom at 120%) in turn, and letters thicken one by one, pop and return — Button of brand.
// Bands take the previous band’s progress as the next band’s start line (--next), so thin color lines that don’t overlap pass by and the last color remains.
(() => {
  kfFx.register("band-sweep-btn", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const label = el.querySelector('[data-fx-part="label"]');
    const dur = +(options.dur ?? 1.5), each = +(options.each ?? 0.04), speed = +(options.speed ?? 1.25) || 1.25;
    const ease = kfFx.ease(options.ease || "0.87,0,0.13,1", "expo.inOut");
    const tilt = +(options.tilt ?? 8);
    const bgs = document.createElement("span");
    bgs.className = "fx-bsb-bgs";
    bgs.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 5; i++) bgs.append(document.createElement("i"));
    el.prepend(bgs);
    const bands = [...bgs.children];
    let chars = [];
    if (label && label.textContent.trim()) {
      const text = label.textContent;
      label.dataset.fxBsbText = text;
      label.setAttribute("aria-label", text);
      label.textContent = "";
      for (const ch of text) {
        const s = document.createElement("span");
        s.className = "fx-bsb-char";
        s.setAttribute("aria-hidden", "true");
        s.textContent = ch;
        label.append(s);
      }
      chars = [...label.children];
      chars.forEach((c) => { if (c.textContent.trim()) c.style.width = c.getBoundingClientRect().width + "px"; });
    }
    const link = () => bands.forEach((b, n) => b.style.setProperty("--next", bands[n + 1] ? bands[n + 1].style.getPropertyValue("--progress") || 0 : 0));
    const tl = gsap.timeline({ paused: true, defaults: { ease, duration: 1 }, onUpdate: link });
    bands.slice(1).forEach((b, i) => tl.to(b, { "--progress": 1, duration: dur }, i * each));
    if (chars.length) {
      tl.to(chars, { "--progress": 1, stagger: 0.02 }, 0.2);
      chars.forEach((c, i) => {
        tl.to(c, { "--enter": 1, duration: 0.6, ease: "circ.in" }, i * 0.02 + 0.2);
        tl.to(c, { "--leave": 1, duration: 0.4, ease: "circ.in" }, i * 0.02 + 0.6);
      });
    }
    const on = () => { chars.forEach((c) => c.style.setProperty("--deg", gsap.utils.random(-tilt, tilt, 2) + "deg")); tl.timeScale(speed).play(); };
    const off = () => tl.timeScale(speed).reverse();
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    el.addEventListener("focus", on);
    el.addEventListener("blur", off);
    return () => {
      el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off);
      el.removeEventListener("focus", on); el.removeEventListener("blur", off);
      tl.kill(); bgs.remove();
      if (label && label.dataset.fxBsbText != null) { label.textContent = label.dataset.fxBsbText; delete label.dataset.fxBsbText; label.removeAttribute("aria-label"); }
    };
  });
})();
