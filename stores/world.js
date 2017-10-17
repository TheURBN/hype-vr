import { find } from 'lodash';
import { map, filter } from 'lodash/fp';
import {
  observable,
} from 'mobx';

import { mPosition } from '../common';


const toM = map(mPosition);


function makeComparator(voxel) {
  return existing => existing.x === voxel.x &&
    existing.y === voxel.y &&
    existing.z === voxel.z;
}

class World {
  @observable voxels = [];

  voxelExists(voxel) {
    const comparator = makeComparator(voxel);

    if (find(this.voxels, comparator)) {
      return true;
    }

    return false;
  }

  addVoxel(voxel) {
    const mVoxel = mPosition(voxel);

    if (!this.voxelExists(mVoxel)) {
      this.voxels.push({
        ...mVoxel,
      });
    }
  }

  addVoxels(voxels) {
    const nonExisting = filter(v => !this.voxelExists(v));
    const mVoxels = nonExisting(toM(voxels));

    this.voxels.push(...mVoxels);
  }

  getVoxel(position) {
    const mVoxel = mPosition(position);
    const comparator = makeComparator(mVoxel);

    return find(this.voxels, comparator);
  }
}


const world = new World();

export default world;
