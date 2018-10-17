var net = require('net');
var SocketHelper = require('./SocketHelper');
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
      console.log(error);
      return;
    }
    writeToSocket(
      socketHelper,
      JSON.stringify({
        type: 'pong',
        data: 'pong'
      })
    );
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

function writeToSocket(socketHelper, content, callback) {
  socketHelper.writeData(Buffer.from(content + '\n'), callback);
}
