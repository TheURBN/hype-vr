import config from '../../config.yml';
import vertexShader from '../shaders/floor/vertex.glsl';
import fragmentShader from '../shaders/floor/fragment.glsl';

const Three = window.THREE;


export default {
  init() {
    const camera = document.querySelector('a-camera').object3D;

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new Three.Vector2() },
      position: camera.position,
      fogColor: { value: new Three.Color() },
      fogNear: { value: 20 },
      fogFar: { value: 40 },
      worldSize: { type: 'f', value: config.world.size.side },
    };

    this.material = new Three.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      fog: true,
    });

    uniforms.resolution.value.x = window.innerWidth;
    uniforms.resolution.value.y = window.innerHeight;
  },

  update() {},
};
