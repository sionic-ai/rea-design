// Free consultation: the bottom tabs (Now/With us) switch automatically every 7.8s of the progress bar (pressing restarts from that tab). When switching, the current notice
// Collapses with opacity .283s · height .283s (.083s later), while typing a dot appears in .15s, then new notifications enter one by one with height .117s · opacity .283s · y10→0 .417s (measured from the original)
// When the question dialogue becomes visible, it appears in turn — dialogue tempo is a value guessed from the screen recording
(() => {
  const { reduced, square } = window.SQ;
  const clock = document.querySelector("[data-clock]");
  const d = new Date();
  clock.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  const phone = document.querySelector(".sq-phone"), count = document.querySelector("[data-count]");
  const tabs = [...document.querySelectorAll(".sq-ck__toggle button")];
  const typing = phone.querySelector(".sq-phone__typing");
  const items = (mode) => [...phone.querySelectorAll(`li[data-mode="${mode}"]`)];
  let mode = "now", timer = 0, tl = null;
  gsap.set(items("calm"), { display: "none" });
  const show = (next) => {
    clearTimeout(timer);
    // Even tapping the same tab drops the progress bar once, then fills it again from the start
    tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
    void phone.offsetWidth;
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.mode === next ? "true" : "false"));
    count.textContent = next === "calm" ? "Your “1 contact · 1 app” here" : "Your ”11 contacts · 7 apps” goes here";
    const old = items(mode).filter((li) => li.style.display !== "none"), neu = items(next);
    mode = next;
    tl?.kill();
    if (reduced) { gsap.set(old, { display: "none" }); gsap.set(neu, { display: "grid", opacity: 1, height: "auto", y: 0 }); return; }
    tl = gsap.timeline();
    if (old.length && old[0].dataset.mode !== next) tl.to(old, { opacity: 0, duration: 0.283 }, 0).to(old, { height: 0, paddingBlock: 0, duration: 0.283 }, 0.083).set(old, { display: "none", clearProps: "height,paddingBlock,opacity" });
    neu.forEach((li, i) => {
      tl.set(typing, { display: "grid" }).fromTo(typing, { opacity: 0 }, { opacity: 1, duration: 0.15 }).to(typing, { opacity: 0, duration: 0.15 }, "+=0.5").set(typing, { display: "none" });
      tl.set(li, { display: "grid" }).from(li, { height: 0, paddingBlock: 0, duration: 0.117 }).fromTo(li, { opacity: 0, y: 10 }, { opacity: 1, duration: 0.283 }, "<").to(li, { y: 0, duration: 0.417, ease: "power2.out" }, "<");
    });
    timer = setTimeout(() => show(mode === "now" ? "calm" : "now"), 7800);
  };
  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.mode)));
  gsap.set(typing, { display: "none" });
  const start = () => { timer = setTimeout(() => show("calm"), 7800); };
  if (window.SQ.introDone) start(); else addEventListener("sq:intro-done", start, { once: true });

  document.querySelectorAll(".sq-plan__sq").forEach((s) => {
    s.innerHTML = square("idle") + square("wave") + square("idle");
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { s.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.35 }).observe(s.closest(".sq-plan"));
  });

  const chat = document.querySelector(".sq-chat");
  const bits = [...chat.children];
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    chat.classList.add("is-live");
    if (reduced) { bits.forEach((b) => b.classList.add("is-in")); return; }
    let t = 0;
    for (let i = 0; i < bits.length; i += 2) {
      const q = bits[i], a = bits[i + 1];
      setTimeout(() => q.classList.add("is-in"), t);
      if (a) {
        setTimeout(() => { a.classList.add("is-in", "is-typing"); }, t + 500);
        setTimeout(() => a.classList.remove("is-typing"), t + 1300);
      }
      t += 1400;
    }
  }, { threshold: 0.3 }).observe(chat);
})();
