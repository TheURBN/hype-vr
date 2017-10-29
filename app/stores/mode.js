export const SPECTATOR = 'spectator';
export const VR = 'vr';


class Mode {
  mode = VR

  constructor() {
    const url = new URL(window.location);

    if (url.searchParams.get('spectator') !== null) {
      this.mode = SPECTATOR;
    }
  }

  isSpectatorMode() {
    return this.mode === SPECTATOR;
  }
}


const mode = new Mode();


export default mode;
