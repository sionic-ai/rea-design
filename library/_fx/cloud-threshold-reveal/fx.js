(() => {
  // Cut fractal noise at a threshold so only the inside is visible — alpha = 2·noise + offset, pushing the offset straight from −2 → 2 makes cloud masses bloom first
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  kfFx.register("cloud-threshold-reveal", (el, { options, reduce }) => {
    const dur = +(options.dur ?? 1.8);
    const delay = +(options.delay ?? 0);
    const hide = +(options.hide ?? 0.5);
    const freq = +(options.freq ?? 0.01) || 0.01;
    const octaves = Math.max(1, Math.round(+options.octaves || 4));
    const seed = +(options.seed ?? 7);
    const on = options.on || "load";
    const state = { offset: -2 };
    let shown = false, tween = null, io = null, mo = null, timer = 0;

    const set = (visible) => {
      el.classList.toggle("is-shown", visible);
      el.style.visibility = visible ? "" : "hidden";
    };
    if (reduce) {
      const apply = () => set(on !== "state" || el.classList.contains("is-on"));
      apply();
      if (on === "state") { mo = new MutationObserver(apply); mo.observe(el, { attributes: true, attributeFilter: ["class"] }); }
      return () => { mo?.disconnect(); el.style.visibility = ""; el.classList.remove("is-shown"); };
    }

    const id = `fx-cloud-threshold-${++uid}`;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    svg.innerHTML = `<defs><filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="${freq} ${freq}" numOctaves="${octaves}" seed="${seed}" result="noise"/>` +
      `<feColorMatrix in="noise" type="matrix" values="" result="threshold"/>` +
      `<feComposite in="SourceGraphic" in2="threshold" operator="in"/></filter></defs>`;
    el.before(svg);
    const matrix = svg.querySelector("feColorMatrix");
    const paint = () => matrix.setAttribute("values", `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  2 0 0 0 ${state.offset}`);
    paint();
    set(false);

    const play = (visible) => {
      if (visible === shown) return;
      shown = visible;
      tween?.kill();
      el.style.filter = `url(#${id})`;
      if (visible) set(true);
      tween = gsap.to(state, {
        offset: visible ? 2 : -2,
        duration: visible ? dur : dur * hide,
        delay: visible ? delay : 0,
        ease: "none",
        onUpdate: paint,
        onComplete: () => { el.style.filter = ""; if (!visible) set(false); el.dispatchEvent(new CustomEvent(visible ? "fx:shown" : "fx:hidden", { bubbles: true })); },
      });
    };

    if (on === "view") {
      io = new IntersectionObserver(([e]) => e.isIntersecting && play(true), { rootMargin: "0px 0px -10% 0px" });
      io.observe(el);
    } else if (on === "state") {
      const read = () => play(el.classList.contains("is-on"));
      mo = new MutationObserver(read);
      mo.observe(el, { attributes: true, attributeFilter: ["class"] });
      read();
    } else {
      timer = requestAnimationFrame(() => play(true));
    }

    return () => {
      cancelAnimationFrame(timer);
      tween?.kill();
      io?.disconnect();
      mo?.disconnect();
      svg.remove();
      el.style.filter = "";
      el.style.visibility = "";
      el.classList.remove("is-shown");
    };
  });
})();
