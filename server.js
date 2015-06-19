var net = require('net');

var HOST = 'localhost';
var PORT = 9898;

var server = net.createServer(function (socket) {
  socket.on('error', function(err) {
    console.error('SOCKET ERROR:', err);
});
  
 var buffer = new Buffer(1);
  setInterval(function(){ 
    var random = parseInt(Math.random()*50);
    // console.log(random);
    buffer[0] = random;//Math.floor(Math.random()*256) << 8;
    socket.write(buffer);
}, 500);
  socket.pipe(socket);
});
server.listen(PORT, HOST);