import {
  filter,
  flow,
  groupBy,
  map,
  reduce,
} from 'lodash/fp';
import * as Three from 'three';

import { chunkCoordinates } from '../stores/world';
import entities from '../entities';

const reduceF = (func, acc) => data => reduce(func, acc())(data);

const filters = {
  common: filter(obj => !obj.capturable),
  flag: filter({ capturable: true }),
};


function reportResult(chunkId) {
  return (result) => {
    result.geometry.computeBoundingSphere();

    const sphere = result.geometry.boundingSphere;
    const colorFaces = map(face => face.color.set(result.owner));

    colorFaces(result.geometry.faces);

    postMessage({
      chunkId,
      namespace: 'loader',
      type: 'common',
      data: result.geometry.toJSON(),
      sphere: {
        radius: sphere.radius,
        center: [sphere.center.x, sphere.center.y, sphere.center.z],
      },
      owner: result.owner,
    });
  };
}


function createFlags(chunk) {
  if (!chunk[0]) {
    return;
  }

  const chunkId = chunkCoordinates(chunk[0]);

  const createObject = flow(
    map((obj) => {
      const g = new Three.Geometry();
      const geometry = entities.flag.geometry();

      geometry.translate(obj.x, obj.y, obj.z);

      g.merge(geometry);

      return {
        geometry: g,
        owner: obj.owner,
      };
    }),

    map(reportResult(chunkId)),
  );

  createObject(chunk);
}


function createVoxels(chunk) {
  if (!chunk[0]) {
    return;
  }

  const chunkId = chunkCoordinates(chunk[0]);

  const createObject = flow(
    reduceF((acc, obj) => {
      const geometry = entities.voxel.geometry();

      geometry.translate(obj.x, obj.y, obj.z);

      acc.geometry.merge(geometry, geometry.matrix);

      acc.count += 1;
      acc.owner = acc.owner || obj.owner;

      return acc;
    }, () => ({
      geometry: new Three.Geometry(),
      count: 0,
    })),

    reportResult(chunkId),
  );

  const createObjects = flow(
    groupBy('owner'),
    map(createObject),
  );

  createObjects(chunk);
}


// eslint-disable-next-line no-undef
onmessage = (event) => {
  const { chunk } = event.data;

  createVoxels(filters.common(chunk));
  createFlags(filters.flag(chunk));
};
