(() => {
  kfFx.register("line-boil", (el, { options, reduce }) => {
    // Image panel (of the svg <g> Me <img>) two or more — with only one, there is nothing to shake
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    const hold = Math.max(0.05, +(options.hold ?? 1)) * 1000;
    // With only one image, cycles the seed of the noise-displacement filter for seeds frames, shaking the same image slightly differently each time (the original GIF has 3 frames that differ only in the lines)
    const seeds = Math.round(+options.seeds || 0);
    if (frames.length < 2 && seeds >= 2) {
      const id = `fx-boil-${Math.random().toString(36).slice(2, 8)}`;
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      defs.setAttribute("class", "fx-boil-defs");
      defs.setAttribute("aria-hidden", "true");
      defs.innerHTML = `<filter id="${id}" x="-1%" y="-1%" width="102%" height="102%"><feTurbulence type="fractalNoise" baseFrequency="${+(options.freq ?? 0.04)}" numOctaves="2" seed="1"/><feDisplacementMap in="SourceGraphic" scale="${+(options.scale ?? 3)}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
      document.body.append(defs);
      const turb = defs.querySelector("feTurbulence");
      el.style.filter = `url(#${id})`;
      let s = 0, t = 0;
      if (!reduce) t = setInterval(() => { s = (s + 1) % seeds; turb.setAttribute("seed", String(s + 1)); }, hold);
      return () => { clearInterval(t); defs.remove(); el.style.removeProperty("filter"); };
    }
    if (frames.length < 2) return;
    // order: random — each beat picks any section again (the same section may repeat)
    const random = options.order === "random";
    let k = 0, timer = 0;
    const show = () => frames.forEach((f, i) => f.classList.toggle("is-fx-on", i === k));
    el.classList.add("is-fx-boil");
    show();
    if (!reduce) timer = setInterval(() => { k = random ? Math.floor(Math.random() * frames.length) : (k + 1) % frames.length; show(); }, hold);
    return () => { clearInterval(timer); el.classList.remove("is-fx-boil"); frames.forEach((f) => f.classList.remove("is-fx-on")); };
  });
})();
