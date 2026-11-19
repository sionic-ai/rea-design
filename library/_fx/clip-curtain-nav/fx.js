// Clicking a same-site link fills the curtain from bottom to top (clip-path, .7s power2.inOut), the inner curtain (inner) follows .1s later, and the logo (mark) .2s later rising from 30px below, then it navigates.
// The incoming page opens covered by the curtain, .5s later the logo slips up 30px, the inner curtain lifts first and the outer curtain lifts .1s later. fx:curtain-open fires .8s after the lift starts.
// Since the site swaps documents (MPA), open-while-covered is carried over with a sessionStorage mark
(() => {
  const KEY = "fx-clip-curtain";
  kfFx.register("clip-curtain-nav", (el, { options, reduce }) => {
    const inner = el.querySelector('[data-fx-part="inner"]');
    const mark = el.querySelector('[data-fx-part="mark"]');
    const dur = +(options.dur ?? 0.7), each = +(options.each ?? 0.1), wait = +(options.delay ?? 0.5), lift = +(options.lift ?? 30);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const SHUT = "inset(100% 0% 0% 0%)", FULL = "inset(0% 0% 0% 0%)", GONE = "inset(0% 0% 100% 0%)";
    const parts = [el, inner].filter(Boolean);
    const fire = () => el.dispatchEvent(new CustomEvent("fx:curtain-open", { bubbles: true }));
    let tl = null, leaving = false;
    const arrived = sessionStorage.getItem(KEY) === "1";
    sessionStorage.removeItem(KEY);
    if (arrived && !reduce) {
      gsap.set(parts, { clipPath: FULL });
      if (mark) gsap.set(mark, { y: 0 });
      tl = gsap.timeline({ onComplete: () => gsap.set(parts, { clipPath: SHUT }) });
      if (mark) tl.fromTo(mark, { y: 0 }, { y: -lift, duration: dur, ease }, wait);
      if (inner) tl.fromTo(inner, { clipPath: FULL }, { clipPath: GONE, duration: dur, ease }, wait);
      tl.fromTo(el, { clipPath: FULL }, { clipPath: GONE, duration: dur, ease }, wait + (inner ? each : 0));
      tl.call(fire, null, wait + 0.3);
    } else {
      gsap.set(parts, { clipPath: SHUT });
      queueMicrotask(fire);
    }
    const same = (a) => {
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
      const u = new URL(a.href, location.href);
      return u.origin === location.origin && !(u.pathname === location.pathname && u.hash);
    };
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest("a[href]");
      if (!same(a) || leaving) return;
      e.preventDefault();
      const go = () => { sessionStorage.setItem(KEY, "1"); location.href = a.href; };
      if (reduce) { go(); return; }
      leaving = true;
      tl?.kill();
      tl = gsap.timeline({ onComplete: go });
      tl.fromTo(el, { clipPath: SHUT }, { clipPath: FULL, duration: dur, ease }, 0);
      if (inner) tl.fromTo(inner, { clipPath: SHUT }, { clipPath: FULL, duration: dur, ease }, each);
      if (mark) tl.fromTo(mark, { y: lift }, { y: 0, duration: dur, ease }, 0.2);
    };
    // So a page revived by Back (bfcache) doesn’t stay stuck covered
    const onShow = (e) => { if (e.persisted) { leaving = false; tl?.kill(); gsap.set(parts, { clipPath: SHUT }); } };
    document.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      tl?.kill();
      gsap.set([...parts, mark].filter(Boolean), { clearProps: "clipPath,transform" });
    };
  });
})();
