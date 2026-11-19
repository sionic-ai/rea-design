// Home intro (original HomeExperience): if it is the first this visit, the menu grows 1.5x and turns into category names (.818s power2.out) and the first card appears.
// Every (.56 + .96e)/1.1s the menu cycles photo→video→about→booking over .873s, and .309s later one more card pops up each time. At 4s it returns home (.927s power4.inOut) to its original size,
// Category names drop out at .218s and menu names return at .473s at .036s intervals, and after the cards are cleared the DOM is revealed at .891s. On return, the DOM is revealed immediately.
(() => {
  const KEY = "mc-home-intro";
  const dial = document.querySelector(".mc-dial");
  const dome = document.querySelector(".mc-dome");
  const fan = document.querySelector(".mc-fan");
  if (!dome) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const send = (el, detail) => el?.dispatchEvent(new CustomEvent(el === dial ? "fx:dial" : el === fan ? "fx:fan" : "fx:reveal", { detail }));
  const fades = () => document.querySelectorAll(".mc-fade");
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
  const tl = gsap.timeline();
  const showChrome = (at) => tl.call(() => gsap.to(fades(), { opacity: 1, duration: reduce ? 0 : 0.65, delay: reduce ? 0 : 0.75 }), [], at);
  const done = () => { try { sessionStorage.setItem(KEY, "1"); } catch (e) {} };
  const run = () => {
    if (seen || reduce || !fan) {
      if (dial) { dial.dataset.introState = "pages"; send(dial, { to: "home" }); }
      tl.call(() => send(dome, { t: (reduce ? 0.4 : 0.98) / 1.1 }), [], 0);
      showChrome(0);
      tl.call(done, [], 0);
      return;
    }
    const t = 0.98 / 1.1;
    dial.dataset.introState = "categories";
    send(dial, { reset: "home" });
    tl.call(() => { send(dial, { zoom: 1.5, dur: 0.8181818, ease: "power2.out" }); send(fan, { reveal: 0 }); }, [], 0);
    ["photo", "video", "about", "book"].forEach((link, e) => {
      const at = (0.56 + 0.96 * e) / 1.1;
      tl.call(() => send(dial, { to: link, dur: 0.8727273 }), [], at);
      tl.call(() => send(fan, { reveal: e + 1 }), [], at + 0.3090909);
    });
    const p = (0.56 + 0.96 * 4) / 1.1;
    const cats = [...dial.querySelectorAll(".mc-dial__item:not([data-dial-copy]) .mc-dial__cat")];
    const names = [...dial.querySelectorAll(".mc-dial__item:not([data-dial-copy]) > a")];
    const fadeOut = 0.24 / 1.1 + (0.018 / 1.1) * (cats.length - 1);
    tl.call(() => {
      send(dial, { to: "home", dur: 0.9272727, ease: "power4.inOut" });
      send(dial, { zoom: 1, dur: 0.9272727, ease: "power4.inOut" });
      dial.dataset.introState = "transition";
      gsap.to(cats, { opacity: 0, duration: 0.24 / 1.1, stagger: 0.018 / 1.1, ease: "power2.out", onComplete: () => { if (dial.dataset.introState === "transition") dial.dataset.introState = "break"; } });
    }, [], p);
    const e = Math.max(2.4, p + fadeOut);
    tl.call(() => {
      gsap.set(names, { opacity: 0 });
      dial.dataset.introState = "pages";
      gsap.to(names, { opacity: 1, duration: 0.52 / 1.1, stagger: 0.04 / 1.1, ease: "power2.out", onComplete: () => gsap.set([...names, ...cats], { clearProps: "opacity" }) });
      send(fan, { exit: true });
    }, [], e);
    tl.call(() => send(dome, { t }), [], e + 0.8909091);
    showChrome(e + 0.8909091);
    tl.call(done, [], e + 0.8909091 + 11 * Math.min(0.045, t / 18) + 0.78 * t);
  };
  // Runs after the parts are attached (fx-core attaches after DOMContentLoaded)
  requestAnimationFrame(run);
  document.addEventListener("fx:page-leave", () => tl.kill(), { once: true });
})();
