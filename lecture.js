function Lecture(data){
	this.speed = function(){ return 0; };
	this.date = function(){ return new Date(); };
	this.host = '0.0.0.0';
	this.location = "Current Location";
}

function Speed(lecture, currentSpeed){
	var speed = lecture.speed();
	lecture.speed = function(){
		speed + currentSpeed
	}
}