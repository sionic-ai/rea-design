// Brand — fills the column cards, rising photo strip and social feed strip, and the social feed strip is swiped by hand with Swiper (2.3 slides, 3.5 on wide screens, gaps 16 · 30).
(() => {
  const { NM } = window;
  const strip = ["Person sleeping under a white duvet on a bed", "Person sitting on a duvet", "Window bed and nightstand", "Painting of night sky and snow-capped mountain", "Mattress quilting close-up", "Person with their face buried in a pillow"];
  document.querySelector(".nm-deco .swiper-wrapper").innerHTML = strip.map((s) => `<div class="swiper-slide"><div class="nm-ph"><div class="wf-img" data-label="${s} · Portrait 4:5"></div></div></div>`).join("");
  document.querySelector(".ab-column__grid").innerHTML = ["Orange large-type column cover 1", "Orange large-type column cover 2", "Orange large-type column cover 3"]
    .map((s, i) => `<a href="article.html"><article><div class="nm-ph"><div class="wf-img" data-label="${s} · Over a blurred bedroom photo · landscape 330:195"></div></div><h3>A long column title running close to three lines goes here ${i + 1} — Your note on how to choose goes here</h3></article></a>`).join("");
  document.querySelector(".ab-follow__slide .swiper-wrapper").innerHTML = ["Morning sunlight on mattress", "Person in pajamas", "Bedroom Accessories", "Pillow Close-up", "Window curtain"]
    .map((s) => `<div class="swiper-slide"><a href="#"><div class="nm-ph"><div class="wf-img" data-label="${s} · Square"></div></div><b>brand_official</b><p>Put two lines of post text here. One line of tags here.</p></a></div>`).join("");

  NM.page = () => {
    if (window.Swiper) new Swiper(".ab-follow__slide", { slidesPerView: 2.3, spaceBetween: 16, breakpoints: { 750: { slidesPerView: 3.5, spaceBetween: 30 } } });
  };
})();
