export default class Voxel {
  constructor(url) {
    this.ws = new WebSocket(url);

    this.promises = {};

    this.promises.connected = new Promise((resolve) => {
      this.ws.addEventListener('open', resolve);
    });
  }

  async connected() {
    return this.promises.connected;
  }

  async getVoxels(position, range = 100) {
    this.ws.send({
      method: 'get',
      args: {
        x: position.x,
        y: position.y,
        range,
      },
    });
  }
}
