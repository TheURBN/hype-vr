import { reaction } from 'mobx';

import world from '../stores/world';


export default {
  init() {
    const aaaSky = document.getElementById('aaaaaSky');
    const aaaVideo = document.getElementById('aaaaa');

    reaction(
      () => world.videoPlaying,
      (shouldBePlaying) => {
        if (shouldBePlaying) {
          aaaVideo.play();
        } else {
          aaaVideo.pause();
        }

        aaaSky.setAttribute('visible', shouldBePlaying);
      },
    );
  },
};
