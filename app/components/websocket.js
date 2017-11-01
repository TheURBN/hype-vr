import firebase from 'firebase';
import {
  get,
} from 'lodash';

import auth from '../common/auth';
import world from '../stores/world';
import Worker from '../workers/websocket.worker';


export default {
  async init() {
    const provider = new firebase.auth.GithubAuthProvider();
    let result;

    try {
      result = await auth.auth().signInWithPopup(provider);
    } catch (e) {
      console.error(`Failed to sign in: ${e}`);

      return;
    }

    this.worker = new Worker();

    this.worker.postMessage({
      token: await result.user.getIdToken(),
    });

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
