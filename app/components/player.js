import mode from '../stores/mode';


export default {
  init() {
    const scene = this.el.sceneEl;
    const camera = document.createElement('a-camera');
    const entity = document.createElement('a-entity');
    const cameraPos = {
      x: 500,
      z: 500,
    };
    const cameraRotation = {};


    if (mode.isSpectatorMode()) {
      camera.setAttribute('wasd-controls-enabled', false);
      camera.setAttribute('look-controls-enabled', false);

      cameraPos.y = 400;

      cameraRotation.x = -90;
    } else {
      camera.setAttribute('gamepad-controls', {
        acceleration: 200,
        flyEnabled: true,
      });
      camera.setAttribute('wasd-controls', {
        acceleration: 200,
        fly: true,
      });

      cameraPos.y = 1;

      cameraRotation.y = 180;
    }

    entity.setAttribute('position', { ...cameraPos });
    entity.setAttribute('rotation', { ...cameraRotation });

    entity.appendChild(camera);
    scene.appendChild(entity);
  },
};
