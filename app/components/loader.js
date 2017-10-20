import {
  pick,
  chunk,
  map,
  flow,
  sortBy,
} from 'lodash/fp';
import {
  isArray,
  isEmpty,
} from 'lodash';
import { intercept } from 'mobx';
import * as Three from 'three';

import config from '../../config.yml';
import world from '../stores/world';
import LoaderWorker from '../workers/loader.worker';

const position = pick(['x', 'y', 'z']);

const newVoxels = flow(
  chunk(10000),
  map(vox => world.addVoxels(vox)),
);

const mergeDistance = 100;

export default {
  schema: {
    url: {
      default: 'data.json',
    },
  },

  getMesh(owner, center) {
    const ownerMeshes = this.meshes[owner];

    let created = false;

    const createMesh = () => {
      console.log('Creating new mesh');
      const material = new Three.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: Three.FaceColors,
        fog: false,
      });

      created = true;

      const result = {
        mesh: new Three.Mesh(new Three.Geometry(), material),
        count: 1,
      };

      this.meshes[owner].push(result);

      return result;
    };

    if (!ownerMeshes) {
      this.meshes[owner] = [];

      const { mesh } = createMesh();

      return {
        created,
        mesh,
      };
    }

    const findClosestMesh = flow(
      sortBy(obj => obj.mesh.geometry.boundingSphere.center.distanceTo(center)),
      (sorted) => {
        const closest = sorted[0];
        const localCenter = closest.mesh.geometry.boundingSphere.center;

        if (localCenter.distanceTo(center) <= mergeDistance) {
          return closest;
        }

        return null;
      },
    );

    const obj = findClosestMesh(ownerMeshes) || createMesh();

    // eslint-disable-next-line no-plusplus
    obj.count++;

    return {
      created,
      mesh: obj.mesh,
    };
  },

  render(obj) {
    const scene = this.el.sceneEl.object3D;
    const loader = new Three.JSONLoader();

    const { geometry } = loader.parse(obj.data);

    geometry.computeBoundingSphere();

    const { created, mesh } = this.getMesh(obj.owner, geometry.boundingSphere.center);
    const color = config.world.colors[obj.owner];
    const colorFaces = map(face => face.color.set(color));

    mesh.geometry.merge(geometry, geometry.matrix);
    mesh.geometry.computeBoundingSphere();

    colorFaces(mesh.geometry.faces);

    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.elementsNeedUpdate = true;
    mesh.geometry.colorsNeedUpdate = true;

    if (created) {
      scene.add(mesh);
    }
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
