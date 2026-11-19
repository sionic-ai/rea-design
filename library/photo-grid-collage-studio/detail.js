/* Work detail — when the last-line placeholder touches the top of the screen, the pinned work name changes to ”Index”, and back to the name when scrolling back up (original project module). 
   The footer list line settle (when the bottom of .project-layout reaches 30% of the screen, .4s at .05s intervals) is handled by fade-band-lines. */
(() => {
  const head = document.querySelector(".project-header-sticky");
  const last = document.querySelector(".last-line-placeholder");
  if (!head || !last) return;
  ScrollTrigger.create({
    trigger: last, start: "top 0",
    onEnter: () => head.setAttribute("data-show", "index"),
    onLeaveBack: () => head.setAttribute("data-show", "title"),
  });
})();
