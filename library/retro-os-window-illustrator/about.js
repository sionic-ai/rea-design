// Profile: four lens windows — a big image on a dark panel is lit only where the windows are, and the head can be dragged. Entrance is .8x→1 · .12s · stagger .15s.
(() => {
  const IC = window.IC;
  IC.page("about", ({ initial, scope }) => {
    const off = [];
    const kv = scope.querySelector(".ic-pkv");
    const fit = () => kv.style.setProperty("--profile-kv-height", `${kv.offsetHeight}px`);
    fit(); addEventListener("resize", fit); off.push(() => removeEventListener("resize", fit));
    const dialogs = [...scope.querySelectorAll(".ic-pkv__dialog")];
    dialogs.forEach((d) => {
      const lens = d.querySelector("[data-lens]");
      lens.querySelector(".ic-pkv__lens-img").insertAdjacentHTML("afterbegin", IC.FIGURE || "");
      const upd = IC.lens(d, lens);
      off.push(IC.drag(d, { handle: d.querySelector(".ic-win__head"), group: "profile", onUpdate: upd }));
    });
    const tl = gsap.timeline({ paused: true });
    tl.from(dialogs.map((d) => d.querySelector(".ic-pkv__dialog-inner")), { opacity: 0, scale: 0.8, duration: 0.12, stagger: 0.15, ease: "power4.out" });
    if (IC.reduced) tl.progress(1);
    else if (initial) IC.onOpenEnd(() => tl.play(0));
    else setTimeout(() => tl.play(0), 100);
    off.push(() => tl.kill());
    return () => off.forEach((f) => f());
  });
  IC.page("contact", () => {});
})();
