(() => {
  // Split text char by char into an outgoing line and an incoming line, with echoes (half-moon, dot, small dot) on both sides — the motion itself is a transition in fx.css
  kfFx.register("echo-pill-btn", (el, { options }) => {
    const label = el.querySelector('[data-fx-part="label"]');
    if (!label) return;
    const text = label.textContent.trim();
    if (!text) return;
    const before = el.innerHTML;
    const stagger = +(options.stagger ?? 15);
    const esc = (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] || c;
    const chars = (s) => [...s].map((c, i) => `<span class="fx-ep-ch" style="transition-delay:${i * stagger}ms">${esc(c)}</span>`).join("");
    const echoes = (side) => `<span class="fx-ep-echoes" data-side="${side}" aria-hidden="true"><i></i><i></i><i></i></span>`;
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", text);
    el.innerHTML = `${echoes("l")}<span class="fx-ep-pill"><span class="fx-ep-roll" aria-hidden="true"><span class="fx-ep-out">${chars(text)}</span><span class="fx-ep-in">${chars(text)}</span></span></span>${echoes("r")}`;
    return () => { el.innerHTML = before; };
  });
})();
