// Article detail motion: the body start is pushed down by the header height, footnote number → footnote window (closes on outside click or close)
(() => {
  const body = document.body;
  const head = document.querySelector(".mh-dhead");
  const bar = document.querySelector(".mh-header__bar");
  const pc = matchMedia("(min-width: 767px)");
  // Offset by the fixed header height + 3rem so it starts below the header row
  const offset = () => (head.style.marginTop = pc.matches ? bar.offsetHeight + 48 + "px" : "");
  offset();
  addEventListener("resize", offset);

  const box = document.querySelector(".mh-kome__box");
  const conts = [...document.querySelectorAll(".mh-kome__cont")];
  const close = () => {
    body.classList.remove("is-kome");
    conts.forEach((c) => c.classList.remove("is-on"));
    document.querySelector(".mh-kome").setAttribute("aria-hidden", "true");
  };
  document.querySelectorAll(".mh-kome-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      conts.forEach((c) => c.classList.toggle("is-on", c.id === btn.dataset.id));
      box.classList.toggle("is-add", btn.classList.contains("mh-kome-btn--add"));
      body.classList.add("is-kome");
      document.querySelector(".mh-kome").setAttribute("aria-hidden", "false");
    });
    // Like the original, a span number inside a text line, so on keyboard it opens with Enter and Space
    btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); } });
  });
  document.querySelector(".mh-kome__close").addEventListener("click", close);
  document.addEventListener("click", (e) => {
    if (body.classList.contains("is-kome") && !e.target.closest(".mh-kome__cont, .mh-kome-btn, .mh-kome__close")) close();
  });
  addEventListener("keydown", (e) => e.key === "Escape" && close());
})();
