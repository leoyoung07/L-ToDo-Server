'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const events_1 = require('events');
var BufferReadState;
(function(BufferReadState) {
  BufferReadState['HEAD'] = 'head';
  BufferReadState['BODY'] = 'body';
})(BufferReadState || (BufferReadState = {}));
class SocketHelper extends events_1.EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.headLength = 4;
    this.buffer = Buffer.alloc(0);
    this.state = BufferReadState.HEAD;
    this.bodyLength = 0;
    this.socket.on('data', this.onData);
  }
  writeData(data, callback) {
    if (data && data.length > 0) {
      // write Head and Body
      const head = Buffer.alloc(this.headLength);
      head.writeUInt32BE(data.length, 0);
      this.socket.write(head);
      const finished = this.socket.write(data);
      if (callback) {
        if (!finished) {
          this.socket.once('drain', callback);
        } else {
          process.nextTick(callback);
        }
      }
    }
  }
  onData(data) {
    this.buffer = Buffer.concat(
      [this.buffer, data],
      this.buffer.length + data.length
    );
    this.readData();
  }
  readData() {
    // read Head and Body
    if (this.state === BufferReadState.HEAD) {
      this.readHead();
    } else if (this.state === BufferReadState.BODY) {
      this.readBody();
    } else {
      throw Error('Socket read state error');
    }
  }
  readHead() {
    if (this.buffer && this.buffer.length >= this.headLength) {
      // get body length from head
      this.bodyLength = this.buffer.readUInt32BE(0);
      this.buffer = this.buffer.slice(this.headLength);
      this.state = BufferReadState.BODY;
      this.readData();
    }
  }
  readBody() {
    if (this.buffer && this.buffer.length >= this.bodyLength) {
      // read body, emit 'data' event, and call `readData`
      const data = this.buffer.slice(0, this.bodyLength);
      this.emit('data', data);
      this.buffer = this.buffer.slice(this.bodyLength);
      this.state = BufferReadState.HEAD;
      this.readData();
    }
  }
}
module.exports = SocketHelper;
//# sourceMappingURL=SocketHelper.js.map
