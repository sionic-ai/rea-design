/* Home page entrance order — appended to the timeline in shared.js (original values) */
(() => {
  window.guIntro = (tl) => {
    const q = (s) => document.querySelector(s);
    const soft = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink-soft").trim();
    tl.from(".gu-kv__line.is-1", { x: 20, opacity: 0, duration: 0.4 }, "<");
    tl.from(".gu-kv__line.is-2", { x: -20, opacity: 0, duration: 0.4 }, "<");
    tl.from(".gu-kv__c > span", { y: 60, duration: 0.4, ease: "power4.out", stagger: 0.1 });
    tl.from(".gu-kv__photo-main", { opacity: 0, duration: 0.5, ease: "power2.out" }, "+=.3");
    tl.from(".gu-kv__photo-sub", { opacity: 0, duration: 0.5, ease: "power2.out" }, "<");
    tl.from(".gu-kv__txt", { opacity: 0, duration: 0.4, ease: "power2.out" }, "<");
    tl.from(".gu-kv__ill", { opacity: 0, duration: 0.4, ease: "power2.out" }, "<");
    tl.from("#contents", { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" }, "-=.4");
    if (q("[data-kv-point]") && soft) tl.from("[data-kv-point]", { color: soft, duration: 1, ease: "power2.out" }, "-=.4");
  };
})();
