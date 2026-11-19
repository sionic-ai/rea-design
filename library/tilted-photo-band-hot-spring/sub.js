// Lower pages — archive expand (original jQuery slideToggle 300ms) and photo zoom (same GLightbox settings as the original)
(() => {
  document.querySelectorAll("[data-acc]").forEach((b) => b.addEventListener("click", () => {
    const list = b.nextElementSibling, open = !b.classList.toggle("is-closed");
    list.style.height = `${list.scrollHeight}px`;
    requestAnimationFrame(() => { list.style.height = open ? `${list.scrollHeight}px` : "0px"; });
    b.querySelector("i").textContent = open ? "−" : "+";
  }));
  if (window.GLightbox) GLightbox({ selector: ".glightbox", loop: true, closeButton: true, closeOnOutsideClick: true, touchNavigation: true });
})();
