//functions that will be added to the butterfly sprite object

export function bfjs(bf){
	bf.idle=idle;//add idle function
	
}
function idle(){
	//overwrites animation stack and layerIndex with idle
	this.layerIndex=this.idleIndex;
	this.stack=this.svg_reformat(this.spriteSheets[this.idleIndex]);
	this.timer=[0,Math.floor(100* Math.random()),0,Math.floor(100* Math.random())];
	this.currentFrame=this.print(this.stack[0]);
	
	this.memory=["idle"];

	//console.log("flap flap flap");
}

function onMouseMove(){
	//edit stack to change animation
	this.stack=JSON.parse(JSON.stringify(this.spriteSheets[2]));
	//change position over time
	
	//set time steps
	
}

function random_path(){
	//when called makes random destination, a path to it, and sets ai to moving.
	var destX=0,destY=0,speed=1/20;
	destX=this.width*math.random*2-this.width;
	destY=this.height*math.random*2-this.height;
	
	
	this.memory=["moving",[[this.x,this.y],[destX,destY]],0,speed];
}

function svg_ai(){//used for setting things at each tick
	switch(this.memory[0]){
		case "idle"://no ai required
			break;
		case "moving":
			moving();
			break;
	}
}

function moving(){
	//memory:["moving", path[], t, speed]
	
}
