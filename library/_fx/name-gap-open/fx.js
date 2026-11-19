// The letters of the two name halves rise, and meanwhile a zero-width box opens into a 1em photo window, then grows to the panel (size minus margins) while the two halves vanish.
// At the end the title words tilt and rise from below. Length is shortened all at once by speed (a screen opened often, like an app).
(() => {
  kfFx.register("name-gap-open", (el, { options, reduce }) => {
    const intro = el.querySelector(':scope > [data-fx-part="intro"]');
    const box = intro?.querySelector('[data-fx-part="box"]');
    const image = box?.querySelector('[data-fx-part="image"]');
    if (!intro || !box || !image) return;
    const start = intro.querySelector('[data-fx-part="start"]');
    const end = intro.querySelector('[data-fx-part="end"]');
    const title = el.querySelector('[data-fx-part="title"]');
    const gutter = +(options.gutter ?? 20);
    const speed = +options.speed || 1;
    const delay = +(options.delay ?? 0);
    const each = +(options.each ?? 0.095);
    el.style.setProperty("--fx-gutter", `${gutter}px`);
    const fullW = () => Math.max(0, el.clientWidth - 2 * gutter);
    const fullH = () => Math.max(0, el.clientHeight - 2 * gutter);

    // Text splitting — the original text is kept for restoring
    const kept = [];
    const splitChars = (side) => {
      if (!side) return [];
      kept.push([side, side.innerHTML]);
      const chars = [...side.textContent].map((c) => {
        const s = document.createElement("span");
        s.className = "fx-ngo-ch";
        s.textContent = c === " " ? " " : c;
        return s;
      });
      side.replaceChildren(...chars);
      return chars;
    };
    // Wrap the title in word chunks and keep spaces between as is (so multi-line Korean titles don’t break mid-word)
    const splitWords = (node) => {
      if (!node) return [];
      kept.push([node, node.innerHTML]);
      node.setAttribute("aria-label", node.textContent.trim());
      const words = [];
      const frag = document.createDocumentFragment();
      node.textContent.trim().split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.append(" "); return; }
        const mask = document.createElement("span");
        mask.className = "fx-ngo-mask";
        mask.setAttribute("aria-hidden", "true");
        const word = document.createElement("span");
        word.className = "fx-ngo-word";
        word.textContent = w;
        mask.append(word);
        frag.append(mask);
        words.push(word);
      });
      node.replaceChildren(frag);
      return words;
    };

    // Move the photo window into the 1em base cell — take it back out on release
    const inner = document.createElement("span");
    inner.className = "fx-ngo-inner";
    image.replaceWith(inner);
    inner.append(image);

    let opened = false;
    const fit = () => { if (opened) gsap.set(box, { width: fullW(), height: fullH() }); };
    const ro = new ResizeObserver(fit);
    const settle = () => {
      opened = true;
      gsap.set(intro, { autoAlpha: 1 });
      gsap.set(box, { width: fullW(), height: fullH() });
      gsap.set(image, { width: "100%" });
      const sides = [start, end].filter(Boolean);
      if (sides.length) gsap.set(sides, { autoAlpha: 0 });
      if (title) gsap.set(title, { autoAlpha: 1 });
    };
    const off = () => {
      ro.disconnect();
      tl?.kill();
      kept.forEach(([n, html]) => { n.innerHTML = html; });
      if (inner.isConnected) inner.replaceWith(image);
      title?.removeAttribute("aria-label");
      gsap.set([intro, box, image, start, end, title].filter(Boolean), { clearProps: "all" });
      el.style.removeProperty("--fx-gutter");
    };
    let tl = null;
    ro.observe(el);
    if (reduce) { settle(); return off; }

    const letters = [...splitChars(start), ...splitChars(end)];
    const words = splitWords(title);
    const sides = [start, end].filter(Boolean);
    if (letters.length) gsap.set(letters, { yPercent: 110 });
    if (words.length) gsap.set(words, { yPercent: 125, rotationX: -12, transformPerspective: 800, transformOrigin: "50% 100%" });
    gsap.set(intro, { autoAlpha: 1 });
    if (title) gsap.set(title, { autoAlpha: 1 });

    tl = gsap.timeline({ paused: true, delay, defaults: { ease: "expo.inOut" }, onComplete: () => { opened = true; el.dispatchEvent(new CustomEvent("fx:opened", { bubbles: true })); } });
    if (letters.length) tl.to(letters, { yPercent: 0, duration: 1.8, stagger: 0.025 }, 0);
    tl.to(box, { width: "1em", duration: 1.45 }, 1.5);
    tl.to(image, { width: "100%", duration: 1.45 }, 1.5);
    if (start) tl.to(start, { x: "-0.05em", duration: 1.6 }, 1.5);
    if (end) tl.to(end, { x: "0.05em", duration: 1.6 }, 1.5);
    tl.to(box, { width: fullW, height: fullH, duration: 3 }, 2.6);
    if (sides.length) tl.to(sides, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 2.65);
    if (words.length) tl.to(words, { yPercent: 0, rotationX: 0, duration: 1.8, stagger: each, ease: "expo.out" }, 4.8);
    tl.timeScale(speed);

    // The original opens on the frame after the first photo is loaded — here it opens on the frame after the fonts are loaded. With start: wait it waits for fx:play
    const play = () => requestAnimationFrame(() => tl?.play());
    if (options.start === "wait") el.addEventListener("fx:play", play, { once: true });
    else document.fonts.ready.then(play);
    return () => { el.removeEventListener("fx:play", play); off(); };
  });
})();
