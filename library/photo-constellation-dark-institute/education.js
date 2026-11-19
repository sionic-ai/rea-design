// Course: pressing a question opens the row height with 1s cubic-bezier(.19,1,.22,1) and the answer appears over the same length
(() => {
  document.querySelectorAll(".gl-acc-item").forEach((item) => {
    const btn = item.querySelector(".gl-acc-btn"), body = item.querySelector(".gl-acc-body");
    const shut = () => btn.offsetHeight + 3, full = () => btn.offsetHeight + body.offsetHeight + 3;
    item.style.height = `${shut()}px`;
    btn.addEventListener("click", () => {
      const on = !item.classList.contains("open");
      item.classList.toggle("open", on);
      btn.setAttribute("aria-expanded", String(on));
      item.style.height = `${on ? full() : shut()}px`;
      setTimeout(() => window.ScrollTrigger?.refresh(), 1000);
    });
    addEventListener("resize", () => (item.style.height = `${item.classList.contains("open") ? full() : shut()}px`));
  });
})();
