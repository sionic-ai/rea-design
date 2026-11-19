// Subpage motion: speech bubble row 150s flow · recruit flow new/experienced tabs and job tabs (the original is page navigation so it switches instantly without a transition) · project logo slot.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-ill-logo]").forEach((el) => (el.innerHTML = document.querySelector(".cr-logo").innerHTML));
  if (!reduce) document.querySelectorAll("[data-marquee]").forEach((row) => {
    const dist = () => row.scrollWidth / 2;
    const rev = row.hasAttribute("data-reverse");
    gsap.fromTo(row, { x: () => (rev ? -dist() : 0) }, { x: () => (rev ? 0 : -dist()), duration: +row.dataset.marquee, ease: "none", repeat: -1 });
  });
  const sub = document.querySelector("[data-ptab-text]");
  document.querySelectorAll("[data-ptab]").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("[data-ptab]").forEach((x) => x.classList.toggle("is-on", x === b));
    sub.textContent = b.dataset.ptab === "0" ? "Graduating March 2027" : "Experienced · year-round hiring";
  }));
  document.querySelectorAll(".jtab").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".jtab").forEach((x) => x.classList.toggle("is-on", x === b));
  }));
})();
