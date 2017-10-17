import {
  pick,
  reduce,
  flow,
  groupBy,
  map,
} from 'lodash/fp';
import { isArray } from 'lodash';
import { intercept } from 'mobx';

import config from '../config.yml';
import world from '../stores/world';

const Three = window.THREE;

const position = pick(['x', 'y', 'z']);


// const newVoxel = map((voxel) => {
//   world.addVoxel(voxel);
// });

const newVoxels = v => world.addVoxels(v);
const reduceF = (func, acc) => data => reduce(func, acc())(data);


export default {
  schema: {
    url: {
      default: 'data.json',
    },
  },

  createVoxels(voxels) {
    const scene = this.el.sceneEl.object3D;

    const createObject = flow(
      reduceF((acc, obj) => {
        const geometry = new Three.BoxGeometry(1, 1, 1);

        geometry.translate(obj.x, obj.y, obj.z);

        acc.geometry.merge(geometry, geometry.matrix);
        acc.count += 1;
        acc.owner = acc.owner || obj.owner;

        return acc;
      }, () => ({
        geometry: new Three.Geometry(),
        count: 0,
      })),
      (result) => {
        const color = config.world.colors[result.owner];

        const material = new Three.MeshStandardMaterial({
          color,
        });
        const box = new Three.Mesh(result.geometry, material);

        scene.add(box);

        console.log(`Created ${result.count} voxels for user ${result.owner}`);
      },
    );

    const createObjects = flow(
      groupBy('owner'),
      map(createObject),
    );

    createObjects(voxels);
  },

  getVoxels(pos, range = 1000) {
    this.ws.send(JSON.stringify({
      method: 'get',
      args: {
        ...pos,
        range,
      },
    }));
  },

  init() {
    this.ws = new WebSocket(config.api.websocketUrl);

    this.ws.addEventListener('message', (event) => {
      let data = JSON.parse(event.data);

      if (!isArray(data)) {
        data = [data];
      }

      newVoxels(data);
    });

    this.ws.addEventListener('open', () => {
      this.getVoxels(position({
        x: 500,
        y: 500,
      }));
    });

    intercept(world.voxels, (voxels) => {
      this.createVoxels(voxels.added);

      return voxels;
    });
  },
};
