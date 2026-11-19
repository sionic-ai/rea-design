(() => {
  // Original top loading: split the two greeting lines into letters placed 1rem below and transparent, after .5s the first line floats up at .04s intervals over .5s back.out,
  // The second line starts .1s before the first line ends, at .02s intervals. At 3.5s the panel disappears in 1s and fx:done fires. If returning within 30 minutes it skips the text and disappears in 1s right away.
  kfFx.register("greeting-chars-loader", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')];
    const out = +(options.out ?? 1) * 1000;
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    const hide = (ms) => {
      el.style.transition = `opacity ${ms}ms cubic-bezier(0.37, 0, 0.63, 1)`;
      el.style.opacity = "0";
      return setTimeout(() => {
        el.hidden = true;
        done();
      }, ms);
    };
    const key = options.key || "fx-greeting-chars-loader";
    const every = +(options.every ?? 30) * 60000;
    let fresh = true;
    try {
      const last = +(localStorage.getItem(key) || 0);
      fresh = Date.now() - last >= every;
      if (fresh) localStorage.setItem(key, String(Date.now()));
    } catch {}
    if (reduce || !lines.length || !fresh) {
      const t = hide(reduce ? 0 : out);
      return () => { clearTimeout(t); el.hidden = false; el.style.opacity = el.style.transition = ""; };
    }
    el.dispatchEvent(new CustomEvent("fx:start", { bubbles: true }));
    const originals = lines.map((l) => l.innerHTML);
    const groups = lines.map((l) => {
      const parts = [];
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            [...n.textContent].forEach((c) => {
              const s = document.createElement("span");
              s.className = "fx-gcl-char";
              s.textContent = c;
              frag.append(s);
              parts.push(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
        });
      };
      walk(l);
      return parts;
    });
    const back = kfFx.ease(options.ease || "back.out(1.7)", "back.out(1.7)");
    const each = (options.each || ".04,.02").split(",").map(Number);
    const tl = gsap.timeline();
    tl.set(lines, { opacity: 1 }).set(groups.flat(), { opacity: 0, y: "1rem" });
    groups.forEach((g, i) => {
      const at = i === 0 ? +(options.delay ?? 0.5) : "-=0.1";
      tl.to(g, { opacity: 1, y: 0, duration: 0.5, stagger: each[i] ?? each[each.length - 1], ease: back }, at);
    });
    const timer = setTimeout(() => hide(out), +(options.hold ?? 3.5) * 1000);
    return () => {
      clearTimeout(timer);
      tl.kill();
      lines.forEach((l, i) => { l.innerHTML = originals[i]; l.style.opacity = ""; });
      el.hidden = false;
      el.style.opacity = el.style.transition = "";
    };
  });
})();
