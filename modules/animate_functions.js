export class sprite{//takes svg file and instruction set
	//vector sprite animation based on switching layers between visible and not
	constructor(svg){
		//set svg, relevent svg layers
		var e=document.getElementById(svg);
		var raw=e.contentWindow.document.childNodes[1].childNodes;
		var layers=[];
		var layernums=[];
		for(var i=0; i<raw.length; i++){
			//console.log(raw[i]);
			//console.log(raw[i]["inkscape:groupmode"]);
			//for(var x in raw[i]) console.log(x+": "+raw[i][x]);
			//workaround for inkscape because the "inkscape:groupmode" property contains ':'
			if(raw[i]["childNodes"].length!=0){
				layernums.push(i);
				layers.push(raw[i]);
			}
		}
		this.raw=raw;
		this.index=layernums;
		this.spriteSheets=layers;
		this.frame=raw;
	}
	
	print(){
		
	}
}
