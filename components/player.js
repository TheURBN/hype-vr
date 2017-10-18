import config from '../config.yml';


export default {
  init() {
    const size = config.world.size;
    const scene = this.el.sceneEl;
    const camera = document.createElement('a-camera');
    const entity = document.createElement('a-entity');

    camera.setAttribute('gamepad-controls', {
      flyEnabled: true,
    });

    camera.setAttribute('wasd-controls', {
      fly: false,
      acceleration: 65,
    });

    const cameraPos = {
      x: Math.floor(size.width / 2),
      z: Math.floor(size.depth / 2),
      y: 1,
    };

    cameraPos.x = 500;
    cameraPos.z = 500;

    entity.setAttribute('position', {
      ...cameraPos,
    });

    entity.appendChild(camera);
    scene.appendChild(entity);
  },
};
