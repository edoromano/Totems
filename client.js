var net = require('net');
var http = require('http');
var mysql = require('mysql');
var wsseHeaders = require('./wsse');
var displays = [];
//the lectures indexed by { host: "blah.blah", lecture: (Object lectrue)};
var lectures = {};
var connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '',
  database: 'horus'
});
connection.connect();
connection.on('error', function(error){
	console.log('Maybe you need to turn on the MySQL server');
});


/*
	Totem Lecture
*/
function Lecture(data){
	this.id = data.id;
	this.numberOfData = function(){ return 0; };
	this.speed = function(){ return 0; };
	this.date = function(){ return new Date(); };
	this.host = data.host;
	this.location = "Current Location";
}

/*
	Decorator, speed and counter
*/
function Speed(lecture, currentSpeed){
	var thespeed = lecture.speed();
	var numberOfData = lecture.numberOfData();
	lecture.speed = function(){
		return thespeed + currentSpeed
	};
	lecture.numberOfData = function(){
		return numberOfData + 1;
	};
}
/*
	TODO: get the displays from HORUS
*/
function getDisplays(){

	var options = {
	  hostname: 'localhost',
	  port: 8080,
	  path: '/app_dev.php/api/v1/displays.json'
	  // headers: {
	  //   'Content-Type': 'application/x-www-form-urlencoded',
	  //   'Content-Length': postData.length
	  // }
	};

	http.get(options, function (res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			var newDisplays = JSON.parse(chunk);
			var found;	
			newDisplays.forEach(function(newDisplay){
				found = false;
				displays.forEach(function(display){
					if(newDisplay.displayId == display.displayId){
						found = true;
					}
				});
				if(!found){
					console.log("will set the socket: "+newDisplay);
					setSocket(newDisplay);
					displays.push(newDisplay);
				}
			});
		});
	});
	// return [{id: 1, host: 'tagmasterdemo.dyndns.org', port: 8888}];
	// return [{id: 3, host: 'localhost', port: 9898}];
}
/*
	Insert the information about the host and the current average speed
	what is inserted? 
	ex. { host:"localhost", address:"Direccion", date:"1/1/1111", time:"4:00:00" }
*/
function insertDataMysql(lecture){
	var query = "INSERT INTO displaylecture (display_id, creationDate, speed_avg) VALUES ("+lecture.id+", NOW(), "+parseInt(lecture.speed()/lecture.numberOfData())+" );";
	console.log(query);
	connection.query(query, function(err, rows, fields) {
		if (!err){
			console.log('query executed succesfuly: \n'+ query);
		}
		else
			console.log('Error while performing Query.');
	});
}

/*
	Register the reading of the totem
	if the speed is greater than 0 and the lecture is not defined
	create a new object lecture
	else update that object
*/
function setLecture(data){
	if(data.speed != 0 && typeof(lectures[data.host]) != "undefined"){
		new Speed(lectures[data.host], data.speed);
		// console.log(lectures[data.host]);
	}
	else if(data.speed != 0 && typeof(lectures[data.host]) == "undefined"){
		lectures[data.host] =  new Lecture(data);
		// console.log(lectures[data.host]);
		new Speed(lectures[data.host], data.speed);
	}
	else if(typeof(lectures[data.host]) != "undefined"){
		insertDataMysql(lectures[data.host]);
		// console.log(lectures[data.host])
		delete lectures[data.host];
	}
}

/*
	Set the socket for the current display
*/
function setSocket(display){
	console.log("---------------SETSOCKET-----------------");
	console.log("puerto: "+display.port+" host: "+display.host)
	var client = new net.Socket();
	client.connect(display.port, display.host, function() {
		console.log('Connected to '+display.host);
	});
	client.on('data', function(data) {
		console.log(data);
		// console.log(display.host+ ":  " +JSON.stringify(data) + ": " + data.length + " characters, " + Buffer.byteLength(data, 'utf8') + " bytes");
		// console.log("lecture:::::" + {host:display.host, speed: JSON.parse(JSON.stringify(data)).data[0] });
		setLecture({id:display.displayId, host:display.host, speed: JSON.parse(JSON.stringify(data)).data[0] });
	});
	client.on('error', function(data){
		console.log("no host answer :(");
		client.end();
		delete displays[data.host];
	});
	client.on('close', function() {
		console.log('Connection closed');
	});
}

setInterval(function(){
	console.log("test headers: "+ wsseHeaders.generate('jlhp', 'joseluis'));
	// getDisplays();
},3000);