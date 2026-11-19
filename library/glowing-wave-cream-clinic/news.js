// List and detail — the Archive yearly month list unfolds over .3s (the original jQuery slideToggle(300))
(() => {
  document.querySelectorAll(".aa-arch__dd").forEach((b) => b.addEventListener("click", () => {
    const li = b.closest(".aa-arch__y"), box = li.querySelector(".aa-arch__m"), open = !li.classList.contains("is-active");
    li.classList.toggle("is-active", open);
    b.setAttribute("aria-expanded", String(open));
    box.style.height = open ? "0px" : `${box.scrollHeight}px`;
    requestAnimationFrame(() => { box.style.height = open ? `${box.scrollHeight}px` : "0px"; });
  }));
})();
