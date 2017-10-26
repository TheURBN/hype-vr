import * as Three from 'three';


const cache = {};


export default {
  voxel: {
    geometry() {
      if (!cache.voxel) {
        cache.voxel = new Three.BoxGeometry(1, 1, 1);
      }

      return cache.voxel.clone();
    },

    material() {
      return new Three.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: Three.FaceColors,
        fog: false,
      });
    },
  },

  flag: {
    geometry() {
      if (!cache.flag) {
        cache.flag = new Three.SphereGeometry(0.5, 32, 32);
      }

      return cache.flag.clone();
    },

    material() {
      return new Three.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: Three.FaceColors,
        fog: false,
      });
    },
  },
};
