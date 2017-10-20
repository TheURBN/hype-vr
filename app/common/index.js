import config from '../../config.yml';

const map = config.api.mapping;


export function mPosition({ x, y, z, ...obj }) {
  return {
    [map.x]: x,
    [map.y]: y,
    [map.z]: z,
    ...obj,
  };
}


export default {
  mPosition,
};
