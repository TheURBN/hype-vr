export default {
  init() {
    const aaaSky = document.getElementById('aaaaaSky');
    const aaaVideo = document.getElementById('aaaaa');

    window.addEventListener('keydown', (event) => {
      if (event.key === 'F7') {
        const previousState = aaaSky.getAttribute('visible');

        if (previousState) {
          aaaVideo.pause();
        } else {
          aaaVideo.play();
        }

        aaaSky.setAttribute('visible', !previousState);
      }
    });
  },
};
