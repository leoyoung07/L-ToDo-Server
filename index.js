var net = require('net');
var Redis = require('ioredis');
var SocketHelper = require('./SocketHelper');
var redis = new Redis();
var clients = [];
var server = net.createServer(socket => {
  console.log('client connected');
  var socketHelper = new SocketHelper(socket);
  clients.push(socketHelper);
  socketHelper.on('data', buffer => {
    const reqStr = buffer.toString();
    console.log('receive data: ' + reqStr);
    let request;
    try {
      request = JSON.parse(reqStr);
    } catch (error) {
      writeToSocket(
        socketHelper,
        JSON.stringify({
          type: 'error',
          data: error
        })
      );
      return;
    }
    switch (request.type) {
      case 'download':
        redis.get('tasks', (error, data) => {
          if (error) {
            writeToSocket(
              socketHelper,
              JSON.stringify({
                type: 'error',
                data: error
              })
            );
          } else {
            writeToSocket(
              socketHelper,
              JSON.stringify({
                type: 'download',
                data: data
              })
            );
          }
        });
        break;
      case 'upload':
        redis.set('tasks', request.data);
        writeToSocket(
          socketHelper,
          JSON.stringify({
            type: 'upload',
            data: 'success'
          })
        );
        broadcastUpdateTasks(clients, socket);
        break;
      case 'ping':
        writeToSocket(
          socketHelper,
          JSON.stringify({
            type: 'pong',
            data: 'pong'
          })
        );
        break;
      default:
        writeToSocket(
          socketHelper,
          JSON.stringify({
            type: 'error',
            data: 'Unknown request type.'
          })
        );
        break;
    }
  });
  socket.on('end', () => {
    console.log('client disconnected');
  });
  socket.on('error', error => {
    var index = clients.findIndex(
      sock =>
        sock.remoteAddress === socket.remoteAddress &&
        sock.remotePort === socket.remotePort
    );
    clients.splice(index, 1);
    console.log('error: ' + error);
  });
});
server.on('error', err => {
  console.log(err);
});
server.listen(7269, () => {
  console.log('server is listening on port: 7269');
});

function broadcastUpdateTasks(clients, exceptClient) {
  // broadcast update tasks, except current client
  console.log('broadcastUpdateTasks');
  for (var i = 0; i < clients.length; i++) {
    var socketHelper = clients[i];
    var socket = socketHelper.socket;
    console.log('check client: ' + socket.remoteAddress + ':' + socket.remotePort);
    console.log('except client: ' + exceptClient.remoteAddress + ':' + exceptClient.remotePort);
    if (
      socket.remoteAddress !== exceptClient.remoteAddress ||
      socket.remotePort !== exceptClient.remotePort
    ) {
      console.log('update client: ' + socket.remoteAddress + socket.remotePort);
      writeToSocket(
        socketHelper,
        JSON.stringify({
          type: 'update',
          data: 'update'
        })
      );
    }
  }
}

function writeToSocket(socketHelper, content, callback) {
  socketHelper.writeData(Buffer.from(content + '\n'), callback);
}
