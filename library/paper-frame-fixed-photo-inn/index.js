// Hero — original webStorage: on the first visit in this tab, the photo panel at 0.3s · logo at 1.2s · headline·copy·booking pill at 2s appear in turn, from the second visit on they show right away
(() => {
  const kvLogo = document.querySelector("#kv .logo");
  if (kvLogo && window.skLogo) kvLogo.innerHTML = window.skLogo;
  const body = document.body, wrap = document.querySelector(".fixed-bg .swiper-wrap");
  const later = [document.getElementById("header"), document.getElementById("fContact"), ...document.querySelectorAll(".fixed-bg .scroll, .fixed-bg .sttlBox")];
  if (sessionStorage.getItem("sk-access")) {
    body.classList.add("is-active");
    document.getElementById("container")?.classList.add("is-active");
  } else {
    sessionStorage.setItem("sk-access", "true");
    setTimeout(() => wrap?.classList.add("fade-in"), 300);
    setTimeout(() => kvLogo?.classList.add("fade-in"), 1200);
    setTimeout(() => later.forEach((el) => el?.classList.add("fade-in")), 2000);
  }

  // Past 100px of scrolling the logo and copy leave (fast), and the darkness over the photo deepens from 0.3 → 0.45
  const fast = [kvLogo, ...document.querySelectorAll(".fixed-bg .scroll, .fixed-bg .sttlBox")];
  const home = document.getElementById("home01");
  const onScroll = () => {
    const y = scrollY;
    fast.forEach((el) => el?.classList.toggle("fast", y > 100));
    const h = (home?.offsetHeight || 0) - 1000;
    document.documentElement.style.setProperty("--overlay-opacity", String(Math.min(0.45, 0.3 + (y / h) * 0.15)));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!window.Swiper) return;
  new Swiper(".mySwiper", { loop: true, effect: "fade", autoplay: { delay: 4000, disableOnInteraction: false }, speed: 2000, observer: true, observeParents: true });
  new Swiper(".roomSlider1", { loop: true, effect: "fade", autoplay: { delay: 3000, disableOnInteraction: false }, speed: 800 });
  new Swiper(".roomSlider2", { loop: true, effect: "fade", autoplay: { delay: 3000, disableOnInteraction: false }, speed: 800 });
  new Swiper(".experienceSlider", { loop: true, autoplay: { delay: 0, disableOnInteraction: false }, speed: 4000, centeredSlides: true, spaceBetween: 25, allowTouchMove: false, slidesPerView: 1.5, breakpoints: { 819: { centeredSlides: true, spaceBetween: 25, slidesPerView: 4 } }, on: { init() { this.update(); } } });
})();
