'use strict';
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics = function(d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function(d, b) {
            d.__proto__ = b;
          }) ||
        function(d, b) {
          for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
var events_1 = require('events');
var BufferReadState;
(function(BufferReadState) {
  BufferReadState['HEAD'] = 'head';
  BufferReadState['BODY'] = 'body';
})(BufferReadState || (BufferReadState = {}));
var SocketHelper = /** @class */ (function(_super) {
  __extends(SocketHelper, _super);
  function SocketHelper(socket) {
    var _this = _super.call(this) || this;
    _this.socket = socket;
    _this.headLength = 4;
    _this.buffer = Buffer.alloc(0);
    _this.state = BufferReadState.HEAD;
    _this.bodyLength = 0;
    _this.socket.on('data', _this.onData.bind(_this));
    return _this;
  }
  SocketHelper.prototype.writeData = function(data, callback) {
    if (data && data.length > 0) {
      // write Head and Body
      var head = Buffer.alloc(this.headLength);
      head.writeUInt32BE(data.length, 0);
      this.socket.write(head);
      var finished = this.socket.write(data);
      if (callback) {
        if (!finished) {
          this.socket.once('drain', callback);
        } else {
          process.nextTick(callback);
        }
      }
    }
  };
  SocketHelper.prototype.onData = function(data) {
    this.buffer = Buffer.concat(
      [this.buffer, data],
      this.buffer.length + data.length
    );
    this.readData();
  };
  SocketHelper.prototype.readData = function() {
    // read Head and Body
    if (this.state === BufferReadState.HEAD) {
      this.readHead();
    } else if (this.state === BufferReadState.BODY) {
      this.readBody();
    } else {
      throw Error('Socket read state error');
    }
  };
  SocketHelper.prototype.readHead = function() {
    if (this.buffer && this.buffer.length >= this.headLength) {
      // get body length from head
      this.bodyLength = this.buffer.readUInt32BE(0);
      this.buffer = this.buffer.slice(this.headLength);
      this.state = BufferReadState.BODY;
      this.readData();
    }
  };
  SocketHelper.prototype.readBody = function() {
    if (this.buffer && this.buffer.length >= this.bodyLength) {
      // read body, emit 'data' event, and call `readData`
      var data = this.buffer.slice(0, this.bodyLength);
      this.emit('data', data);
      this.buffer = this.buffer.slice(this.bodyLength);
      this.state = BufferReadState.HEAD;
      this.readData();
    }
  };
  return SocketHelper;
})(events_1.EventEmitter);
module.exports = SocketHelper;
//# sourceMappingURL=SocketHelper.js.map
