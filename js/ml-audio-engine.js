const MLAudioEngine = (function () {
  let state = {
    courseId: null,
    lessonTitle: "",
    blocks: [],
    currentIndex: 0,
    audioOn: true
  };

  function init(config) {
    state.courseId = config.courseId || "course";
    cacheDOM();
    collectBlocks();
    detectLessonTitle();
    bindEvents();
    setInitialState();
  }

  function cacheDOM() {
    state.panel = document.getElementById("ml-audio-panel");
    state.headerLabel = document.getElementById("ml-audio-section-label");
    state.toggleBtn = document.getElementById("ml-audio-toggle");
    state.player = document.getElementById("ml-audio-player");
  }

  function collectBlocks() {
    const nodeList = document.querySelectorAll(".lesson-block[data-block][data-title]");
    state.blocks = Array.from(nodeList).sort((a, b) => {
      const aNum = parseInt(a.getAttribute("data-block"), 10) || 0;
      const bNum = parseInt(b.getAttribute("data-block"), 10) || 0;
      return aNum - bNum;
    });
  }

  function detectLessonTitle() {
    const h1 = document.querySelector("h1");
    state.lessonTitle = h1 ? h1.textContent.trim() : "Lesson";
  }

  function bindEvents() {
    if (state.toggleBtn) {
      state.toggleBtn.addEventListener("click", toggleAudio);
    }

    // Listen for block navigation events
    document.addEventListener("MLBlockChange", function (e) {
      const index = e.detail && typeof e.detail.index === "number"
        ? e.detail.index
        : 0;
      goToBlock(index);
    });
  }

  function setInitialState() {
    state.audioOn = true;
    updateToggleLabel();

    if (!state.blocks.length) return;

    state.currentIndex = 0;
    updateHeader();
    loadAudioForCurrentBlock(true);
  }

  function toggleAudio() {
    state.audioOn = !state.audioOn;
    updateToggleLabel();

    if (!state.audioOn) {
      state.player.pause();
    } else {
      loadAudioForCurrentBlock(true);
    }
  }

  function updateToggleLabel() {
    state.toggleBtn.textContent = state.audioOn ? "[Audio is ON]" : "[Audio is OFF]";
  }

  function goToBlock(index) {
    if (index < 0 || index >= state.blocks.length) return;
    state.currentIndex = index;
    updateHeader();
    loadAudioForCurrentBlock(true);
  }

  function updateHeader() {
    const block = state.blocks[state.currentIndex];
    const sectionName = block.getAttribute("data-title") || "Section";
    const x = state.currentIndex + 1;
    const y = state.blocks.length;

    state.headerLabel.textContent =
      `${state.lessonTitle} – ${sectionName}, Section ${x}/${y}`;
  }

  function loadAudioForCurrentBlock(autoplay) {
    if (!state.audioOn) return;

    const block = state.blocks[state.currentIndex];
    const blockNum = block.getAttribute("data-block");
    const audioSrc = buildAudioSrc(blockNum);

    state.player.src = audioSrc;
    if (autoplay) {
      state.player.play().catch(() => {});
    }
  }

  function buildAudioSrc(blockNum) {
    const lessonMatch = window.location.pathname.match(/lesson(\d+)/i);
    const lessonNum = lessonMatch ? lessonMatch[1] : "0";
    return `/masterlab-mvp-site/audio/${state.courseId}/lesson${lessonNum}-block${blockNum}.mp3`;
  }

  return { init };
})();
