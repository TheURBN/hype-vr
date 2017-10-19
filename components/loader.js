import {
  pick,
  chunk,
  map,
  flow,
} from 'lodash/fp';
import {
  isArray,
  isEmpty,
  last,
} from 'lodash';
import { intercept } from 'mobx';
import * as Three from 'three';

import config from '../config.yml';
import world from '../stores/world';
import LoaderWorker from '../workers/loader.worker';

const position = pick(['x', 'y', 'z']);

const newVoxels = flow(
  chunk(10000),
  map(vox => world.addVoxels(vox)),
);
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
    const ownerMeshes = this.meshes[owner];

    if (ownerMeshes && initial) {
      return ownerMeshes[0].m;
    } else if (ownerMeshes && !initial) {
      const old = last(ownerMeshes);

      if (old.count >= meshBatchSize || ownerMeshes.length === 1) {
        console.log('Creating new mesh');
        const m = createMesh();

        ownerMeshes.push(m);

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

  render(obj) {
    const scene = this.el.sceneEl.object3D;
    const loader = new Three.JSONLoader();

    const { geometry } = loader.parse(obj.data);
    const mesh = this.getMesh(obj.owner);

    mesh.geometry.merge(geometry, geometry.matrix);

    mesh.geometry.computeBoundingSphere();

    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.elementsNeedUpdate = true;

    scene.remove(mesh);
    scene.add(mesh);
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
      this.worker.postMessage({
        voxels: voxels.added,
        initial: isEmpty(this.meshes),
      });

      return voxels;
    });

    this.worker = new LoaderWorker();

    this.worker.onmessage = data => this.render(data.data);
  },
};
