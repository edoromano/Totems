var net = require('net');

var client = new net.Socket();
client.connect(8888, 'tagmasterdemo.dyndns.org', function() {
	console.log('Connected');
});
 
client.on('data', function(data) {
	console.log('Received: ' + data);
});
 
client.on('error', function(data){
	console.log("cant reach the host");
})

client.on('close', function() {
	console.log('Connection closed');
});