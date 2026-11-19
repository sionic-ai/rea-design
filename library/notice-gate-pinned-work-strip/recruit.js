// New-grad recruiting — header white background transition, appears at 50% visible, three-role switching (.8s fade), question expand, phone menu, file upload field (same FilePond as the original)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Lenis && !reduce) {
    const lenis = new Lenis();
    window.lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const head = document.querySelector(".fr-head");
  const onScroll = () => head.classList.toggle("is-scroll", scrollY > 0);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  head.querySelector(".fr-head__btn").addEventListener("click", () => head.classList.toggle("is-on"));
  head.querySelectorAll(".fr-head__right a").forEach((a) => a.addEventListener("click", () => head.classList.remove("is-on")));

  const fades = document.querySelectorAll(".fr-fade");
  if (reduce) fades.forEach((el) => el.classList.add("is-show"));
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-show");
      io.unobserve(e.target);
    }), { threshold: 0.5 });
    fades.forEach((el) => io.observe(el));
  }

  // Job paging — side buttons show the previous and next job names
  const items = [...document.querySelectorAll(".fr-job__item")];
  const prev = document.querySelector(".fr-job__prev"), next = document.querySelector(".fr-job__next");
  let cur = 0;
  const name = (i) => items[(i + items.length) % items.length].querySelector(".fr-job__pos-ko").textContent.replace(/(Retouching|Filming) (Host)/, "$1<br>$2");
  const labels = () => {
    prev.querySelector(".fr-job__label").innerHTML = name(cur - 1);
    next.querySelector(".fr-job__label").innerHTML = name(cur + 1);
  };
  const show = (i) => {
    items[cur].classList.remove("is-active");
    cur = (i + items.length) % items.length;
    items[cur].classList.add("is-active");
    labels();
  };
  prev.addEventListener("click", () => show(cur - 1));
  next.addEventListener("click", () => show(cur + 1));
  labels();

  document.querySelectorAll(".fr-qa__q").forEach((q) => q.addEventListener("click", () => q.parentNode.classList.toggle("is-on")));

  if (window.FilePond) {
    document.querySelectorAll('.fr-entry input[type="file"]').forEach((input) => FilePond.create(input, {
      storeAsFile: true,
      credits: false,
      labelIdle: 'Drag your files here (pdf / jpg / png)<br>If there are several, combine them into one pdf. Max 300MB <span class="filepond--label-action">Choose File</span>',
    }));
  }
})();
