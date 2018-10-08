var net = require('net');
var Redis = require('ioredis');
var redis = new Redis();
var clients = [];
var server = net.createServer(socket => {
  console.log('client connected');
  clients.push(socket);
  socket.on('data', buffer => {
    const reqStr = buffer.toString();
    console.log('receive data: ' + reqStr);
    const request = JSON.parse(reqStr);
    switch (request.type) {
      case 'download':
        redis.get('tasks', (error, data) => {
          if (error) {
            socket.write(
              JSON.stringify({
                type: 'error',
                data: error
              })
            );
          } else {
            socket.write(
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
        socket.write(
          JSON.stringify({
            type: 'upload',
            data: 'success'
          })
        );
        broadcastUpdateTasks(clients, socket);
        break;
      case 'ping':
        socket.write(
          JSON.stringify({
            type: 'pong',
            data: 'pong'
          })
        );
        break;
      default:
        socket.write(
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
    var socket = clients[i];
    console.log('check client: ' + socket.remoteAddress + ':' + socket.remotePort);
    console.log('except client: ' + exceptClient.remoteAddress + ':' + exceptClient.remotePort);
    if (
      socket.remoteAddress !== exceptClient.remoteAddress ||
      socket.remotePort !== exceptClient.remotePort
    ) {
      console.log('update client: ' + socket.remoteAddress + socket.remotePort);
      socket.write(
        JSON.stringify({
          type: 'update',
          data: 'update'
        })
      );
    }
  }
}
