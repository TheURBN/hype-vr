import { omit } from 'lodash/fp';
import { LineDashedMaterial } from 'three';


const omitExtra = omit([
  'npot',
  'offset',
  'repeat',
  'shader',
  'shading',
]);


export default {
  schema: {
    linewidth: {
      default: 1,
    },
    dashsize: {
      default: 3,
    },
  },

  init(data) {
    this.material = new LineDashedMaterial({
      ...omitExtra(data),
    });

    this.update(data);
  },

  update(data) {
    this.material.linewidth = data.linewidth;
    this.material.dashsize = data.dashsize;
  },
};
