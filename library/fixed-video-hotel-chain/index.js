// First page — .5s after load the hero slogan turns on (original top.js: await sleep(.5) → .mv is-start). Each letter gets a staggered delay
(() => {
  const mv = document.querySelector(".mm-mv");
  let i = 0;
  mv.querySelectorAll(".mm-mv__lead-line").forEach((line) => {
    line.querySelectorAll("i").forEach((ch) => {
      i += 1;
      ch.style.setProperty("--i", i);
    });
  });
  const start = () => setTimeout(() => mv.classList.add("is-start"), 500);
  if (document.readyState === "complete") start();
  else addEventListener("load", start, { once: true });
})();
