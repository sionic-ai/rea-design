// Brand About: original values — when the section top touches under the header the header goes transparent (header-entered), and when the section top passes 200px above the screen
// Swaps the attached photo for a fixed photo (entered), and when the top edge of the ‹Leather only› section touches 66% of the screen, switches to the second photo over 1s (slided).
(() => {
  const body = document.body;
  const pin = document.querySelector(".js-pin-container");
  const headH = document.querySelector(".header").clientHeight;
  const flag = (cls, trigger, start) =>
    ScrollTrigger.create({ trigger, start, onEnter: () => body.classList.add(cls), onLeaveBack: () => body.classList.remove(cls) });
  flag("header-entered", pin, `top top+=${headH}`);
  flag("entered", pin, "top top-=200");
  flag("slided", document.querySelector(".js-slider-trigger"), "top 66%");
})();
