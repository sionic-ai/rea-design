// First page motion — original values: hero photo yPercent 0→25 (starts 110px above the head, scrub) · director card pinned (no pinSpacing) · cover 0.1→0 ·
// Director photo yPercent 0→25 · caution drawer height .5s · tab content .5s. The person illustration lines are redrawn each time by measuring the nameplate position.
(() => {
  const { rpx, reduced } = window.HD;
  const fv = document.querySelector(".fv");
  const image = fv.querySelector(".fv__image");
  const intro = fv.querySelector(".fv__intro");
  const pin = fv.querySelector(".fv__intro-pin");
  const mask = fv.querySelector(".fv__mask");

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(fv.querySelector(".fv__photo"), { yPercent: 0 }, {
      yPercent: 25, ease: "none",
      scrollTrigger: { trigger: image, start: () => `top-=${rpx(110)} top`, end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });
    ScrollTrigger.create({
      trigger: image, start: "top bottom", end: "bottom top",
      onToggle: (self) => image.classList.toggle("is-active", self.isActive),
    });
    ScrollTrigger.create({
      trigger: intro, start: "top bottom", end: "top top", pin, pinSpacing: false, invalidateOnRefresh: true,
      onUpdate: (self) => {
        mask.style.opacity = 0.1 * (1 - self.progress);
        intro.classList.toggle("is-show", self.progress > 0.1);
      },
    });
    gsap.fromTo(fv.querySelector(".fv__intro-img"), { yPercent: 0 }, {
      yPercent: 25, ease: "none",
      scrollTrigger: { trigger: intro, start: () => `bottom top+=${intro.offsetHeight}`, end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    pin.style.top = "0";
    mask.style.opacity = 0;
    intro.classList.add("is-show");
  });

  // Notice drawer: fix the current height in px, then go to the target height on the next frame — opens and closes in .5s even with auto height
  const note = document.querySelector(".news__note");
  if (note) {
    const label = note.querySelector(".news__note-label");
    const body = note.querySelector(".news__note-body");
    const inner = note.querySelector(".news__note-in");
    const arrow = label.querySelector(".hd-ar");
    body.addEventListener("transitionend", () => {
      body.style.height = "";
      body.classList.remove("is-anim");
      ScrollTrigger.refresh();
    });
    label.addEventListener("click", () => {
      const open = !note.classList.contains("is-open");
      note.classList.toggle("is-open", open);
      arrow.classList.toggle("hd-ar--d", !open);
      arrow.classList.toggle("hd-ar--u", open);
      body.classList.remove("is-anim");
      body.style.height = open ? "0px" : inner.offsetHeight + "px";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        body.classList.add("is-anim");
        body.style.height = open ? inner.offsetHeight + "px" : "0px";
      }));
    });
  }

  const flow = document.querySelector(".flow__main");
  flow.querySelectorAll(".flow__btn").forEach((b) => b.addEventListener("click", () => {
    flow.dataset.current = b.dataset.name;
    ScrollTrigger.refresh();
  }));

  // Extends the name tag’s top line straight to a body part — target point is a ratio inside the body drawing box (fx, fy). Measured end points of the original line drawing (120×60rem)
  const TARGET = { b1: [0.5, 0.2108], b2: [0.5, 0.2487], b3: [0.2447, 0.4237], b4: [0.3149, 0.9837], b5: [0.4989, 0.132], b6: [0.5011, 0.167], b7: [0.4989, 0.3125], b8: [0.4989, 0.5383] };
  const list = document.querySelector(".svc__list");
  const lines = list.querySelector(".svc__lines");
  const bodyFig = list.querySelector(".svc__body");
  const draw = () => {
    const L = list.getBoundingClientRect();
    const B = bodyFig.getBoundingClientRect();
    const sp = window.HD.isSP();
    lines.setAttribute("viewBox", `0 0 ${L.width} ${L.height}`);
    lines.innerHTML = Object.entries(TARGET).map(([k, [fx, fy]]) => {
      const lab = list.querySelector(`.svc__block.${k} ${sp ? ".hd-tline__t" : ".svc__label"}`).getBoundingClientRect();
      const right = k > "b4";
      const y = (sp ? lab.top + lab.height / 2 : lab.top - 1) - L.top;
      const x1 = (right ? lab.left - (sp ? 6 : 0) : lab.right + (sp ? 6 : 0)) - L.left;
      const x0 = sp ? x1 : (right ? lab.right : lab.left) - L.left;
      const tx = B.left - L.left + B.width * fx;
      const ty = B.top - L.top + B.height * fy;
      return `<path d="M${x0} ${y}H${x1}L${tx} ${ty}"/>`;
    }).join("");
  };
  draw();
  addEventListener("resize", draw);
  addEventListener("hd:ready", draw);
})();
