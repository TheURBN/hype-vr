/* global AUTH_UID */
import {
  get,
} from 'lodash';

import config from '../../config.yml';
import world from '../stores/world';

const uid = AUTH_UID;


export default {
  init() {
    this.connect();

    this.ws.addEventListener('open', () => {
      this.getVoxels({
        x: 500,
        y: 500,
      }, config.performance.initialRange);
    });

    this.ws.addEventListener('close', () => {
      this.connect();
    });
  },

  connect() {
    const url = new URL(config.api.websocketUrl);

    url.searchParams.append('uid', uid);

    this.ws = new WebSocket(url.toString());

    this.ws.addEventListener('message', this.handleMessage);
  },

  getVoxels(pos, range = 10) {
    this.ws.send(JSON.stringify({
      type: 'range',
      args: {
        ...pos,
        range,
      },
    }));
  },

  handleMessage(event) {
    const message = JSON.parse(event.data);
    const meta = get(message, 'meta', {});
    const handlers = {
      range: data => world.addVoxels(data),
      update: data => world.addVoxels([data]),
      unknown() {
        console.error(`Unknown ws message type: ${meta.type}`);
      },
      userColor() {},
    };

    const handler = get(handlers, meta.type, handlers.unknown);

    handler(message.data);
  },
};
