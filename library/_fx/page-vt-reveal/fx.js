// The transition is done by css (View Transition), and here only two things — in a document with data-fx removed, skip the transition, and
// Where View Transition does not run (a page opened as a file, etc.), the body of a page reached via a same-site link is opened from below.
(() => {
  const KEY = "fx-page-vt-reveal";
  const on = () => document.documentElement.matches('[data-fx~="page-vt-reveal"]');
  addEventListener("pageswap", (e) => { if (e.viewTransition && !on()) e.viewTransition.skipTransition(); });
  addEventListener("pagereveal", (e) => { if (e.viewTransition && !on()) e.viewTransition.skipTransition(); });

  kfFx.register("page-vt-reveal", (root, { options, reduce }) => {
    if (root !== document.documentElement) return;
    if (options.dur != null) root.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.shrink != null) root.style.setProperty("--fx-shrink", String(+options.shrink));
    if (options.fade != null) root.style.setProperty("--fx-fade", String(+options.fade));
    if (options.ease) root.style.setProperty("--fx-ease", options.ease.includes(",") ? `cubic-bezier(${options.ease})` : options.ease);
    const len = (v) => (/^-?[\d.]+$/.test(v) ? `${v}px` : v);
    if (options.shift) root.style.setProperty("--fx-shift", len(options.shift));
    if (options.rise) root.style.setProperty("--fx-rise", len(options.rise));
    if (options.clip) root.style.setProperty("--fx-clip", len(options.clip));
    if (options.origin) root.style.setProperty("--fx-origin", options.origin === "top" ? "50% 0" : options.origin);
    const native = "onpagereveal" in window && location.protocol !== "file:";
    let came = false;
    try { came = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch (e) {}
    if (!native && came && !reduce) {
      root.classList.add("is-fx-vt-fallback");
      document.body?.addEventListener("animationend", () => root.classList.remove("is-fx-vt-fallback"), { once: true });
    }
    const ac = new AbortController();
    document.addEventListener("click", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || e.defaultPrevented || a.target === "_blank" || a.origin !== location.origin || a.getAttribute("href").startsWith("#")) return;
      try { sessionStorage.setItem(KEY, "1"); } catch (err) {}
    }, { signal: ac.signal });
    return () => {
      ac.abort();
      root.classList.remove("is-fx-vt-fallback");
      ["--fx-dur", "--fx-shrink", "--fx-fade", "--fx-ease", "--fx-shift", "--fx-rise", "--fx-clip", "--fx-origin"].forEach((v) => root.style.removeProperty(v));
    };
  });
})();
