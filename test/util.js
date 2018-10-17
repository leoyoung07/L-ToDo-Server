function writeToSocket(socketHelper, content, callback) {
  socketHelper.writeData(Buffer.from(content + '\n'), callback);
}
module.exports.writeToSocket = writeToSocket;
