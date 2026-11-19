// Brand top only — tapping the third slide opens the statement panel, and scrolling inside the panel moves photos against the scroll by data-para times (original statement-modal.js: half on phones).
(() => {
  const start = () => {
    const box = document.querySelector(".js-para-box");
    if (!box) return;
    const items = [...box.querySelectorAll(".js-para")];
    const sp = window.matchMedia("(max-width: 960px)");
    const open = () => { document.body.classList.add("is-statement-open"); document.querySelector(".my-statement").setAttribute("aria-hidden", "false"); };
    const close = () => { document.body.classList.remove("is-statement-open"); document.querySelector(".my-statement").setAttribute("aria-hidden", "true"); };
    document.querySelectorAll(".js-statement-open").forEach((b) => b.addEventListener("click", open));
    document.querySelectorAll(".js-statement-close").forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    box.addEventListener("scroll", () => {
      const y = box.scrollTop;
      items.forEach((el) => {
        const para = +el.dataset.para * (sp.matches ? 0.5 : 1);
        el.style.transform = `translateY(${y * para}px)`;
      });
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
