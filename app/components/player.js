import config from '../../config.yml';


export default {
  init() {
    const side = config.world.size.side;
    const scene = this.el.sceneEl;
    const camera = document.createElement('a-camera');
    const entity = document.createElement('a-entity');

    camera.setAttribute('gamepad-controls', {});

    camera.setAttribute('wasd-controls', {});

    const cameraPos = {
      x: Math.floor(side / 2),
      z: Math.floor(side / 2),
      y: 1,
    };

    cameraPos.x = 500;
    cameraPos.z = 500;
    cameraPos.y = 1;

    entity.setAttribute('position', {
      ...cameraPos,
    });

    entity.setAttribute('rotation', {
      y: 180,
    });

    entity.appendChild(camera);
    scene.appendChild(entity);
  },
};
