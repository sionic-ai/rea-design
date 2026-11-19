// Home page scenes: house outline decoration following the mouse, news glass circle, house-masked video, timeline pinned steps, news signup form, video window.
(() => {
  // Five step illustrations — redrew line art of the same feel in place of the original illustrations (scaffold, megaphone, walking together, building, sharing)
  const ILL = {
    scaffold: `<rect class="bg" width="412" height="413"/>
      <path class="a" d="M92 150h228v14H92zM92 240h228v14H92zM92 330h228v14H92z"/>
      <path class="ln" d="M110 80v290M206 80v290M302 80v290M92 150h228M92 240h228M92 330h228M110 150l96 90M206 150l96 90M110 240l96 90M206 240l96 90"/>
      <circle class="b" cx="160" cy="196" r="14"/><path class="ln" d="M160 210v20M148 240l12-10 12 10M146 218h28"/>
      <path class="c" d="M248 110l26-14 26 14v24h-52z"/><path class="ln" d="M248 110l26-14 26 14v24h-52z"/>`,
    call: `<rect class="bg" width="412" height="413"/>
      <path class="b" d="M118 178l120-64v186l-120-64z"/><path class="ln" d="M118 178l120-64v186l-120-64zM118 178h-26v58h26M104 236l18 64h26l-10-58"/>
      <path class="ln" d="M268 160c18 14 18 80 0 94M292 136c34 28 34 114 0 142M316 112c50 40 50 150 0 190"/>
      <rect class="w" x="150" y="60" width="74" height="40" rx="4"/><path class="ln" d="M150 60h74v40h-74zM162 74h50M162 86h34"/>
      <circle class="c" cx="96" cy="320" r="10"/><circle class="a" cx="330" cy="330" r="16"/>`,
    guide: `<rect class="bg" width="412" height="413"/>
      <path class="a" d="M70 360c40-60 140-30 160-90s120-70 120-150h24c0 92-108 104-124 158s-130 40-156 82z"/>
      <path class="ln" d="M70 360c40-60 140-30 160-90s120-70 120-150"/>
      <circle class="b" cx="160" cy="150" r="18"/><circle class="c" cx="232" cy="164" r="18"/>
      <path class="ln" d="M160 168v60M232 182v60M160 190l36 10 36-6M144 262l16-34 16 34M216 276l16-34 16 34"/>
      <circle class="ln" cx="350" cy="110" r="12"/><path class="ln" d="M350 98v-30l26 10-26 10"/>`,
    build: `<rect class="bg" width="412" height="413"/>
      <path class="w" d="M92 230l110-62 120 66v120H92z"/><path class="ln" d="M92 230l110-62 120 66v120H92zM150 354v-70h48v70M236 270h48v40h-48z"/>
      <path class="ln" d="M330 354V70M330 70H140M330 110l-40-40M300 70v30M180 70v54"/>
      <rect class="c" x="160" y="124" width="40" height="30"/><path class="ln" d="M160 124h40v30h-40z"/>
      <path class="a" d="M70 354h272v16H70z"/>`,
    share: `<rect class="bg" width="412" height="413"/>
      <ellipse class="a" cx="206" cy="232" rx="104" ry="58"/><ellipse class="ln" cx="206" cy="232" rx="104" ry="58"/>
      <circle class="b" cx="206" cy="128" r="18"/><circle class="c" cx="84" cy="216" r="18"/><circle class="b" cx="328" cy="216" r="18"/><circle class="w" cx="206" cy="336" r="18"/>
      <circle class="ln" cx="206" cy="128" r="18"/><circle class="ln" cx="84" cy="216" r="18"/><circle class="ln" cx="328" cy="216" r="18"/><circle class="ln" cx="206" cy="336" r="18"/>
      <path class="ln" d="M150 210c20-18 72-18 92 0M262 254c-20 18-72 18-92 0M234 206l8 4-2 8M178 258l-8-4 2-8"/>`,
  };
  document.querySelectorAll("[data-ill]").forEach((el) => {
    const body = ILL[el.dataset.ill];
    if (body) el.innerHTML = `<svg class="w-ill" viewBox="0 0 412 413" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}</svg>`;
  });

  // Two house-outline ornaments — convert the mouse position to −1~1 around the screen center and follow it by .06 per frame, the first as is and the second reversed, ±20px and ±14px.
  const decoFollow = () => {
    const decos = [...document.querySelectorAll(".w-hero__deco")];
    if (!decos.length || wPage.reduce() || ("ontouchstart" in window && !matchMedia("(pointer: fine)").matches)) return;
    const target = { x: 0, y: 0 }, now = { x: 0, y: 0 };
    const move = (e) => { target.x = (e.clientX / innerWidth - 0.5) * 2; target.y = (e.clientY / innerHeight - 0.5) * 2; };
    const tick = () => {
      now.x += (target.x - now.x) * 0.06;
      now.y += (target.y - now.y) * 0.06;
      decos.forEach((d, i) => {
        const s = i === 0 ? 1 : -1;
        d.style.setProperty("--deco-px", `${now.x * 20 * s}px`);
        d.style.setProperty("--deco-py", `${now.y * 14 * s}px`);
      });
    };
    addEventListener("mousemove", move);
    gsap.ticker.add(tick);
  };

  // Blurred glass circle — sticks right at the mouse position inside the list, turns on over a card (.3s, CSS)
  const cursorGlass = () => {
    document.querySelectorAll("[data-cursor-glass]").forEach((list) => {
      const circle = list.querySelector("[data-cursor-glass-circle]");
      const items = list.querySelectorAll("[data-cursor-glass-item]");
      if (!circle || !items.length) return;
      const r = circle.offsetWidth / 2;
      list.addEventListener("mousemove", (e) => {
        const box = list.getBoundingClientRect();
        circle.style.left = `${e.clientX - box.left - r}px`;
        circle.style.top = `${e.clientY - box.top - r}px`;
      });
      items.forEach((it) => {
        it.addEventListener("mouseenter", () => circle.classList.add("is-active"));
        it.addEventListener("mouseleave", () => circle.classList.remove("is-active"));
      });
    });
  };

  // House mask — from when the section head reaches 50% of the screen (100% on phone) until the section has fully exited upward, --mask-scale .08 → 1.5 (mask width 24% → 450%), scrub 1.5
  const videoMask = () => {
    document.querySelectorAll("[data-video-house-mask]").forEach((sec) => {
      const inner = sec.querySelector("[data-video-house-mask-inner]");
      if (!inner) return;
      gsap.fromTo(inner, { "--mask-scale": 0.08 }, {
        "--mask-scale": 1.5, ease: "none",
        scrollTrigger: { trigger: sec, start: () => (innerWidth >= 768 ? "top 50%" : "top 100%"), end: "bottom top", scrub: 1.5 },
      });
    });
  };

  // Timeline — once the body reaches screen center, pinned at steps × 100%. At each step boundary the current one slides up −50% (image −25%) over .25,
  // .25 later the next one rises from 50% below (picture 25%). .3 pause between steps. The ruler shifts left over the full length by (steps − 1) × ruler width
  const timeline = () => {
    const sec = document.querySelector(".w-timeline");
    if (!sec) return;
    const body = sec.querySelector(".w-timeline__body");
    const titles = sec.querySelectorAll(".w-timeline__step-title");
    const texts = sec.querySelectorAll(".w-timeline__step-text");
    const nums = sec.querySelectorAll(".w-timeline__num");
    const images = sec.querySelectorAll(".w-timeline__image");
    const track = sec.querySelector("[data-timeline-ruler]");
    const n = titles.length;
    if (n < 2) return;
    gsap.set([titles, texts, nums, images], { yPercent: 0, opacity: 0 });
    gsap.set([titles[0], texts[0], nums[0], images[0]], { opacity: 1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: body, start: "center center", end: `+=${n * 100}%`, pin: body, scrub: true } });
    const step = 0.25;
    for (let i = 0; i < n - 1; i++) {
      const at = `step-${i}`, inAt = `step-${i}-in`;
      tl.add(at).add(inAt, `${at}+=${step}`);
      tl.to([titles[i], texts[i], nums[i]], { yPercent: -50, opacity: 0, duration: step }, at);
      tl.to(images[i], { yPercent: -25, opacity: 0, duration: step }, at);
      tl.fromTo([titles[i + 1], texts[i + 1], nums[i + 1]], { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: step }, inAt);
      tl.fromTo(images[i + 1], { yPercent: 25, opacity: 0 }, { yPercent: 0, opacity: 1, duration: step }, inAt);
      if (i < n - 2) tl.to({}, { duration: 0.3 });
    }
    if (track) {
      const ruler = sec.querySelector(".w-ruler");
      const segs = track.querySelectorAll(".w-ruler__seg");
      const w = ruler.offsetWidth;
      gsap.set(segs, { width: w });
      tl.fromTo(track, { x: 0 }, { x: -(n - 1) * w, duration: tl.duration(), ease: "none" }, 0);
    }
  };

  const scenes = () => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => { videoMask(); timeline(); });
  };

  decoFollow();
  cursorGlass();
  wPage.add(scenes);

  // Get news — nothing is sent, only a notice line appears
  const form = document.querySelector("[data-newsletter-form]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fb = form.querySelector("[data-newsletter-feedback]");
    fb.textContent = "Your one-line application result notice appears here.";
    fb.classList.add("is-visible");
  });

  // Video window — opening stops Lenis and plays the video, it closes with a .25s fade via backdrop, close button or Esc
  const modal = document.querySelector(".w-modal");
  const video = modal?.querySelector("video");
  const close = () => {
    if (!modal || modal.hidden) return;
    modal.classList.add("is-closing");
    setTimeout(() => { modal.hidden = true; modal.classList.remove("is-closing"); video?.pause(); wPage.lenis()?.start(); }, 250);
  };
  document.querySelectorAll("[data-video-open]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    if (!modal) return;
    modal.hidden = false;
    wPage.lenis()?.stop();
    video?.play().catch(() => {});
  }));
  modal?.querySelectorAll("[data-video-close]").forEach((b) => b.addEventListener("click", close));
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
