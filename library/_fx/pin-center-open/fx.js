// Original serialsHead, opens at progress p of the attached section = min(p, open) / open, once the opening passes at, the letters rise
(() => {
  kfFx.register("pin-center-open", (el, { options, reduce, scroller }) => {
    const film = el.querySelector('[data-fx-part="film"]');
    if (!film) return;
    const title = el.querySelector('[data-fx-part="title"]');
    const length = +options.length || 200, open = +options.open || 0.7, at = +(options.at ?? 0.3);
    if (options.stagger != null) el.style.setProperty("--fx-stagger", +options.stagger + "s");
    let stick = el.querySelector(":scope > .fx-open-stick");
    const made = !stick;
    if (made) {
      stick = document.createElement("div");
      stick.className = "fx-open-stick";
      stick.append(...el.childNodes);
      el.append(stick);
    }
    el.style.height = `${length}lvh`;
    // Splits title text into word chunks — so multi-line Korean doesn’t break mid-word, spaces between are kept as is
    const saved = title ? [...title.childNodes] : null;
    if (title && title.textContent.trim()) {
      let i = 0;
      const words = title.textContent.trim().split(/\s+/).map((w) => {
        const word = document.createElement("span");
        word.className = "fx-open-word";
        [...w].forEach((c) => {
          const box = document.createElement("span");
          box.className = "fx-open-ch";
          const ch = document.createElement("span");
          ch.style.setProperty("--i", i++);
          ch.textContent = c;
          box.append(ch);
          word.append(box);
        });
        return word;
      });
      title.replaceChildren(...words.flatMap((w, n) => (n ? [document.createTextNode(" "), w] : [w])));
      title.setAttribute("aria-label", saved.map((n) => n.textContent).join("").trim());
    }
    const paint = (p) => {
      const s = Math.min(Math.max(p, 0), open) / open;
      el.style.setProperty("--fx-open", String(s));
      el.classList.toggle("fx-open-on", s > at);
    };
    gsap.registerPlugin(ScrollTrigger);
    let st = null;
    if (reduce) paint(1);
    else {
      paint(0);
      st = ScrollTrigger.create({ scroller, trigger: el, start: "top top", end: "bottom bottom", invalidateOnRefresh: true, onUpdate: (s) => paint(s.progress) });
    }
    return () => {
      st?.kill();
      if (saved) { title.replaceChildren(...saved); title.removeAttribute("aria-label"); }
      if (made && stick.isConnected) { el.prepend(...stick.childNodes); stick.remove(); }
      el.classList.remove("fx-open-on");
      ["height", "--fx-open", "--fx-stagger"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
