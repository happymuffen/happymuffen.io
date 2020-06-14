export class sprite{//takes svg file and instruction set
	//vector sprite animation based on switching layers between visible and not
	constructor(svg){
		//set svg, relevent svg layers
		var e=document.getElementById(svg);
		var raw=e.contentWindow.document.childNodes[1];
		//pull data from headers (viewbox)
		this.headers=raw.attributes;
		
		raw=raw.childNodes;
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
		this.layersData=[]
		for(var i=1; i<layers.length; i++){
			for(var j=1; j<layers[i]["childNodes"].length; j++){
				if(layers[i]["childNodes"][j]["childNodes"].length==0)continue;
				frames.push(layers[i]["childNodes"][j].innerHTML)
			}
			//LayersData holds all the data avalible in the layer tag. Some is neccecary for proper display (like translate) 
			this.layersData.push(layers[i]["attributes"])
			if(this.layersData[this.layersData.length-1][2].nodeValue=="idle")this.idleIndex=spritesheets.length;//Atribute 2 is "inkscape:label"
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
		this.layerIndex=this.idleIndex;
	}
	
	print(svg){
		//output text for current frame
		var header="<svg "
		for(var i=0;i<this.headers.length;i++){
			if(this.headers[i].name=="width" || this.headers[i].name=="height") continue;
			header+=this.headers[i].name+"=\""+this.headers[i].value+"\"\n";
		}
		header+="width=\"100vw\" height=\"100vh\">\n";
		var footer='\n</g></svg>';
		var layerLabel="<g ";
		var layerData=this.layersData[this.layerIndex];
		for(var i=0;i<layerData.length;i++){
			
			layerLabel+=layerData[i].name+"=\""+layerData[i].value+"\"\n";
		}
		layerLabel+=">";
		var out=header+layerLabel+svg+footer;
		return out;
	}
	idle(){//overwrites animation stack and layerIndex with idle
		this.stack=JSON.parse(JSON.stringify(this.spriteSheets[this.idleIndex]));//deep copy spritesheet
		this.layerIndex=this.idleIndex;
	}
	move(){//returns next frame in stack. Idles if stack is empty.
		if(this.stack.length==0) this.idle();
		var currentFrame=this.stack.shift();
		return this.print(currentFrame);
	}
}
