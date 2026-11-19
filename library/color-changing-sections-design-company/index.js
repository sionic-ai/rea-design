// First page loader — original values: the center word changes every .2s (change at 0s), the last word holds .3s more
// The panel drops down at 1.2/1.3s (curve 0.5,0,0,1), while the text goes down with 1.2/1.9s power2.inOut and vanishes at .4s. The page comes down from -5vh in 1.2s.
(() => {
  const loader = document.querySelector(".ss-loader");
  if (!loader) return;
  const reduce = window.ss?.reduce;
  const lines = [...loader.querySelectorAll(".lines")];
  const page = document.querySelector(".ss-page");
  const P = { duration: 1.2, between: 0.2 };
  const ease = window.CustomEase ? CustomEase.create("ss-loader", "0.5, 0, 0, 1") : "expo.out";
  const middle = loader.querySelector(".middle");
  middle.style.setProperty("--mid-h", `${Math.max(...lines.map((l) => l.offsetHeight))}px`);

  const veil = document.querySelector(".ss-loader-veil");
  // The original replays this loader as a transition each time you enter the first page (even when arriving from another page)
  if (reduce) {
    loader.classList.add("is-done");
    veil.classList.add("is-done");
    return;
  }
  const content = loader.querySelector(".content");
  gsap.set(page, { y: "-5vh" });
  let i = 0;
  const show = () => {
    lines.forEach((l, k) => l.classList.toggle("is-on", k === i));
    i++;
    if (i < lines.length) setTimeout(show, P.between * 1000);
    else setTimeout(out, 300);
  };
  const out = () => {
    gsap.timeline({ onComplete: () => { loader.classList.add("is-done"); veil.classList.add("is-done"); } })
      .to(veil, { duration: P.duration / 1.3, ease, y: "100vh" })
      .to(content, { duration: P.duration / 1.9, ease: "power2.inOut", y: "100vh" }, "<")
      .to(content, { duration: 0.4, ease: "power2.inOut", opacity: 0 }, "<");
    gsap.to(page, { duration: P.duration, delay: P.duration * 0.04, ease, y: 0, clearProps: "transform" });
  };
  show();
})();
