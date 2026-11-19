// Careers motion: characters on clouds fly up to the upper right, interview cards open as modals, and More reveals three more cards.
// Hero and message are each a single silent looping video as in the original (14.6s 16:9 · 20.8s 1:1).
FN.onPage("recruit", () => {
  FN.scene(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray(".nums__fly").forEach((f, i) => {
        gsap.fromTo(f, { x: 160 + i * 40, y: 200 + i * 30 }, { x: -140 - i * 30, y: -160 - i * 20, ease: "none", scrollTrigger: { trigger: ".nums__cloud", start: "top bottom", end: "bottom top", scrub: 1.2 } });
      });
    });
  });

  document.querySelectorAll(".voice[data-modal]").forEach((card) => card.addEventListener("click", (e) => {
    e.preventDefault();
    const q = (s) => card.querySelector(s)?.innerHTML || "";
    FN.modal.open(`<article class="fn-voice">
      <div class="fn-voice__text"><span class="voice__tag">${q(".voice__tag")}</span><p class="voice__name">${q(".voice__name")}</p><p class="t-small">${q(".t-small")}</p>
        <p class="fn-voice__q">${q(".voice__q")}</p>
        <p class="fn-voice__ask">Q. Your question here, one line</p>
        <p class="t-body">About six lines for the reply here. Why they joined, what they do now, and when they felt glad at work, in that order.</p>
        <p class="fn-voice__ask">Q. Your question here, one line</p>
        <p class="t-body">Write your reply in about four lines here.</p></div>
      <div class="wf-img" data-label="${card.querySelector(".voice__ph")?.dataset.label || ""}"></div>
    </article>`);
  }));
  const more = document.querySelector(".voices__more");
  more?.addEventListener("click", () => {
    const sec = more.closest(".voices");
    const open = sec.classList.toggle("is-more");
    more.setAttribute("aria-expanded", String(open));
    ScrollTrigger.refresh();
  });
});
