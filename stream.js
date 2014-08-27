/*
* Live video-stream program for Rasp Pi
*/
var	BigBangClient = require("./BigBangClient.js"),
	PewRuntime = require("./BigBangClient.js"),
	bbNode = require("./NodeBigBangClient.js");

var websocket = require('websocket'),
	ffmpeg = require('fluent-ffmpeg'),
	express = require('express'),
	fs = require('fs');

//var app = express();


// create the target stream (can be any WritableStream)
// var stream = fs.createWriteStream('/path/to/yout_target.flv')

// // make sure you set the correct path to your video file
// var proc = ffmpeg('/dev/video4')
// 	// use the 'flashvideo' preset (located in /lib/presets/flashvideo.js)
// 	.preset('flashvideo')
// 	// setup event handlers
// 	.on('end', function() {
// 	console.log('file has been converted succesfully');
// 	})
// 	.on('error', function(err) {
// 	console.log('an error happened: ' + err.message);
// 	})
// 	// save to stream
// 	.pipe(stream, {end:true}); //end = true, close output stream after writing

// console.dir(proc);
// console.dir(stream);

//var ffmpeg-node = require('./node_modules/ffmpeg-node/ffmpeg-node.js');

// ffmpeg-node.mp4(
//    './test.3gp',
//    function (err, out, code) {
//       console.log(err, out, code);
//    }
// );

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

	var intervalMessages = setInterval( function () { sendMessages()}, 1000);

}

function sendMessages() {
	myChannel.publish("publishing event...", function (err) {
        if (err) {
            console.log("Publish error:" + err);
        }
    });
	//console.log("publishing event...");
}

