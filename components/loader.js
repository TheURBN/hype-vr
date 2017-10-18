import {
  pick,
  reduce,
  flow,
  groupBy,
  map,
} from 'lodash/fp';
import {
  isArray,
  isEmpty,
  last,
} from 'lodash';
import { intercept } from 'mobx';

import config from '../config.yml';
import world from '../stores/world';

const Three = window.THREE;

const position = pick(['x', 'y', 'z']);

const newVoxels = v => world.addVoxels(v);
const reduceF = (func, acc) => data => reduce(func, acc())(data);

const meshBatchSize = config.performance.meshBatchSize;

export default {
  schema: {
    url: {
      default: 'data.json',
    },
  },

  getMesh(owner, initial = false) {
    const createMesh = () => {
      const color = config.world.colors[owner];
      const material = new Three.MeshStandardMaterial({
        color,
      });

      return {
        m: new Three.Mesh(new Three.Geometry(), material),
        count: 1,
      };
    };
    const meshes = this.meshes[owner];

    if (meshes && initial) {
      return meshes[0].m;
    } else if (meshes && !initial) {
      const old = last(meshes);

      if (old.count >= meshBatchSize || meshes.length === 1) {
        console.log('Creating new mesh');
        const m = createMesh();

        meshes.push(m);

        return m.m;
      }

      old.count += 1;

      return old.m;
    }


    this.meshes[owner] = [
      createMesh(),
    ];

    return last(this.meshes[owner]).m;
  },

  createVoxels(voxels, initial) {
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
        const mesh = this.getMesh(result.owner, initial);

        scene.remove(mesh);

        mesh.geometry.merge(result.geometry, result.geometry.matrix);

        mesh.geometry.elementsNeedUpdate = true;
        mesh.geometry.verticesNeedUpdate = true;

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

  getVoxels(pos, range = 10) {
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
      }), config.performance.initialRange);
    });

    this.ws.addEventListener('close', () => {
      this.connect();
    });

    intercept(world.voxels, (voxels) => {
      this.createVoxels(voxels.added, isEmpty(this.meshes));

      return voxels;
    });
  },
};
