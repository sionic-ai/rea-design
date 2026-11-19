(() => {
  // Split the text into body and mask, measure the character count, and fit the CSS step count and length. Turns on when visible (on: scroll) or on receiving fx:play
  kfFx.register("slash-step-reveal", (el, { options, reduce }) => {
    const text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) return;
    const html = el.innerHTML;
    const len = [...text].length;
    const ch = options.char || "\\";
    const esc = ch.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    el.style.setProperty("--fx-length", len);
    el.style.setProperty("--fx-mask-text", `"${esc.repeat(len)}"`);
    if (options.index != null) el.style.setProperty("--fx-index", +options.index);
    if (options.delay != null) el.style.setProperty("--fx-delay", `${+options.delay}s`);
    el.innerHTML = `<span data-fx-part="body">${html}</span><span data-fx-part="mask" aria-hidden="true"></span>`;
    const on = () => el.classList.add("is-fx-on");
    const off = () => el.classList.remove("is-fx-on");
    el.addEventListener("fx:play", on);
    el.addEventListener("fx:rest", off);
    let io = null;
    if (reduce) on();
    else if ((options.on || "scroll") === "scroll") {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { on(); io.disconnect(); } }), { rootMargin: options.margin || "0px 0px -8% 0px" });
      io.observe(el);
    } else if (options.on === "load") requestAnimationFrame(() => requestAnimationFrame(on));
    return () => { io?.disconnect(); el.removeEventListener("fx:play", on); el.removeEventListener("fx:rest", off); off(); el.innerHTML = html; };
  });
})();
