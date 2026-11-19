// Subpage — two review rows flow slowly in opposite directions (pause on mouse hover), and the history bars fill with scroll.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Feature card stack — Next: send the top card flying and put it at the back, Previous: bring the back card to the top only as many times as advanced (at first nothing happens, like the original)
  const deck = document.querySelector(".et-deck");
  if (deck) {
    let order = [...deck.children], pos = 0;
    const prev = document.querySelector('[data-deck="prev"]');
    const lay = () => { order.forEach((c, d) => c.style.setProperty("--d", d)); if (prev) prev.disabled = pos === 0; };
    lay();
    document.querySelectorAll("[data-deck]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.deck === "next") {
        pos++;
        const top = order.shift();
        top.classList.add("is-gone");
        setTimeout(() => { top.classList.remove("is-gone"); order.push(top); lay(); }, reduce ? 0 : 520);
        lay();
      } else if (pos > 0) {
        pos--;
        order.unshift(order.pop());
        lay();
      }
    }));
  }
  if (!window.gsap || reduce) return;
  document.querySelectorAll(".et-testi__col").forEach((col) => {
    col.append(...[...col.children].map((c) => { const n = c.cloneNode(true); n.setAttribute("aria-hidden", "true"); return n; }));
    const down = col.classList.contains("is-down");
    const tw = gsap.fromTo(col, { yPercent: down ? -50 : 0 }, { yPercent: down ? 0 : -50, duration: 40, ease: "none", repeat: -1 });
    col.addEventListener("pointerenter", () => tw.pause());
    col.addEventListener("pointerleave", () => tw.resume());
  });
  document.querySelectorAll("[data-et-bar]").forEach((bar) => {
    gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: bar.closest("section"), start: "top 70%", end: "bottom 50%", scrub: true } });
  });
})();
