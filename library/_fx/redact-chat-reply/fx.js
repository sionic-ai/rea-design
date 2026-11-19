// Masking glyphs and speech-bubble replies — eight ▓▒░ characters are redrawn every .5s to cover name slots not yet revealed, and on press a bubble group forms above them
// Each bubble shows its line via a typing dot and then closes (Brand site, Latest). Opening and closing the group is a css transition, the steps are here
(() => {
  kfFx.register("redact-chat-reply", (el, { options, reduce }) => {
    const glyphs = el.querySelector('[data-fx-part="glyphs"]');
    const chat = el.querySelector('[data-fx-part="chat"]');
    const bubbles = chat ? [...chat.querySelectorAll('[data-fx-part="bubble"]')] : [];
    if (!glyphs) return;
    const set = [...String(options.set ?? "▓▒░")];
    const len = Math.max(1, +(options.length ?? 8) || 8);
    const every = Math.max(50, +(options.every ?? 0.5) * 1000 || 500);
    // Step lengths (seconds): first bubble typing · first line · second bubble typing · second line … closing after the last
    const steps = String(options.steps ?? "1,0.5,1.5,2").split(",").map((v) => Math.max(0, +v * 1000));
    const reset = Math.max(0, +(options.reset ?? 0.5) * 1000);
    const roll = () => Array.from({ length: len }, () => set[Math.floor(Math.random() * set.length)]).join("");
    const loop = reduce ? 0 : setInterval(() => { glyphs.textContent = roll(); }, every);

    let open = false, n = 0, timer = 0;
    const last = bubbles.length * 2;
    // Balloon i attaches at step 2i (typing dots) and turns into words at 2i+1. is-fx-in is re-applied only on attach so it rises from below
    const render = (fresh) => {
      bubbles.forEach((b, i) => {
        const shown = n >= 2 * i || i === 0;
        const was = !b.hidden;
        b.hidden = !shown;
        b.classList.toggle("is-fx-typing", n <= 2 * i);
        if (shown && (!was || fresh === i)) { b.classList.remove("is-fx-in"); void b.offsetWidth; b.classList.add("is-fx-in"); }
      });
    };
    const tick = () => {
      if (n < last) {
        timer = setTimeout(() => { n++; render(); tick(); }, steps[n] ?? 2500);
        return;
      }
      open = false;
      el.classList.remove("is-fx-open");
      el.dispatchEvent(new CustomEvent("fx:close", { bubbles: true }));
      timer = setTimeout(() => { n = 0; render(); }, reset);
    };
    const onClick = () => {
      if (open || !bubbles.length) return;
      clearTimeout(timer);
      open = true;
      n = 0;
      render(0);
      el.classList.add("is-fx-open");
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
      tick();
    };
    render();
    el.addEventListener("click", onClick);
    return () => {
      clearInterval(loop);
      clearTimeout(timer);
      el.removeEventListener("click", onClick);
      el.classList.remove("is-fx-open");
      bubbles.forEach((b) => { b.hidden = false; b.classList.remove("is-fx-typing", "is-fx-in"); });
    };
  });
})();
