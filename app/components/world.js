import config from '../../config.yml';


export default {
  init() {
    const side = config.world.size.side;
    const plane = document.createElement('a-plane');
    const scene = this.el.sceneEl;

    plane.setAttribute('width', side);
    plane.setAttribute('height', side);
    plane.setAttribute('position', {
      x: 0,
      y: -0.5,
      z: 0,
    });

    plane.setAttribute('material', {
      shader: 'world-plane',
    });

    plane.setAttribute('rotation', {
      x: -90,
      y: 0,
      z: 0,
    });

    scene.appendChild(plane);
  },
};