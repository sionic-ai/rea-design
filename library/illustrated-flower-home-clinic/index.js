// First page — header photo fade (slick), hovering the second text block swaps the picture, entering the region strip lights the pin
(() => {
  const { reduce } = window.gSite;
  // Original slick settings as is — switches every 5s with a 1s overlap, doesn’t pause on hover
  $(".hero__slide").slick({
    fade: true,
    autoplay: !reduce,
    autoplaySpeed: 5000,
    adaptiveHeight: true,
    speed: reduce ? 0 : 1000,
    arrows: false,
    dots: false,
    pauseOnFocus: false,
    pauseOnHover: false,
  });

  const img = document.getElementById("medical-image");
  const kanwa = document.getElementById("kanwa");
  kanwa.addEventListener("mouseenter", () => img.classList.add("is-hovered"));
  kanwa.addEventListener("mouseleave", () => img.classList.remove("is-hovered"));

  // Original: active on the section from when the region section’s top edge has passed 10% of its height until 10% before its bottom edge
  ScrollTrigger.create({ trigger: "#home_area", start: "top-=10%", end: "bottom-=10%", toggleClass: "active" });
})();
