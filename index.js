var net = require('net');
var Redis = require('ioredis');
var redis = new Redis();
var server = net.createServer((socket) => {
  console.log('client connected');
  socket.on('data', (data) => {
    data = data.toString();
    console.log('receive data: ' + data);
    if (data.indexOf('hello') !== 0) {
      redis.set('tasks', data);
    }
  });
  socket.on('end', () => {
    console.log('client disconnected');
  });
  socket.write('hello, client\n');
});
server.on('error', (err) => {
  console.log(err);
});
server.listen(7269, () => {
  console.log('server is listening on port: 7269');
});
