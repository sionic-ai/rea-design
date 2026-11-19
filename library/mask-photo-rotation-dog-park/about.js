// About page — splits the concept title letters per the original delay table (top line from .12s, bottom line from 1.08s, .06s per letter),
// Draws the logo stamp in portrait form, and on phones opens paragraphs hidden by the story card ‹Read slowly› with .6s expo.
(() => {
  const split = (el, text, start, yellow = []) => {
    if (!el) return;
    let i = 0;
    el.innerHTML = [...text].map((ch) => (ch === " " ? " " : `<span class="c${yellow.includes(i) ? " is-y" : ""}" style="--d:${(start + 0.06 * i++).toFixed(2)}s">${ch}</span>`)).join("");
  };
  split(document.querySelector(".ab-concept__copy-sub"), "A place where dogs and people both roam free", 0.12, [0, 2, 3]);
  split(document.querySelector(".ab-concept__copy-main"), "Lifestyle · Dog park", 1.08);

  const mark = document.querySelector(".ab-logo__mark");
  if (mark) {
    // The original’s vertical logo slot — large symbol, with the name and footer line below
    mark.innerHTML = `<svg viewBox="0 0 200 150" fill="none" stroke="currentColor" aria-hidden="true">
      <g stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" transform="translate(28 0) scale(1.05)">
        <path d="M9 88 L30 37 Q36 21 52 19 Q74 18 76 40 Q77 60 55 64 L22 66 L60 88 Z"/><circle cx="93" cy="52" r="26"/><path d="M84 78 L126 86 L104 64"/>
      </g>
      <g fill="currentColor" stroke="none" style="font-family: var(--kf-font-display)">
        <text x="100" y="124" font-size="22" font-weight="500" text-anchor="middle" letter-spacing=".6">Park - Name</text>
        <text x="100" y="142" font-size="8.4" font-weight="600" text-anchor="middle" letter-spacing="1.4">LIFESTYLE PARK</text>
      </g></svg>`;
  }

  const hidden = document.querySelector(".ab-story__hidden");
  const more = document.querySelector(".ab-story__more");
  if (hidden && more) {
    more.addEventListener("click", () => {
      hidden.style.setProperty("--content-height", `${hidden.scrollHeight}px`);
      const show = hidden.classList.toggle("is-show");
      more.textContent = show ? "Close" : "Slow read";
      setTimeout(() => window.RL?.lenis?.resize(), 650);
    });
  }
})();
