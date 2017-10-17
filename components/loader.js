import {
  pick,
  reduce,
  flow,
  groupBy,
  map,
} from 'lodash/fp';
import {
  isArray,
  get,
} from 'lodash';
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
        let mesh = get(this.meshes, result.owner);

        if (mesh) {
          scene.remove(mesh);

          const geometry = mesh.geometry.clone();

          geometry.merge(result.geometry, result.geometry.matrix);

          mesh.geometry.dispose();
          mesh.geometry = geometry;
        } else {
          const color = config.world.colors[result.owner];
          const material = new Three.MeshStandardMaterial({
            color,
          });

          mesh = new Three.Mesh(result.geometry, material);

          this.meshes[result.owner] = mesh;
        }

        scene.add(mesh);

        console.log(`Created ${result.count} voxels for user ${result.owner}`);
      },
    );

    const createObjects = flow(
      groupBy('owner'),
      map(createObject),
    );

    createObjects(voxels);
  },

  getVoxels(pos, range = 100) {
    this.ws.send(JSON.stringify({
      type: 'range',
      args: {
        ...pos,
        range,
      },
    }));
  },

  connect() {
    this.ws = new WebSocket(config.api.websocketUrl);

    this.ws.addEventListener('message', (event) => {
      let data = JSON.parse(event.data).data;

      if (!isArray(data)) {
        data = [data];
      }

      newVoxels(data);
    });
  },

  init() {
    this.meshes = {};

    this.connect();

    this.ws.addEventListener('open', () => {
      this.getVoxels(position({
        x: 500,
        y: 500,
      }));
    });

    this.ws.addEventListener('close', () => {
      this.connect();
    });

    intercept(world.voxels, (voxels) => {
      this.createVoxels(voxels.added);

      return voxels;
    });
  },
};
