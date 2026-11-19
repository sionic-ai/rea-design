// Home — review slide: next one every 5s (.5s overlapping change), pauses on hover and resumes 5s after release. Nav buttons attach to the lower left of the photo.
addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".sa-slider");
  if (!slider) return;
  const slides = [...slider.children], nav = document.querySelector(".sa-slider__nav");
  const [prev, next] = nav.querySelectorAll("button");
  const place = () => {
    const top = slider.querySelector("li.active .sa-slide__top");
    nav.style.top = innerWidth >= 1280 && top ? top.clientHeight - nav.clientHeight + "px" : "";
  };
  setTimeout(place, 1000);
  addEventListener("resize", place);
  const now = () => slides.findIndex((s) => s.classList.contains("active"));
  const go = (i) => { slides[now()].classList.remove("active"); slides[i].classList.add("active"); restart(); };
  const step = () => go((now() + 1) % slides.length);
  let timer = setInterval(step, 5000);
  const restart = () => { clearInterval(timer); timer = setInterval(step, 5000); };
  prev.addEventListener("click", () => go((now() - 1 + slides.length) % slides.length));
  next.addEventListener("click", step);
  slider.addEventListener("mouseover", () => clearInterval(timer));
  slider.addEventListener("mouseout", restart);
});
