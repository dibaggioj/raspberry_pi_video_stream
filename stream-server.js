var	BigBangClient = require("./BigBangClient.js"),
	PewRuntime = require("./BigBangClient.js"),
	bbNode = require("./NodeBigBangClient.js");

var websocket = require('websocket');

var client = new bbNode.NodeBigBangClient();
var myChannel;

client.connectAnonymous("thegigabots.app.bigbang.io:80", function(result) {
	if( result.success) {
		client.subscribe("newBot", function( err, c) {
			if(!err) {
				myChannel = c;
				beginStream(client,c);
			}
			else {
				console.log("Subscribe failure. " + err);
			}
		})
	}
	else {
		console.log("Connect Failure.");
	}
});

function beginStream(client, channel) {
	console.log("Commence ze streaming now!!!");
	/*
	*TODO
	*
	*/


}


/*
==========================================================*/


if( process.argv.length < 3 ) {
	console.log(
		'Usage: \n' +
		'node stream-server.js <secret> [<stream-port> <websocket-port>]'
	);
	process.exit();
}

var STREAM_SECRET = process.argv[2] || 'johnpi',
	STREAM_PORT = process.argv[3] || 8082,
	WEBSOCKET_PORT = process.argv[4] || 80,
	STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

var width = 320,
	height = 240;

// Websocket Server
var socketServer = new (require('ws').Server)({port: WEBSOCKET_PORT});
socketServer.on('connection', function(socket) {
	// Send magic bytes and video size to the newly connected socket
	// struct { char magic[4]; unsigned short width, height;}
	var streamHeader = new Buffer(8);
	streamHeader.write(STREAM_MAGIC_BYTES);
	streamHeader.writeUInt16BE(width, 4);
	streamHeader.writeUInt16BE(height, 6);
	socket.send(streamHeader, {binary:true});

	console.log( 'New WebSocket Connection ('+socketServer.clients.length+' total)' );
	
	socket.on('close', function(code, message){
		console.log( 'Disconnected WebSocket ('+socketServer.clients.length+' total)' );
	});
});

//var socketServer = "thegigabots.app.bigbang.io";

socketServer.broadcast = function(data, opts) {
	for( var i in this.clients ) {
		if (this.clients[i].readyState == 1) {
			this.clients[i].send(data, opts);
		}
		else {
			console.log( 'Error: Client ('+i+') not connected.' );
		}
	}
};


// HTTP Server to accept incomming MPEG Stream
var streamServer = require('http').createServer( function(request, response) {
	var params = request.url.substr(1).split('/');
	width = (params[1] || 320)|0;
	height = (params[2] || 240)|0;

	if( params[0] == STREAM_SECRET ) {
		console.log(
			'Stream Connected: ' + request.socket.remoteAddress + 
			':' + request.socket.remotePort + ' size: ' + width + 'x' + height
		);
		request.on('data', function(data){
			socketServer.broadcast(data, {binary:true});
		});
	}
	else {
		console.log(
			'Failed Stream Connection: '+ request.socket.remoteAddress + 
			request.socket.remotePort + ' - wrong secret.'
		);
		response.end();
	}
}).listen(STREAM_PORT);

console.log('Listening for MPEG Stream on http://127.0.0.1:'+STREAM_PORT+'/'+STREAM_SECRET+'/'+width+'/'+height);
//console.log('Awaiting WebSocket connections on ws://'+socketServer+':'+WEBSOCKET_PORT+'/');

/*
on raspberrypi, run:

node /home/pi/dist/node/stream-server.js johnpi

then:

ffmpeg -s 320x240 -f video4linux2 -i /dev/video4 -f mpeg1video \ -b 800k -r 30 http://192.168.1.108:8082/johnpi/320/240/

*/

