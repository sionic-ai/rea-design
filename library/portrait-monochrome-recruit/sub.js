// Shared by subpages — the CONTENTS number row in the header, a left fixed table of contents (only the passing section is bold, clicking moves in 1s power2.inOut)
(() => {
  const STAR = `<svg viewBox="0 0 13 13" aria-hidden="true"><path fill="currentColor" d="M6.5 0 7.6 5.4 13 6.5 7.6 7.6 6.5 13 5.4 7.6 0 6.5 5.4 5.4Z"/></svg>`;
  document.querySelectorAll("[data-ct-contents]").forEach((el) => {
    const [n, word] = el.dataset.ctContents.split(",");
    el.innerHTML = `<p>CONTENTS</p>${STAR}<p>${n}</p>${STAR}<p>${word}</p>`;
  });

  const nav = document.querySelector("[data-sp-nav]");
  if (!nav) return;
  const sections = [...document.querySelectorAll("[data-nav-section]")];
  nav.innerHTML = sections.map((s, i) => `
    <li><a href="#${s.id}" class="ct-link"><p class="sp-nav__n">0${i + 1}</p><div><p class="sp-nav__en">${s.dataset.en}</p><p class="sp-nav__ja">${s.dataset.ja}</p></div></a></li>`).join("");
  const items = [...nav.children];
  const set = (i) => items.forEach((li, k) => li.classList.toggle("is-current", k === i));
  set(0);
  sections.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top center", end: "bottom center", onEnter: () => set(i), onEnterBack: () => set(i) }));

  // Original navPage.scrollTo — stops Lenis, moves with GSAP ScrollTo at 1s power2.inOut, then releases it again
  gsap.registerPlugin(ScrollToPlugin);
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    window.lenis?.stop();
    gsap.to(window, { duration: ct.reduce ? 0 : 1, overwrite: true, scrollTo: { y: a.getAttribute("href"), offsetY: 0 }, ease: "power2.inOut", onComplete: () => window.lenis?.start() });
  });
})();
