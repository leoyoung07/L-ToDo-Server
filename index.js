var net = require('net');
var server = net.createServer((socket) => {
  console.log('client connected');
  socket.on('data', (data) => {
    console.log('receive data: ' + data.toString());
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
