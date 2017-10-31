import {
  get,
} from 'lodash';

import world from '../stores/world';
import Worker from '../workers/websocket.worker';


export default {
  init() {
    this.worker = new Worker();

    this.worker.onmessage = event => this.handleMessage(event);
  },

  handleMessage(event) {
    const message = event.data;
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
