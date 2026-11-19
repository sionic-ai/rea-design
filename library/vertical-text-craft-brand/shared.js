// The original loads the whole body with jQuery and then brightens it over 2s (fadeIn), and fadeToggles a translucent menu panel (.4s swing) with a two-line button.
// Clicking a menu link closes the panel and the button returns to its place.
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  // As in the original, the body is hidden and then revealed over 2s at window load (after photos are fully downloaded) — if there is no script, it isn’t hidden
  if (!reduce && window.gsap) {
    body.style.opacity = "0";
    const ease = window.CustomEase ? CustomEase.create("nj-css-ease", "0.25,0.1,0.25,1") : "power1.inOut";
    const show = () => gsap.to(body, { opacity: 1, duration: 2, ease, clearProps: "opacity" });
    if (document.readyState === "complete") show();
    else addEventListener("load", show, { once: true });
  }
  const burger = document.querySelector(".nj-burger");
  const menu = document.getElementById("nj-menu");
  if (!burger || !menu || !$) return;
  const dur = reduce ? 0 : 400;
  const toggle = () => {
    $(menu).stop(true, true).fadeToggle(dur);
    const open = !burger.classList.contains("is-active");
    burger.classList.toggle("is-active", open);
    burger.setAttribute("aria-expanded", String(open));
  };
  burger.addEventListener("click", toggle);
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { if (burger.classList.contains("is-active")) toggle(); }));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && burger.classList.contains("is-active")) toggle(); });
})();
