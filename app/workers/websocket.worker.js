import config from '../../config.yml';


function handleMessage(event) {
  postMessage(JSON.parse(event.data));
}


function connect(token) {
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


function init(token) {
  const ws = connect(token);

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


// eslint-disable-next-line no-undef
onmessage = (event) => {
  const token = event.data.token;

  init(token);
};
