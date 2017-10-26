import { map, filter, forEach } from 'lodash/fp';
import {
  observable,
} from 'mobx';

import { mPosition } from '../common';


const toM = map(mPosition);


const chunkSize = {
  x: 48,
  y: 100,
  z: 48,
};


export function coordinates(obj) {
  return `${obj.x}_${obj.y}_${obj.z}`;
}


export function chunkCoordinates(voxel, transform = coordinates) {
  return transform({
    x: Math.floor(voxel.x / chunkSize.x),
    y: Math.floor(voxel.y / chunkSize.y),
    z: Math.floor(voxel.z / chunkSize.z),
  });
}


class World {
  @observable.shallow chunks = new Map();

  static newChunk() {
    return {
      data: observable.map(),
    };
  }

  getChunk(voxel) {
    return this.chunks.get(chunkCoordinates(voxel));
  }

  voxelExists(voxel) {
    const cc = chunkCoordinates(voxel);
    const c = coordinates(voxel);

    if (this.chunks.has(cc) && this.chunks.get(cc).data.has(c)) {
      const chunk = this.chunks.get(cc).data.get(c);

      return chunk.owner === voxel.owner;
    }

    return false;
  }

  addToMap(voxel) {
    const cc = chunkCoordinates(voxel);

    if (!this.chunks.has(cc)) {
      this.chunks.set(cc, World.newChunk());
    }

    const chunk = this.chunks.get(cc);

    chunk.data.set(coordinates(voxel), voxel);
  }

  addVoxels(voxels) {
    const nonExisting = filter(v => !this.voxelExists(v));
    const mVoxels = nonExisting(toM(voxels));

    forEach(v => this.addToMap(v))(mVoxels);
  }

  deleteVoxel(voxel) {
    const cc = chunkCoordinates(voxel);
    const chunk = this.chunks.get(cc);
    const c = coordinates(voxel);

    if (chunk.data.has(c)) {
      chunk.data.delete(c);
    }
  }
}


const world = new World();

export default world;
