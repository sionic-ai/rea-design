// One work item — the key visual appears at .4s once the image arrives (original work__keyvisual.is-loaded). As a placeholder it is attached on the frame after the first paint
(() => {
  const kv = document.querySelector(".nm-wd__kv");
  if (kv) requestAnimationFrame(() => requestAnimationFrame(() => kv.classList.add("is-loaded")));
})();
