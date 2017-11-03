/* eslint no-plusplus: 0 */
import {
  filter,
  flow,
  groupBy,
  map,
  reduce,
  all,
} from 'lodash/fp';
import * as Three from 'three';

import {
  coordinates,
  chunkCoordinates,
} from '../stores/world';
import entities from '../entities';

const reduceF = (func, acc) => data => reduce(func, acc())(data);

const filters = {
  common: filter(obj => !obj.name),
  flag: filter(obj => !!obj.name),
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


function neighbour(voxel, xDiff, yDiff, zDiff) {
  return coordinates({
    x: voxel.x + xDiff,
    y: voxel.y + yDiff,
    z: voxel.z + zDiff,
  });
}


function isSurrounded(chunk, voxel) {
  const neighbours = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, -1],
  ];
  const surrounded = all(([x, y, z]) => {
    if (y < 0) {
      return true;
    }

    return chunk.has(neighbour(voxel, x, y, z));
  });

  return surrounded(neighbours);
}


function optimise(chunk, lo, hi) {
  const optimised = new Map();

  for (let x = lo.x; x < hi.x; x++) {
    for (let y = lo.y; y < hi.y; y++) {
      for (let z = lo.z; z < hi.z; z++) {
        const coord = coordinates({ x, y, z });

        if (chunk.has(coord)) {
          const voxel = chunk.get(coord);

          if (!isSurrounded(chunk, voxel)) {
            optimised.set(coord, voxel);
          }
        }
      }
    }
  }

  const optimisedAway = chunk.size - optimised.size;

  if (optimisedAway > 0) {
    console.log(`Optimised away ${optimisedAway} voxels`);
  }

  return Array.from(optimised.values());
}


// eslint-disable-next-line no-undef
onmessage = (event) => {
  const { data, hi, lo } = event.data;

  const optimisedChunk = optimise(data, lo, hi);

  createVoxels(filters.common(optimisedChunk));
  createFlags(filters.flag(optimisedChunk));
};
