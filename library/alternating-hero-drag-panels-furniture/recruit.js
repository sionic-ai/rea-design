// Careers — hovering a job row swaps the right-half photo to that row’s photo
(() => {
  const imgs = document.querySelectorAll(".sg-jobs__image .wf-img");
  document.querySelectorAll(".sg-jobs__list li").forEach((li, i) => li.addEventListener("mouseenter", () => {
    imgs.forEach((im) => im.classList.remove("is-active"));
    imgs[i]?.classList.add("is-active");
  }));
})();
