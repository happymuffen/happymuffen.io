//functions that will be added to the butterfly sprite object

import {sprite,path} from './animate_functions.js';

export class butterfly extends sprite{
	constructor(svg){
		super(svg);
	}
	idle(){
	//overwrites animation stack and layerIndex with idle
	if (this.lmp.toString()!=[this.x,this.y].toString()) {this.move();return;}//check if movement is required
	this.layerIndex=this.idleIndex;
	this.stack=this.svg_reformat(this.spriteSheets[this.idleIndex]);
	this.timer=[0,Math.floor(500* Math.random()),0,Math.floor(500* Math.random())];
	this.currentFrame=this.print(this.stack[0]);
	
	this.memory=["idle"];

	//console.log("flap flap flap");
	}
	move(){//sets paramiters for moving
		this.stack=this.svg_reformat(this.spriteSheets[2]);
		var p=new path([[this.x,this.y],[this.x,this.y+10],[this.lmp[0],this.lmp[1]-10],this.lmp],true);
		this.memory=["moving",p,0,20];
		this.timer=[0];
		this.currentFrame=this.print(this.stack[0]);
	}
	onMouseMove(){
		//edit stack to change animation
		this.stack=JSON.parse(JSON.stringify(this.spriteSheets[2]));
		//change position over time
		
		//set time steps
		
	}

	random_path(){
		//when called makes random destination, a path to it, and sets ai to moving.
		var destX=0,destY=0,speed=20;
		destX=this.width*math.random*2-this.width;
		destY=this.height*math.random*2-this.height;
		
		
		this.memory=["moving",[[this.x,this.y],[destX,destY]],0,speed];
	}

	svg_ai(){//used for setting things at each tick
		switch(this.memory[0]){
			case "idle"://no ai required
				break;
			case "moving":
				this.moving();
				break;
		}
	}

	moving(){
		//memory:["moving", path[], progress, total_steps]
		if (this.memory[2] >=this.memory[3]) {this.idle();return;}//check if further movement is required
		this.memory[2]++;
		[this.x,this.y]=this.memory[1].get_point(this.memory[2]/this.memory[3]);
		this.timer=[0,0];
		this.stack=this.svg_reformat(this.spriteSheets[2]);

		return;
	}
	
}
