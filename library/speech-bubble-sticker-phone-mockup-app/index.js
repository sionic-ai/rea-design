(() => {
  // Logo, description, notice pill, footer — from 20px below and transparent at 1s cubic-bezier(.19,1,.22,1), each with its own delay (original framer animate)
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const ease = window.CustomEase ? CustomEase.get("hm-0.19,1,0.22,1") || CustomEase.create("hm-0.19,1,0.22,1", "0.19,1,0.22,1") : "expo.out";
    document.querySelectorAll(".hm-rise").forEach((el) => {
      gsap.fromTo(el, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, delay: +(el.dataset.delay || 0), ease });
    });
  });

  // Phone screen video — plays as soon as it can play, like the original (in case a browser blocks autoplay)
  const video = document.querySelector(".hm-phone__screen video");
  if (video) video.addEventListener("canplay", () => video.play().catch(() => {}), { once: true });
})();
