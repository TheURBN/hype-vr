import aFrame from 'aframe';


export default {
  dependendencies: ['position'],

  schema: {
    offset: {
      type: 'vec3',
    },
    snap: {
      type: 'vec3',
    },
  },

  init() {
    this.originalPos = this.el.getAttribute('position');
  },

  update() {
    const data = this.data;
    const pos = aFrame.utils.clone(this.originalPos);

    pos.x = (Math.floor(pos.x / data.snap.x) * data.snap.x) + data.offset.x;
    pos.y = (Math.floor(pos.y / data.snap.y) * data.snap.y) + data.offset.y;
    pos.z = (Math.floor(pos.z / data.snap.z) * data.snap.z) + data.offset.z;

    this.el.setAttribute('position', pos);
  },
};
