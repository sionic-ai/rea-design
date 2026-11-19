// About: photo slider · vision letters lighting one at a time (0.01s interval, 10% of screen) · 9 value cells · team cards (arrow swapped on hover).
(() => {
  const { reduced, icons } = window.PC;
  PC.creativeSlider(document.querySelector(".ab-slides"));

  const target = document.getElementById("scrolltext");
  const text = target.textContent.trim();
  target.textContent = "";
  [...text].forEach((ch, i) => {
    if (ch === "\n") { target.append(document.createElement("br")); return; }
    const span = document.createElement("span");
    span.textContent = ch;
    span.style.transitionDelay = `${i * 0.01}s`;
    target.append(span);
  });
  if (reduced) target.classList.add("is-active");
  else new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { target.classList.add("is-active"); o.disconnect(); } }, { threshold: 0.1 }).observe(target);

  // In the original each value has a handwritten doodle (underline, star, circle scribble) — in the same spot we draw a new handwritten line and a rhyming doodle
  const marks = [
    '<path d="M4 30Q60 24 120 29" />',
    '<path d="M6 8l4 6M14 4l1 7M22 8l-3 6" />',
    '<path d="M3 30Q50 22 98 30T190 28" />',
    '<path d="M4 31q6-5 12 0t12 0 12 0 12 0" />',
    '<path d="M60 4l3 8 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" />',
    '<ellipse cx="38" cy="18" rx="36" ry="15" />',
    '<ellipse cx="128" cy="18" rx="44" ry="15" />',
    '<path d="M88 10l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" />',
    '<path d="M52 32Q80 26 108 31" />',
  ];
  document.querySelector(".ab-value__list").innerHTML = marks.map((m, i) => `
    <li class="fadeIn">
      <p class="ab-value__num">${String(i + 1).padStart(2, "0")}</p>
      <p class="ab-value__hand"><span>Write a value</span><svg viewBox="0 0 200 36" aria-hidden="true">${m}</svg></p>
      <p class="ab-value__t">Value name here</p>
      <p class="ab-value__tx">Your one-line explanation here.</p>
    </li>`).join("");

  const people = Array.from({ length: 14 }, (_, i) => `
    <li class="fadeIn"><a class="ab-team__a" href="#">
      <div class="ab-team__imgin"><div class="ab-team__img wf-img" data-label="Member ${String(i + 1).padStart(2, "0")} Upper body · white studio background · front view · vertical 5:6"></div></div>
      <div class="ab-team__tx">
        <div><p class="ab-team__name">Name Name</p><p class="ab-team__pos">Position Title</p></div>
        <span class="ab-team__ic"><span class="is-on">${icons.arrowR}</span><span class="is-off">${icons.arrowR}</span></span>
      </div>
    </a></li>`).join("");
  document.querySelector(".ab-team__list").innerHTML = people + `
    <li class="fadeIn"><a class="ab-team__wanted" href="#">
      <div class="ab-team__wantedin">
        <svg class="ab-team__spark" viewBox="0 0 44 44" aria-hidden="true"><path d="M14 4l2.5 9.5L26 16l-9.5 2.5L14 28l-2.5-9.5L2 16l9.5-2.5zM32 22l1.4 5.6L39 29l-5.6 1.4L32 36l-1.4-5.6L25 29l5.6-1.4z"/></svg>
        <p class="ab-team__wen">Wanted !!</p>
        <p class="ab-team__wja">Your one-line question here<svg viewBox="0 0 120 8" preserveAspectRatio="none"><path d="M2 5Q60 1 118 4"/></svg></p>
      </div>
      <span class="ab-team__wic">${icons.arrowUR}</span>
    </a></li>`;
})();
