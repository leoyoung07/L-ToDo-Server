var net = require('net');
var SocketHelper = require('../SocketHelper');
var writeToSocket = require('./util').writeToSocket;

var sock = net.connect(
  7269,
  '127.0.0.1'
);

var helper = new SocketHelper(sock);

sock.on('connect', function() {
  // tslint:disable-next-line:no-console
  console.log('server connected...');
  writeToSocket(
    helper,
    JSON.stringify({
      type: 'ping',
      data: 'ping'
    })
  );
});

helper.on('data', function(data) {
  var resStr = data.toString();
  // tslint:disable-next-line:no-console
  console.log(resStr);
});

sock.on('error', function(err) {
  // tslint:disable-next-line:no-console
  console.log(err);
});

sock.on('end', function() {
  // tslint:disable-next-line:no-console
  console.log('disconnected from server...');
});
