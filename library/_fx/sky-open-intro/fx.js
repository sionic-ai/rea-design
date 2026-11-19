// Opening curtain — while the sky settles, starlight spins in and the title line, tagline line and body lines rise in order. After hold seconds (right away if SKIP) it lifts over out seconds and
// Fires fx:open on the cover (consumers listen for this and start the main screen motion). Delay per line follows the order within its role
(() => {
  kfFx.register("sky-open-intro", (el, { options, reduce }) => {
    const hold = +(options.hold ?? 8), out = +(options.out ?? 0.8);
    const roles = [["head", +(options["head-at"] ?? 2), +(options["head-each"] ?? 0.1)], ["copy", +(options["copy-at"] ?? 3), +(options["copy-each"] ?? 0.5)], ["body", +(options["body-at"] ?? 4.5), +(options["body-each"] ?? 0.1)]];
    for (const [role, at, each] of roles) {
      el.querySelectorAll(`[data-fx-part="${role}"]`).forEach((n, i) => {
        n.style.animationDelay = `${at + i * each}s`;
        if (role === "head") n.parentElement?.classList.add("fx-soi-mask");
      });
    }
    el.style.setProperty("--fx-out", `${reduce ? 0 : out}s`);
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      clearTimeout(timer);
      el.classList.add("is-out");
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
    };
    const timer = setTimeout(open, reduce ? 0 : hold * 1000);
    const skip = el.querySelector('[data-fx-part="skip"]');
    // The original SKIP is a div, so it accepts Enter and Space to make it pressable by keyboard too
    const key = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } };
    skip?.addEventListener("click", open);
    skip?.addEventListener("keydown", key);
    return () => { clearTimeout(timer); skip?.removeEventListener("click", open); skip?.removeEventListener("keydown", key); el.classList.remove("is-out"); };
  });
})();
