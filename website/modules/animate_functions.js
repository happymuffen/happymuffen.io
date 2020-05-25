export class sprite{//takes svg file and instruction set
	//vector sprite animation based on switching layers between visible and not
	constructor(svg){
		//set svg, relevent svg layers
		var e=document.getElementById(svg);
		var raw=e.contentWindow.document.childNodes[1].childNodes;
		var layers=[];
		var layernums=[];
		for(var i=0; i<raw.length; i++){
			//parse raw to find the elements we care about
			if(raw[i]["childNodes"].length!=0){
				layernums.push(i);
				layers.push(raw[i]);
			}
		}
		//split layers into frames
		var spritesheets=[];
		var frames=[];
		this.spritesMap=[]
		for(var i=1; i<layers.length; i++){
			for(var j=1; j<layers[i]["childNodes"].length; j++){
				if(layers[i]["childNodes"][j]["childNodes"].length==0)continue;
				frames.push(layers[i]["childNodes"][j].innerHTML)
			}
			this.spritesMap.push(layers[i]["attributes"][2].nodeValue)//Atribute 2 is "inkscape:label"
			if(this.spritesMap[this.spritesMap.length-1]=="idle")this.idleIndex=spritesheets.length;
			spritesheets.push(frames);
			frames=[];
		}
		this.e=e;
		this.raw=raw;
		this.backupIndexs=layernums;
		this.spriteSheets=spritesheets;
		this.backup=raw;
		this.x=0;
		this.y=0;
		this.stack=[];
	}
	
	print(svg){
		//output text for current frame
		var header="<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:svg=\"http://www.w3.org/2000/svg\"><g class=\"layer\"><title>Layer 1</title>\n";
		var footer='\n</g></svg>';
		var out=header+svg+footer;
		return out;
	}
	idle(){
		//default idle. runs through idle frames in sequence and repeats. overwrite with better AI.
		
		if(this.stack.length==0){
			this.stack=this.spriteSheets[this.idleIndex];
		}
		var currentFrame=this.stack.shift();
		return this.print(currentFrame);
	}
}
