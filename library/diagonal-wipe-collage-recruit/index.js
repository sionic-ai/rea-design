// Home — interview card Splide (center-aligned loop with autoplay), hero copy height, slogan letters drop out on scroll
(() => {
  const { ARROW } = window.mdIcons;
  const PEOPLE = [
    ["Your one-line interview title here, and<br>Finish at the second line", "Department name 01", "Team name 01", "Name 01", "Staff member at a laptop · natural office light · landscape 3:2"],
    ["Your second person’s info here<br>Interview title in two lines", "Department name 02", "Team name 02", "Name 02", "Staff member at a laptop · natural office light · landscape 3:2"],
    ["Your third person’s title goes here, and<br>Finish at the second line", "Department name 03", "Team name 03", "Name 03", "Smiling staff member in a yellow shirt · indoor green plants · landscape 3:2"],
    ["Fourth person’s title<br>Split into two lines", "Department name 04", "", "Name 04", "Employee in suit, half-length · office desk · 3:2 landscape"],
  ];
  const list = document.querySelector("[data-cards]");
  list.innerHTML = PEOPLE.map(([head, d1, d2, name, ph], i) => `<li class="splide__slide">
    <article class="md-icard">
      <div class="md-icard__lbl"><span class="md-icard__lbl-en">file.</span><span class="md-icard__lbl-num">0${i + 1}</span></div>
      <div class="md-icard__img"><div class="wf-img" data-label="${ph}"></div></div>
      <p class="md-icard__head"><span class="md-ul">${head}</span></p>
      <div class="md-icard__info"><p>${d1}</p>${d2 ? `<p>${d2}</p>` : ""}<p class="is-name">${name}</p></div>
      <span class="md-circ md-icard__ico">${ARROW}</span>
      <a class="md-icard__link" href="interview.html#file0${i + 1}" aria-label="Interview 0${i + 1} View"></a>
    </article></li>`).join("");

  const el = document.querySelector(".iv__slider");
  const slider = new Splide(el, {
    type: "loop", rewind: true, pagination: false, autoplay: true, arrows: true, pauseOnFocus: false, pauseOnHover: false,
    focus: "center", gap: "20px", mediaQuery: "min",
    breakpoints: { 768: { fixedWidth: "max(400px, calc(100vw * 400 / 1920))" }, 1280: { fixedWidth: "max(780px, calc(100vw * 780 / 1920))" } },
  });
  const cur = el.querySelector("[data-cur]"), len = el.querySelector("[data-len]");
  const num = () => { cur.textContent = String(slider.index + 1).padStart(2, "0"); len.textContent = String(slider.length).padStart(2, "0"); };
  slider.on("mounted active", num);
  slider.mount();
  num();

  // The copy is sticky — decoration below sits based on the copy height
  const mv = document.querySelector(".mv"), copy = document.querySelector(".mv__copy");
  const setH = () => mv.style.setProperty("--copy-h", `${copy.offsetHeight}px`);
  new ResizeObserver(setH).observe(copy);
  setH();

  // Scrolling down more than 50px pushes the slogan letters to the right as they vanish (.6s)
  const bg = document.querySelector(".mv__bg");
  const onScroll = () => bg.classList.toggle("is-scrolled", scrollY > 50);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // The hero is wiped right after load (the original IntersectionObserver hooks it on load).
  const play = () => document.querySelectorAll(".mv__ch, .mv__inner").forEach((n) => n.classList.add("is-animated"));
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) play();
  else document.readyState === "complete" ? play() : addEventListener("load", play, { once: true });
})();
