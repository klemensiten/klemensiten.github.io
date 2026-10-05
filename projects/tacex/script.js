(() => {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Keep GIFs as stills until they are near the viewport. Respect reduced motion
  // and keep a user's explicit play/pause choice when the preference changes.
  const demos = Array.from(document.querySelectorAll('.animated-demo')).map((image) => {
    const button = document.querySelector(`[aria-controls="${image.id}"]`);
    const demo = { image, button, visible: false, playing: false, userChoice: null };
    const setPlaying = (playing) => {
      demo.playing = playing;
      image.src = playing ? image.dataset.animation : image.dataset.still;
      button.textContent = playing ? 'Pause animation' : 'Play animation';
    };
    demo.update = () => setPlaying(demo.visible && (demo.userChoice ?? !motionPreference.matches));
    button.hidden = false;
    button.addEventListener('click', () => {
      demo.userChoice = !demo.playing;
      demo.update();
    });
    return demo;
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const demo = demos.find((item) => item.image === entry.target);
        demo.visible = entry.isIntersecting;
        demo.update();
      });
    }, { rootMargin: '150px' });
    demos.forEach((demo) => observer.observe(demo.image));
  } else {
    demos.forEach((demo) => {
      demo.visible = true;
      demo.update();
    });
  }

  const teaser = document.querySelector('#teaser-video');
  if (!motionPreference.matches) teaser.play().catch(() => {});
  motionPreference.addEventListener('change', () => {
    demos.forEach((demo) => demo.update());
    if (motionPreference.matches) teaser.pause();
  });

  const copyButton = document.querySelector('#copy-citation');
  copyButton.hidden = false;
  copyButton.addEventListener('click', async () => {
    const citation = document.querySelector('#citation');
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(citation.textContent);
      status.textContent = 'BibTeX copied to clipboard.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(citation);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Citation selected. Press Ctrl+C (or Cmd+C) to copy.';
    }
  });
})();
