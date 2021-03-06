import {
  intercept,
  reaction,
} from 'mobx';
import * as Three from 'three';

import entities from '../entities';
import world from '../stores/world';
import LoaderWorker from '../workers/loader.worker';


export default {
  createMesh(type) {
    console.log('Creating new mesh');

    const material = entities[type].material();

    return new Three.Mesh(new Three.Geometry(), material);
  },

  getOwnerMesh(chunkId, owner, type) {
    let chunk = this.chunkCache[chunkId];
    let created = false;

    if (!chunk) {
      this.chunkCache[chunkId] = {};

      chunk = this.chunkCache[chunkId];
    }

    let ownerMesh = chunk[owner];

    if (!ownerMesh) {
      ownerMesh = this.createMesh(type);

      chunk[owner] = ownerMesh;
      created = true;
    }

    if (created) {
      return {
        created,
        mesh: ownerMesh,
      };
    }

    return {
      created,
      mesh: this.createMesh(type),
      oldMesh: ownerMesh,
    };
  },

  renderObject(obj, type = 'voxel') {
    const scene = this.el.sceneEl.object3D;

    const loader = new Three.JSONLoader();
    const sphere = new Three.SphereGeometry(obj.sphere.radius);

    sphere.translate(...obj.sphere.center);

    const { geometry } = loader.parse(obj.data);

    geometry.boundingSphere = sphere;

    const { mesh, oldMesh, created } = this.getOwnerMesh(obj.chunkId, obj.owner, type);

    if (!created) {
      scene.remove(oldMesh);
    }

    mesh.geometry.merge(geometry, geometry.matrix);
    mesh.geometry.computeBoundingSphere();

    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.elementsNeedUpdate = true;
    mesh.geometry.colorsNeedUpdate = true;

    scene.add(mesh);
  },

  handleWorker(data) {
    const handlers = {
      common: d => this.renderObject(d, 'voxel'),
      flag: d => this.renderObject(d, 'flag'),
    };

    handlers[data.type](data);
  },

  init() {
    this.chunkCache = {};

    intercept(world.chunks, (chunks) => {
      reaction(
        () => ({
          data: chunks.newValue.data.entries(),
          hi: chunks.newValue.hi,
          lo: chunks.newValue.lo,
        }),
        ({ data, hi, lo }) => {
          this.worker.postMessage({
            data: new Map(data),
            hi,
            lo,
          });
        },
        {
          delay: 1000,
        },
      );

      return chunks;
    });

    this.worker = new LoaderWorker();

    this.worker.onmessage = data => this.handleWorker(data.data);
  },
};
