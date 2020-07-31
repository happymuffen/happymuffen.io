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
		//memory:["moving", path{}, progress, total_steps, lastflap]
		if (this.memory[2] >=this.memory[3]) {this.idle();return;}//check if further movement is required
		this.memory[2]++;
		[this.x,this.y]=this.memory[1].get_point(this.memory[2]/this.memory[3]);
		this.timer=[0,0];
		this.transform(this.memory);
		return;
	}
	transform(memory){//changes butterfly to be flying at correct angle, and flapping
		
		this.stack=this.svg_reformat(this.spriteSheets[2]);
		
		//get all curves in svg
		var svg=this.svg_reformat(this.spriteSheets[2])[0];
		var parsed;
		if (window.DOMParser)
		{
			var parser = new DOMParser();
			parsed = parser.parseFromString(svg, "text/xml");
		}
		else
		{
			parsed = new ActiveXObject("Microsoft.XMLDOM");
			parsed.async = false;
			parsed.loadXML(svg);
		}
		var elements=parsed.getElementsByTagName("path");
		//~ //add values to each element
		//~ var tmp=[];
		//~ var xy=[];
		//~ var str="";
		//~ for(var i=0;i<elements.length;i++){
			//~ tmp=elements[i].attributes["d"].value.split(" ")
			//~ //console.log(tmp);
			//~ xy=tmp[1].split(",");
			//~ xy=[this.x+Number(xy[0]),this.y+Number(xy[1])];
			//~ tmp[1]=xy[0]+","+xy[1];
			//~ str="";
			//~ for(;tmp.length>0;str+=tmp.shift()+" ");//I'm unreasonably proud of this for loop :D
			//~ elements[i].attributes["d"].value=str;
		//~ }
		//~ //return to string and output
		//~ str="";
		//~ for(var i=0;i<elements.length;i++){
			//~ str+=elements[i].outerHTML+"\n";
		//~ }		
		//~ svg=this.svg_reformat([str]);
		
		
		var paths=[];
		var tmp=[];
		for(var i=0;i<elements.length;i++){
			var tmppath=[];
			tmp=elements[i].attributes["d"].value.split(" ")
			var nums;
			while(tmp.length>0){
				nums=tmp.shift().split(",");
				if(nums.length==1)continue;
				tmppath.push([Number(nums[0]),Number(nums[1])]);
			}
			paths.push(new path(tmppath,false));
		}
		
		//get current angle
		var delta=memory[1].get_slope(memory[2]/memory[3]);
		var theta=(Math.atan(delta[1]/Math.abs(delta[0]))/2)+Math.PI/4;
		for(var i=0;i<paths.length;i++){
			paths[i]=paths[i].rotate(this.center,theta);
			if (delta[0]<0)paths[i]=paths[i].skew([this.x,this.y],[-1,1]);
		}
		
		
		//flap if you should flap
		//rebuild stack
			//stick back into elements
		var str="";
		for(var i=0;i<paths.length;i++){
			str="m "+paths[i].points[0][0]+","+paths[i].points[0][1]+" c ";
			for (var j=1;j<paths[i].points.length;j++){//only handles if reletive
				str+=paths[i].points[j][0]+","+paths[i].points[j][1]+" ";
			}
			elements[i].attributes["d"].value=str;
		}
		
		//return to string and add to stack
		str="";
		for(var i=0;i<elements.length;i++){
			str+=elements[i].outerHTML+"\n";
		}		
		
		this.stack.push(this.svg_reformat([str]));
	}
	
}
