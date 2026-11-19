/* Contact — original: pressing Contact removes the button row and the form rises from 100px below over .4s ease (keyframes fadein) */
(() => {
  const open = document.querySelector(".gb-contact__open");
  const form = document.querySelector(".gb-form");
  if (!open || !form) return;
  open.querySelector("button").addEventListener("click", () => {
    open.hidden = true;
    form.classList.add("is-on");
    window.AOS && AOS.refresh();
  });
})();
