// Color-change targets read the skin variables in place — when the skin changes, the curtain and logo end colors follow
(() => {
  kfFx.register("logo-cycle-loader", (el, { options, reduce }) => {
    const panel = el.querySelector('[data-fx-part="panel"]');
    const box = el.querySelector('[data-fx-part="marks"]');
    const marks = [...el.querySelectorAll('[data-fx-part="mark"]')];
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    if (!panel) return;
    if (reduce) { gsap.set(el, { autoAlpha: 0, display: "none" }); done(); return; }
    const root = getComputedStyle(document.documentElement);
    const bg = root.getPropertyValue("--kf-bg").trim(), ink = root.getPropertyValue("--kf-ink").trim();
    const fade = +(options.fade ?? 0.8), loop = +(options.loop ?? 1.4), tint = +(options.tint ?? 0.6);
    const hold = +(options.hold ?? 0.5), lift = +(options.lift ?? 1);
    const key = options.key || "kfLogoCycleLoader";
    let again = false;
    try { again = key !== "none" && !!sessionStorage.getItem(key); } catch (e) { again = false; }
    let collapse = +(options.collapse ?? 1.2);
    const tl = gsap.timeline();
    marks[0]?.classList.add("fx-on");
    if (again) {
      collapse *= 0.7;
      gsap.set(panel, { backgroundColor: bg });
      if (box) gsap.set(box, { opacity: 1 });
      if (marks.length) gsap.set(marks, { color: ink });
      tl.addLabel("collapseStart", hold);
      if (marks.length) tl.to(marks, { opacity: 0, yPercent: -20, duration: 0.5, ease: "power2.in" }, "collapseStart");
      tl.to(panel, { opacity: 0, duration: collapse, ease: "power2.out" }, "collapseStart");
    } else {
      if (box) tl.to(box, { opacity: 1, duration: fade, ease: "power1.out" });
      tl.addLabel("logoStart");
      const step = marks.length ? loop / marks.length : 0;
      marks.forEach((m, i) => {
        if (!i) return;
        tl.call(() => { marks[i - 1].classList.remove("fx-on"); m.classList.add("fx-on"); }, null, `logoStart+=${i * step}`);
      });
      tl.addLabel("loopEnd", `logoStart+=${loop}`);
      tl.to(panel, { backgroundColor: bg, duration: tint, ease: "power2.in" }, "loopEnd");
      if (marks.length) tl.to(marks, { color: ink, duration: tint, ease: "power2.in" }, "loopEnd");
      tl.addLabel("collapseStart", `loopEnd+=${hold}`);
      if (marks.length) tl.to(marks, { opacity: 0, yPercent: -20, duration: lift, ease: "power2.in" }, "collapseStart");
      tl.to(panel, { height: "0%", duration: collapse, ease: "power2.out" }, "collapseStart+=0.1");
    }
    try { if (key !== "none") sessionStorage.setItem(key, "true"); } catch (e) { /* The loader still runs even with blocked storage */ }
    tl.addLabel("loadingDone", `collapseStart+=${collapse}`);
    tl.set(el, { autoAlpha: 0, display: "none" }, "loadingDone");
    tl.call(done, null, "loadingDone");
    return () => {
      tl.kill();
      if (el.isConnected) gsap.set([el, panel, box, ...marks].filter(Boolean), { clearProps: "all" });
      marks.forEach((m) => m.classList.remove("fx-on"));
    };
  });
})();
