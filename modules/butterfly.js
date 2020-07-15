//functions that will be added to the butterfly sprite object

export function bfjs(bf){
	bf.idle=idle;//add idle function
	
}
function idle(){
	//overwrites animation stack and layerIndex with idle
	this.layerIndex=this.idleIndex;
	this.stack=this.svg_reformat(this.spriteSheets[this.idleIndex]);//deep copy spritesheet
	this.timer=[0,Math.floor(100* Math.random()),0,Math.floor(100* Math.random())];
	this.currentFrame=this.print(this.stack[0]);

	//console.log("flap flap flap");
}

function onMouseMove(){
	//edit stack to change animation
	this.stack=JSON.parse(JSON.stringify(this.spriteSheets[2]));
	//change position over time
	
	//set time steps
	
}
