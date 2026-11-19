// Careers motion. Original values: relationship-chart characters float 5~10px · 1.6~2.4s sine.inOut · career step .4s power3.out + visual .45 back.out(1.5)
(() => {
  const { reduced, blobPath, eyes, mm } = window.VS;
  // Redraw the original’s orange person-shaped character as a blob person with the same feel
  const person = (pose = 0) => `<svg viewBox="0 0 60 80"><circle cx="30" cy="18" r="14" fill="var(--site-orange)"/>${eyes(24, 17, 0.6, 9)}<path d="M18 34h24l4 ${22 + pose}H14z" fill="var(--site-orange)"/><path d="M18 40 ${6 - pose * 2} ${30 - pose * 3}M42 40l${12 + pose * 2} -${10 + pose * 3}M22 56v18M38 56v18" stroke="var(--site-orange)" stroke-width="6" stroke-linecap="round"/></svg>`;
  document.querySelectorAll(".whats__chara").forEach((el, i) => (el.innerHTML = i % 2 ? person(i) : `<svg viewBox="0 0 60 60"><path d="${blobPath(30, 30, 26, i + 3, 6, 0.1)}" fill="var(--site-orange)"/>${eyes(22, 28, 0.8, 12)}</svg>`));
  document.querySelectorAll(".eval__chara").forEach((el, i) => (el.innerHTML = person(i)));

  // Career stairs: five steps that rise toward the right
  const steps = document.querySelector(".career__steps");
  const names = ["Your tier 1 here", "Your tier 2 here", "Your tier 3 here", "Your tier 4 here", "Your tier 5 here"];
  steps.innerHTML = names.map((n, i) => `<div class="step" style="left:${i * 19.5}%;width:18%"><span class="step__chara">${person(i % 3)}</span><div class="step__base" style="height:${40 + i * 50}px">${n}</div><span class="step__time vs-en">${i}Y</span></div>`).join("");

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".whats__chara").forEach((el) => gsap.to(el, { y: (gsap.utils.random(0, 1) > 0.5 ? 1 : -1) * gsap.utils.random(5, 10), duration: gsap.utils.random(1.6, 2.4), delay: gsap.utils.random(0, 0.5), ease: "sine.inOut", repeat: -1, yoyo: true }));
    const items = [...steps.children];
    items.forEach((s) => {
      gsap.set(s.querySelector(".step__base"), { autoAlpha: 0, y: 30 });
      gsap.set(s.querySelector(".step__time"), { autoAlpha: 0, scale: 0.4 });
      gsap.set(s.querySelector(".step__chara"), { autoAlpha: 0, y: -20 });
    });
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".career", start: "top 70%" } });
    items.forEach((s, i) => tl
      .to(s.querySelector(".step__base"), { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, i * 0.35)
      .to(s.querySelector(".step__time"), { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(1.5)" }, i * 0.35)
      .to(s.querySelector(".step__chara"), { autoAlpha: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" }, i * 0.35 + 0.2));
  });
})();
