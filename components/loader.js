import { map } from 'lodash/fp';


function position(x, y, z) {
  return { x, y, z };
}


export default {
  schema: {
    url: {
      default: 'data.json',
    },
  },

  async init() {
    let response;

    try {
      response = await fetch(this.data.url);
    } catch (e) {
      return;
    }

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const scene = document.querySelector('a-scene');

    const createVoxels = map((obj) => {
      const newVoxel = document.createElement('a-entity');

      newVoxel.setAttribute('mixin', 'voxel');
      newVoxel.setAttribute('position', position(...obj));

      scene.appendChild(newVoxel);
    });

    createVoxels(data.voxels);
  },
};
