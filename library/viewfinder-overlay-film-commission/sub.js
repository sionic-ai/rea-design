// Shared by subpages: the big photo slot picks one of five each time it opens like the original (only the label changes), and hovering a maker shortcut dims the rest.
(() => {
  const labels = ["Riverside arch bridge and lawn · clear day · landscape 2.4:1", "Two people in a large rocky valley · landscape 2.4:1", "Autumn mountain and lake · Landscape 2.4:1", "Old street alley · landscape 2.4:1", "City night view · landscape 2.4:1"];
  const r = document.querySelector('[data-slot="random-photo"] .wf-img');
  if (r) r.dataset.label = `One of five images each time it opens — ${labels[Math.floor(Math.random() * labels.length)]}`;
  const links = [...document.querySelectorAll(".tf-pagelink")];
  links.forEach((a) => {
    a.addEventListener("mouseenter", () => links.forEach((o) => o.classList.toggle("no-hover", o !== a)));
    a.addEventListener("mouseleave", () => links.forEach((o) => o.classList.remove("no-hover")));
  });
  const logo = document.getElementById("tf-about-logo");
  if (logo && window.TF) logo.insertAdjacentHTML("afterbegin", window.TF.mark);
  window.TF?.fill();
})();
