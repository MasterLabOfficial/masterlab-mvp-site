// ============================================================
// MASTERLAB UNIVERSAL BLOCK + AUDIO ENGINE
// ============================================================

(function () {
  function initBlocks() {
    const wrapper = document.querySelector(".lesson-blocks");
    if (!wrapper) return;

    const course = wrapper.dataset.course;
    const lesson = wrapper.dataset.lesson;

    const blocks = [...wrapper.querySelectorAll(".lesson-block")];
    let index = 0;

    const audio = document.querySelector(".lesson-audio");
    const title = document.querySelector(".lesson-block-title");
    const progress = document.querySelector(".lesson-block-progress");

    function audioSrc(i) {
      const b = blocks[i];
      if (!b) return null;

      if (b.dataset.audio) return b.dataset.audio;

      const n = b.dataset.block || i + 1;
      return `/masterlab-mvp-site/assets/audio/${course}/lesson${lesson}-block${n}.mp3`;
    }

    function show(i) {
      if (i < 0 || i >= blocks.length) return;

      blocks.forEach((b, idx) => {
        b.style.display = idx === i ? "block" : "none";
      });

      index = i;

      if (title) title.textContent = blocks[i].dataset.title || `Part ${i + 1}`;
      if (progress) progress.textContent = `Block ${i + 1} of ${blocks.length}`;

      if (audio) {
        audio.src = audioSrc(i);
        audio.load();
      }
    }

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-block-nav]");
      if (!btn) return;

      if (btn.dataset.blockNav === "next") show(index + 1);
      if (btn.dataset.blockNav === "prev") show(index - 1);
    });

    show(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlocks);
  } else {
    initBlocks();
  }
})();
