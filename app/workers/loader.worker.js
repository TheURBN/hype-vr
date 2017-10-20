import {
  reduce,
  flow,
  groupBy,
  map,
  chunk,
} from 'lodash/fp';
import * as Three from 'three';

import config from '../../config.yml';

const meshBatchSize = config.performance.meshBatchSize;

const reduceF = (func, acc) => data => reduce(func, acc())(data);


function createVoxels(voxels) {
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
      console.log(`Created ${result.count} voxels for user ${result.owner}`);

      postMessage({
        data: result.geometry.toJSON(),
        owner: result.owner,
      });
    },
  );

  const processObject = flow(
    chunk(meshBatchSize),
    map(createObject),
  );

  const createObjects = flow(
    groupBy('owner'),
    map(processObject),
  );

  createObjects(voxels);
}


// eslint-disable-next-line no-undef
onmessage = (event) => {
  const voxels = event.data.voxels;
  const initial = event.data.initial;

  createVoxels(voxels, initial);
};
