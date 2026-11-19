// The header menu and footer row are toggled on and off per section by the page script — the toggling, the current-section underline and the email-copy notice live here.
(() => {
  const nav = document.querySelector(".pl-nav");
  const foot = document.querySelector(".pl-foot");
  window.plChrome = {
    show() { nav?.classList.remove("is-hidden"); foot?.classList.add("is-shown"); },
    hide() { nav?.classList.add("is-hidden"); foot?.classList.remove("is-shown"); },
  };

  // When the info section changes, underline that section’s link
  const links = [...document.querySelectorAll(".pl-nav a")];
  document.addEventListener("fx:enter", (e) => {
    const id = e.target.id;
    links.forEach((a) => a.setAttribute("aria-current", String(!!id && a.getAttribute("href") === `#${id}`)));
  });
  // As in the original, jumps straight to that section’s top with no smooth scroll
  links.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const to = document.querySelector(a.getAttribute("href"));
    if (to) to.scrollIntoView({ behavior: "instant", block: "start" });
    else scrollTo({ top: 0, behavior: "instant" });
  }));

  // The mail button copies the address, shows a notice in .3s, then hides it in .3s after 1.5s
  const mail = document.querySelector(".pl-mail");
  const alert = document.querySelector(".pl-alert");
  if (mail && alert && window.gsap) {
    const say = gsap.timeline({ paused: true })
      .set(alert, { opacity: 0, y: "1rem", display: "block" })
      .to(alert, { opacity: 1, y: 0, duration: 0.3 })
      .to(alert, { opacity: 0, duration: 0.3, delay: 1.5 })
      .set(alert, { display: "none" });
    mail.addEventListener("click", () => {
      const done = () => say.restart();
      (navigator.clipboard?.writeText(mail.dataset.copy || "") || Promise.resolve()).then(done, done);
    });
  }
})();
