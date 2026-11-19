// Home page — Hero intro (ends when all the cloud logos have popped away), interview shortcut cards (pressing opens that slot only if it is closed), video cards and footer video play in place where pressed
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fv = document.getElementById("sec-fv");
  const last = document.querySelector("#sy-fv-last .sy-fv__img");

  window.syIntro = (first) => new Promise((resolve) => {
    if (!fv) return resolve();
    fv.dataset.intro = "1";
    if (!first || reduce || !last) return resolve();
    const done = () => { last.removeEventListener("animationend", done); resolve(); };
    last.addEventListener("animationend", done);
    setTimeout(done, 2600);
  });

  document.querySelectorAll("[data-open-target]").forEach((card) => {
    card.addEventListener("click", () => {
      const sum = document.getElementById(card.dataset.openTarget);
      const d = sum?.parentElement;
      if (d?.dataset.status === "close") sum.click();
    });
  });

  document.querySelectorAll("[data-video]").forEach((btn) => {
    btn.addEventListener("click", (e) => { e.preventDefault(); btn.classList.add("is-playing"); });
  });
})();
