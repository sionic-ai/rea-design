// Interaction shared by all pages: menu modal open and close (original STUDIO modal — from transparent at .4s cubic-bezier(.4,.4,0,1)).
// People and note illustrations are handled by people.js, and reveal, choppy GIF-like motion and photo switching by motion parts (studio-appear · frame-step-loop · fade-cycle)
(() => {
  // Pill button background is set up separately — on hover only the background scales 1.07×, the text stays (original text over the btn.svg image)
  document.querySelectorAll(".tp-btn").forEach((b) => { if (!b.querySelector(".tp-btn__bg")) { const bg = document.createElement("span"); bg.className = "tp-btn__bg"; bg.setAttribute("aria-hidden", "true"); b.prepend(bg); } });
  const menu = document.querySelector(".tp-menu");
  const open = document.querySelector("[data-menu-open]");
  if (!menu || !open) return;
  const show = (on) => {
    if (on) {
      // About one frame after the press, the disc is raised and lit from the next frame (original STUDIO modal routing). At the instant the disc covers the button, the button’s note retreats too
      if (menu.classList.contains("is-arming")) return;
      menu.classList.add("is-arming");
      setTimeout(() => {
        open.classList.add("is-off");
        menu.hidden = false;
        requestAnimationFrame(() => { menu.classList.remove("is-arming"); menu.classList.add("is-open"); });
      }, 10);
      open.setAttribute("aria-expanded", "true");
    } else {
      menu.classList.remove("is-open");
      open.classList.remove("is-off");
      open.setAttribute("aria-expanded", "false");
      const done = () => { if (!menu.classList.contains("is-open")) menu.hidden = true; };
      menu.addEventListener("transitionend", done, { once: true });
      setTimeout(done, 450);
    }
  };
  open.addEventListener("click", () => show(true));
  menu.querySelectorAll("[data-menu-close]").forEach((b) => b.addEventListener("click", () => show(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) show(false); });
})();
