/* global AUTH_TOKEN */
import config from '../../config.yml';


const token = AUTH_TOKEN;


function handleMessage(event) {
  postMessage(JSON.parse(event.data));
}


function connect() {
  const url = new URL(config.api.websocketUrl);

  url.searchParams.append('token', token);

  const ws = new WebSocket(url.toString());

  ws.addEventListener('message', handleMessage);

  return ws;
}


function getVoxels(ws, pos, range = 10) {
  ws.send(JSON.stringify({
    type: 'range',
    args: {
      ...pos,
      range,
    },
  }));
}


function init() {
  const ws = connect();

  ws.addEventListener('open', () => {
    getVoxels(ws, {
      x: 500,
      y: 500,
    }, config.performance.initialRange);
  });

  ws.addEventListener('close', () => {
    connect();
  });
}


init();
