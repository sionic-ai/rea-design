// Only for first-time visitors — over the photo covering the screen, a vertical seal (seasonal lettering logo) rests 2s then rises over 2s, and .1s later the whole cover lifts away over 2s.
// At the moment it starts lifting, fires fx:open so the Hero rises together beneath it. If already seen this session, fires fx:open right away without the cover
(() => {
  kfFx.register("seal-fade-opening", (el, { options, reduce }) => {
    const seal = el.querySelector('[data-fx-part="seal"]');
    const key = options.key || "fx-seal-fade-opening";
    let seen = false;
    try { seen = sessionStorage.getItem(key) === "1"; sessionStorage.setItem(key, "1"); } catch (e) { seen = false; }
    const open = () => el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
    if (seen || reduce || !seal) {
      el.style.display = "none";
      const id = requestAnimationFrame(open);
      return () => cancelAnimationFrame(id);
    }
    const wait = +(options.wait ?? 2), show = +(options.show ?? 2), fade = +(options.fade ?? 2), gap = +(options.gap ?? 0.1);
    gsap.set(el, { display: "block", opacity: 1 });
    // The moment the cover turns on, fx:start — the body that the consumer hid is turned on then (the original sets body opacity 1 together with the cover)
    el.dispatchEvent(new CustomEvent("fx:start", { bubbles: true }));
    gsap.set(seal, { opacity: 0 });
    const tl = gsap.timeline()
      .to(seal, { opacity: 1, duration: show, delay: wait, ease: "power1.out" })
      .call(() => { scrollTo(0, 0); window.dispatchEvent(new CustomEvent("fx:top")); }, null, `-=0.3`)
      .to(el, { opacity: 0, duration: fade, delay: gap, ease: "power1.out" })
      .call(() => { el.style.pointerEvents = "none"; open(); }, null, `-=${fade}`)
      .set(el, { display: "none" });
    return () => { tl.kill(); gsap.set([el, seal], { clearProps: "display,opacity" }); el.style.pointerEvents = ""; };
  });
})();
