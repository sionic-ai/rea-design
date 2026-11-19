// Branding — question expand: on press only that answer opens in .4s power4.out height and the others close
addEventListener("DOMContentLoaded", () => {
  const items = [...document.querySelectorAll(".ms-faq__item")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  items.forEach((it) => {
    const q = it.querySelector(".ms-faq__q"), a = it.querySelector(".ms-faq__a");
    q.addEventListener("click", () => {
      const open = q.getAttribute("aria-expanded") === "true";
      items.forEach((o) => {
        const oq = o.querySelector(".ms-faq__q"), oa = o.querySelector(".ms-faq__a");
        if (o !== it && oq.getAttribute("aria-expanded") === "true") { oq.setAttribute("aria-expanded", "false"); gsap.to(oa, { height: 0, duration: reduce ? 0 : 0.4, ease: "power4.out" }); }
      });
      q.setAttribute("aria-expanded", String(!open));
      gsap.to(a, { height: open ? 0 : a.scrollHeight, duration: reduce ? 0 : 0.4, ease: "power4.out" });
    });
  });
});
// Customer video card — each press toggles play and pause
addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".ms-vcard__media").forEach((b) => b.addEventListener("click", () => {
    const on = b.classList.toggle("is-playing");
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Video paused" : "Video playback");
  }));
});
