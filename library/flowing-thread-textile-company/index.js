// First page: thread-color canvas (turned off after the company About section) · history slider · business pin (list flow + photo cover)
(() => {
  const { reduced, sp } = window.ST;

  // ── Color threads: the bundle center sits 15.26rem below on PC and -0.1rem on phone. It turns off and stops once the bottom of the company About section leaves the top of the screen ──
  const canvas = document.querySelector(".kv__canvas");
  const threads = ST.threads(canvas, { band: (rem) => (sp.matches ? -0.1 : 15.26) * rem });
  const about = document.querySelector(".about");
  let on = -1;
  const vis = () => {
    const v = about.getBoundingClientRect().bottom > 0 ? 1 : 0;
    if (v === on) return;
    on = v;
    canvas.style.opacity = String(v);
    v ? threads.start() : threads.stop();
  };
  addEventListener("scroll", () => requestAnimationFrame(vis), { passive: true });
  vis();

  // ── History: nine eras. The text, photo and year panels each slide 99.9rem at different lengths ──
  const ERAS = [
    ["1900", "1914", "An era of starting a business and opening a first shop", ["Founder black-and-white portrait · front view · portrait 4:5", "Old group photo of people, black and white · indoors · landscape"]],
    ["1915", "1929", "An era of raising a new name for your company", ["Old headquarters · B&W · front view · portrait", "Women in kimono, black and white · Street · Landscape"]],
    ["1930", "1944", "An era of expanding our bases", ["Staff group photo, black and white · in front of headquarters · landscape", "Black-and-white cart in front of warehouse · landscape"]],
    ["1945", "1959", "An era of rising again", ["Street under reconstruction, black and white · aerial · landscape", "Factory workbench B&W · side light · landscape"]],
    ["1960", "1974", "The era of making new fabrics", ["Fabric swatch book black and white · close-up · portrait"]],
    ["1975", "1989", "The Age of\nGoing Global", ["Overseas exhibition booth · faded color · landscape", "Business trip group photo · airport · landscape"]],
    ["1990", "2004", "The era of making clothes together", ["Sewing factory · fluorescent light · landscape", "Hands doing pattern work · Macro · Landscape", "Sample clothes rack · vertical"]],
    ["2005", "2019", "The age of reviving\nmaterials", ["Recycled fiber cotton · natural light · landscape", "New headquarters exterior · clear day · horizontal"]],
    ["2020", "0000", "The era of taking\nthe next step", ["Staff meeting · bright indoors · square", "New logo sign · Front · Landscape"]],
  ];
  const stage = document.querySelector(".history__stage");
  const years = stage.querySelector(".history__track--years");
  const images = stage.querySelector(".history__track--images");
  const texts = stage.querySelector(".history__track--text");
  const ind = stage.querySelector(".history__indicator");
  ERAS.forEach(([from, to, title, pics], n) => {
    years.insertAdjacentHTML("beforeend", `<div class="history__year-col" style="--n:${n}"><span class="history__bgyear">${from}</span><span class="history__bgline"></span></div>`);
    images.insertAdjacentHTML("beforeend", `<div class="history__img-col" style="--n:${n}">${pics.map((p, k) => `<div class="history__img history__img--${k + 1}"><div class="wf-img" data-label="${p}"></div></div>`).join("")}</div>`);
    texts.insertAdjacentHTML("beforeend", `<div class="history__text-col" style="--n:${n}" aria-hidden="${n ? "true" : "false"}"><div><span class="history__line"></span><p class="history__year"><span>${from}</span><i></i><span>${to}</span></p><h3 class="history__ttl">${title.replace("\n", "<br>")}</h3><p class="history__desc">Add about five lines on what happened in this era here. Who inherited what and what kind of business they started.</p></div></div>`);
    ind.insertAdjacentHTML("beforeend", `<button class="history__dot" type="button" role="tab" data-go="${n}"><i></i><span>${from}</span></button>`);
  });
  const dots = ind.querySelectorAll(".history__dot");
  const prev = stage.querySelector(".history__nav--prev");
  const nextBtn = stage.querySelector(".history__nav--next");
  const cols = texts.querySelectorAll(".history__text-col");
  let idx = 0;
  const go = (i) => {
    idx = Math.max(0, Math.min(ERAS.length - 1, i));
    stage.style.setProperty("--i", idx);
    dots.forEach((d, k) => { d.classList.toggle("is-active", k === idx); d.setAttribute("aria-selected", String(k === idx)); });
    cols.forEach((c, k) => c.setAttribute("aria-hidden", String(k !== idx)));
    prev.disabled = idx === 0;
    nextBtn.disabled = idx === ERAS.length - 1;
  };
  prev.addEventListener("click", () => go(idx - 1));
  nextBtn.addEventListener("click", () => go(idx + 1));
  dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.go))));
  go(0);

  // ── Business: photos stacked in numeric order, only the incoming one opens top to bottom (.8s) ──
  const sec = document.querySelector(".biz");
  const items = [...sec.querySelectorAll(".biz__item")];
  const imgs = [...sec.querySelectorAll(".biz__img")];
  const SHOW = "inset(-1px -1px -1px -1px)";
  const HIDE = "inset(0 0 100% 0)";
  imgs.forEach((w, i) => { w.style.zIndex = String(i + 1); w.style.clipPath = i === 0 ? SHOW : HIDE; });
  items[0].classList.add("is-active");
  let current = 0;
  const setActive = (index) => {
    if (index === current) return;
    const fwd = index > current;
    imgs.forEach((w, i) => {
      const target = i <= index ? SHOW : HIDE;
      const anim = !reduced && (fwd ? i === index : i === current);
      w.style.transition = "none";
      if (anim) {
        w.style.clipPath = fwd ? HIDE : SHOW;
        w.offsetHeight;
        w.style.transition = "clip-path 0.8s ease";
      }
      w.style.clipPath = target;
    });
    items.forEach((it, i) => it.classList.toggle("is-active", i === index));
    current = index;
  };

  const mm = gsap.matchMedia();
  // Phone: a list item becomes active when it crosses the center line of the screen
  mm.add("(max-width: 900px)", () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.index))), { rootMargin: "-50% 0px -50% 0px" });
    items.forEach((it) => io.observe(it));
    return () => io.disconnect();
  });
  // PC: pin the body at the vertical center of the screen and raise the right list track.
  // At the end frame, 04 sits at the panel center, and once an item’s top line passes the 45% (+16px) line of the panel height the photo swaps (original values)
  mm.add("(min-width: 901px)", () => {
    const body = sec.querySelector(".biz__body");
    const right = sec.querySelector(".biz__right");
    const imgCol = sec.querySelector(".biz__img-col");
    const stageEl = sec.querySelector(".biz__stage");
    const track = document.createElement("div");
    track.className = "biz__track";
    while (right.firstChild) track.appendChild(right.firstChild);
    right.appendChild(track);
    imgCol.style.position = "relative";
    imgCol.style.top = "auto";
    track.style.padding = "221px 0 48px";
    let stageH, pinOffset, offsets, travel, trigY;
    const measure = () => {
      gsap.set(track, { y: 0 });
      body.style.height = "";
      stageH = stageEl.offsetHeight || 668;
      pinOffset = Math.max(Math.round((innerHeight - stageH) / 2), 0);
      body.style.height = stageH + "px";
      imgCol.style.clipPath = `inset(-${pinOffset}px 0 0 0)`;
      const top = track.getBoundingClientRect().top;
      offsets = items.map((it) => it.getBoundingClientRect().top - top);
      const lastH = items[items.length - 1].getBoundingClientRect().height;
      travel = Math.max(offsets[offsets.length - 1] + lastH / 2 - stageH / 2, 0);
      trigY = Math.max(stageH * 0.45, stageH / 2 - lastH / 2 + 2) + 16;
    };
    measure();
    const st = ScrollTrigger.create({
      trigger: body,
      start: () => "top " + pinOffset,
      end: () => "+=" + Math.max(travel * (2.8 / 3), innerHeight),
      pin: true,
      scrub: reduced ? true : 0.5,
      animation: gsap.fromTo(track, { y: 0 }, { y: () => -travel, ease: "none" }),
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onUpdate: (self) => {
        const y = -self.progress * travel;
        let a = 0;
        offsets.forEach((o, i) => { if (o + y <= trigY) a = i; });
        setActive(a);
      },
      onLeave: () => setActive(items.length - 1),
      onLeaveBack: () => setActive(0),
    });
    return () => {
      st.kill(true);
      while (track.firstChild) right.appendChild(track.firstChild);
      track.remove();
      body.style.height = "";
      imgCol.style.cssText = "";
    };
  });
})();
