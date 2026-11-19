// First page entrance — triggers and durations exactly as in the original main.js.
// Sentence .4s power2.out (top 95%) · About card right→-1 .3s · handwriting .8s power3.out (top 70%) · title .5s · card .4s (top 95%) · list .5s.
(() => {
  SK.mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray(".s-mainText").forEach((el) => {
      gsap.to(el, { y: 0, duration: 0.4, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 95%", end: "top 90%" } });
    });

    const card = document.querySelector(".s-indexProfile");
    gsap.to(card, { right: -1, duration: 0.3, scrollTrigger: { trigger: card, start: "top 95%", end: "top 50%" } });
    const hand = document.querySelector(".s-indexProfile-tabisuru");
    gsap.to(hand, { translate: "0px 0px", opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: hand, start: "top 70%", end: "top 40%" } });

    const head = document.querySelector(".s-indexDekiru");
    gsap.to(head, { y: 0, scale: 1, duration: 0.5, scrollTrigger: { trigger: head, start: "top 95%", end: "top 80%" } });
    gsap.utils.toArray(".s-indexDekiru-sec").forEach((el) => {
      gsap.to(el, { y: 0, duration: 0.4, scrollTrigger: { trigger: el, start: "top 95%", end: "top 65%" } });
    });

    const yk = document.querySelector(".s-yokuyou");
    gsap.to(yk, { y: 0, duration: 0.5, scrollTrigger: { trigger: yk, start: "top 95%", end: "top 80%" } });
  });

  // When the term popup opens, darken the header and lock the background scroll (original frontEmbedWord)
  const head = document.querySelector('[data-slot="header"]');
  document.querySelectorAll(".word__chk").forEach((chk) =>
    chk.addEventListener("change", () => {
      const open = [...document.querySelectorAll(".word__chk")].some((c) => c.checked);
      // If a transform is left on the card, a position:fixed popup gets trapped inside the card
      gsap.killTweensOf(chk.closest(".wk__item"));
      chk.closest(".wk__item").style.transform = "none";
      document.body.classList.toggle("is-popped", open);
      head.classList.toggle("is-popped", open);
    })
  );
})();
