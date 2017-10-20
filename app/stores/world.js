import { find } from 'lodash';
import { map, filter, forEach } from 'lodash/fp';
import {
  observable,
} from 'mobx';

import { mPosition } from '../common';


const toM = map(mPosition);
const NULL = '';


function makeComparator(voxel) {
  return existing => existing.x === voxel.x &&
    existing.y === voxel.y &&
    existing.z === voxel.z;
}

function coordinates(obj) {
  return `${obj.x}_${obj.y}_${obj.z}`;
}

class World {
  @observable voxels = [];
  voxelMap = Object.create(null);

  voxelExists(voxel) {
    return this.voxelMap[coordinates(voxel)] === NULL;
  }

  addToMap(voxel) {
    this.voxelMap[coordinates(voxel)] = NULL;
  }

  addVoxels(voxels) {
    const nonExisting = filter(v => !this.voxelExists(v));
    const mVoxels = nonExisting(toM(voxels));

    this.voxels.push(...mVoxels);
    forEach(v => this.addToMap(v))(mVoxels);
  }

  getVoxel(position) {
    const mVoxel = mPosition(position);
    const comparator = makeComparator(mVoxel);

    return find(this.voxels, comparator);
  }
}


const world = new World();

export default world;
