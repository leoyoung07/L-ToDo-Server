var net = require('net');
var Redis = require('ioredis');
var redis = new Redis();
var server = net.createServer(socket => {
  console.log('client connected');
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
    console.log('error: ' + error);
  });
});
server.on('error', err => {
  console.log(err);
});
server.listen(7269, () => {
  console.log('server is listening on port: 7269');
});
