// About — three-photo fade slider, facility slider (tabs, big name swap), map pin enlarge
(() => {
  document.querySelectorAll("[data-hours]").forEach((el) => { el.outerHTML = window.shHours("is-out"); });

  new Swiper(".sh-ab-im", {
    loop: true, speed: 2200, effect: "fade",
    autoplay: { delay: 2000, disableOnInteraction: false },
    pagination: { el: ".sh-ab-im__pg", clickable: true },
    allowTouchMove: false, simulateTouch: false,
  });

  const rooms = [["Room 1", "ROOM ONE", "Reception desk · white counter · bright lighting"], ["Room 2", "ROOM TWO", "Waiting room · wooden wall sofa · warm light"], ["Room 3", "ROOM THREE", "Name · desk and two chairs"], ["Room 4", "ROOM FOUR", "Exam room · monitor and treatment chair"], ["Room 5", "ROOM FIVE", "Studio room · large equipment"], ["Room 6", "ROOM SIX", "Treatment room · two beds"], ["Room 7", "ROOM SEVEN", "Exam prep room · chair row"], ["Room 8", "ROOM EIGHT", "Lab room · Equipment monitor · Dim lighting"]];
  document.querySelector("[data-fac]").innerHTML = rooms.map(([, , l]) => `<figure class="swiper-slide wf-img" data-label="${l} · Landscape 3:2"></figure>`).join("");
  document.querySelector("[data-fac-tabs]").innerHTML = rooms.map(([t]) => `<li><a href="#">${t}</a></li>`).join("");
  document.querySelector("[data-fac-ttl]").innerHTML = rooms.map(([t, e]) => `<div class="sh-fac__box"><p class="j">${t}</p><p class="e">${e}</p></div>`).join("");
  const fac = new Swiper(".sh-fac-sw", { centeredSlides: true, speed: 500, slidesPerView: 1, navigation: { nextEl: ".sh-fac__nav.is-next", prevEl: ".sh-fac__nav.is-prev" } });
  const tabs = [...document.querySelectorAll("[data-fac-tabs] a")], boxes = [...document.querySelectorAll(".sh-fac__box")];
  const mark = () => {
    tabs.forEach((a, i) => a.classList.toggle("is-active", i === fac.activeIndex));
    boxes.forEach((b, i) => b.classList.toggle("is-active", i === fac.activeIndex));
  };
  tabs.forEach((a, i) => a.addEventListener("click", (e) => { e.preventDefault(); fac.slideTo(i); }));
  fac.on("slideChange", mark);
  mark();

  // Original adds .play when the pin spot enters the -25% band of the screen, and grows it in .4s
  const pin = document.querySelector(".sh-acc__pin");
  if (pin) new IntersectionObserver((es, io) => es.forEach((e) => { if (e.isIntersecting) { pin.classList.add("is-play"); io.disconnect(); } }), { rootMargin: "-25% 0px" }).observe(pin);
})();
